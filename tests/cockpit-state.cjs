// No application dependencies: exercise the inline contract/model directly.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(require('node:path').join(__dirname, '../cockpit/index.html'), 'utf8');
const script = html.split('<script>')[1].split('</script>')[0];
new vm.Script(script); // Also syntax-check navigation and startup code.
const now = Date.parse('2026-10-01T12:00:00Z');
function harness(extra = {}) {
  const ctx = vm.createContext({ URL, Date: class extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  }, setTimeout, clearTimeout, AbortController, ...extra });
  vm.runInContext(script.split('// ---- one-window board navigation ----')[0], ctx);
  return { ctx, run: expr => vm.runInContext(expr, ctx) };
}
const legacy = () => ({ schema_version: 1, organ: 'brain', repo: 'PyAutoBrain', status: 'green',
  headline: 'All clear', updated: '2026-10-01T11:00:00Z', pages_url: 'https://example.invalid/', items: [] });
function view(st) { return harness({ st, now }).run('observation(st, now)'); }
test('legacy feeds remain valid and do not gain an invented freshness deadline', () => {
  const h = harness({ data: legacy() });
  assert.equal(h.run('validate(data)'), null);
  assert.equal(view({ feed: legacy() }).freshness, 'unspecified');
});
test('cached green never presents as currently healthy; cached red stays available as evidence', () => {
  for (const status of ['green', 'red']) {
    const d = { ...legacy(), status };
    const v = view({ lastGood: d, error: 'unreachable' });
    assert.equal(v.status, 'stale'); assert.equal(v.current, false);
    assert.equal(v.sourceStatus, status); assert.equal(v.feed.headline, d.headline);
    assert.equal(view({ feed: d, lastGood: d }).status, status);
  }
  assert.equal(view({}).status, 'grey');
  assert.equal(view({ lastGood: legacy() }).current, false);
});
test('missing, invalid, impossible and future dates cannot produce current green', () => {
  for (const updated of [undefined, 'broken', '2026-02-30T01:00:00Z', '2026-10-02T00:00:00Z']) {
    const d = { ...legacy(), updated };
    assert.equal(view({ feed: d }).current, false);
  }
});
test('expiry uses producer policy and the exact deadline is stale', () => {
  const d = { ...legacy(), valid_until: '2026-10-01T12:00:00Z' };
  assert.equal(view({ feed: d }).freshness, 'expired');
  d.valid_until = '2026-10-01T12:00:01Z';
  assert.equal(view({ feed: d }).freshness, 'within_policy');
  d.valid_until = '2026-09-30T00:00:00Z';
  assert.match(harness({ d }).run('validate(d)'), /valid_until/);
});
const item = () => ({ severity: 'red', text: 'Nightly failed', id: 'overnight:Example/Engine/nightly.yml',
  state: 'failed', reason: 'GitHub reports failure.', prompt: '/bug nightly',
  actions: [{ id: 'investigate', label: 'Copy investigation prompt', kind: 'prompt', target: '/bug nightly', safety: 'requires_approval' }], recommended_action_id: 'investigate' });
test('enriched feed validates, renders one copy action and escapes all producer text', () => {
  const it = item(); it.reason = '<script>alert(1)</script>';
  const h = harness({ d: { ...legacy(), items: [it] } });
  assert.equal(h.run('validate(d)'), null);
  const rendered = h.run('itemsHtml(d.items)');
  assert.equal((rendered.match(/data-cmd=/g) || []).length, 1);
  assert.match(rendered, /Approval required/); assert.match(rendered, /&lt;script&gt;/);
  assert.doesNotMatch(rendered, /<script>/);
});
test('bad action metadata, unsafe links, duplicated IDs and wrong organ are rejected', () => {
  for (const change of [it => it.actions[0].safety = true, it => it.actions[0].kind = 'shell',
    it => it.actions.push(it.actions[0]), it => it.recommended_action_id = 'missing',
    it => it.actions[0] = { id: 'x', label: 'X', kind: 'link', target: 'javascript:alert(1)' },
    it => it.requires_human_decision = true]) {
    const it = item(); change(it);
    assert.ok(harness({ d: { ...legacy(), items: [it] } }).run('validate(d)'));
  }
  assert.match(harness({ d: { ...legacy(), repo: 'Other' } }).run('validate(d, ORGANS[0])'), /wrong organ/);
});
test('explicit decisions are visible, including unclassified action safety', () => {
  const it = item(); it.requires_human_decision = true; it.decision = 'Which strategy?';
  delete it.actions[0].safety;
  const h = harness({ d: { ...legacy(), items: [it] } });
  assert.equal(h.run('validate(d)'), null);
  assert.match(h.run('itemsHtml(d.items)'), /Your decision:.*Which strategy/);
  assert.match(h.run('itemsHtml(d.items)'), /Safety unclassified/);
});
test('malformed persisted data cannot crash fetch; failed fetch then recovery updates the observation', async () => {
  let fail = true;
  const h = harness({ localStorage: { getItem: () => JSON.stringify({ feed: { status: 'green' } }), setItem: () => {} },
    fetch: async () => { if (fail) throw Error('offline'); return { ok: true, json: async () => legacy() }; } });
  await h.run('fetchOrgan(ORGANS[0])');
  assert.equal(h.run('viewFor(ORGANS[0]).status'), 'grey');
  fail = false; await h.run('fetchOrgan(ORGANS[0])');
  assert.equal(h.run('viewFor(ORGANS[0]).status'), 'green');
  fail = true; await h.run('fetchOrgan(ORGANS[0])');
  assert.equal(h.run('viewFor(ORGANS[0]).status'), 'stale');
});


test('a source with insufficient evidence cannot claim nothing needs attention', () => {
  const d = { ...legacy(), status: 'grey' };
  assert.equal(view({ feed: d }).current, false);
  assert.match(view({ feed: d }).reason, /insufficient evidence/);
  assert.doesNotMatch(harness().run('itemsHtml([], false)'), /nothing needs you/);
});

test('transport errors do not emit source transitions; genuine stale and recovery transitions still do', () => {
  const notices = [];
  const h = harness({ showNotification: (...args) => notices.push(args), flashHeart: () => {}, d: legacy() });
  vm.runInContext(script.slice(script.indexOf('function detectTransitions()'), script.indexOf('async function poll()')), h.ctx);
  h.run('state.Brain = { feed: d }; detectTransitions()');
  h.run('state.Brain = { lastGood: d, error: "unreachable" }; detectTransitions()');
  assert.equal(notices.length, 0);
  h.run('state.Brain = { feed: { ...d, status: "stale" } }; detectTransitions()');
  assert.equal(notices.length, 1);
  h.run('detectTransitions()');
  assert.equal(notices.length, 1);
  h.run('state.Brain = { feed: d }; detectTransitions()');
  assert.equal(notices.length, 2);
});
