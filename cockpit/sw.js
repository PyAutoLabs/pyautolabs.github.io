// PyAuto Cockpit service worker: caches the page shell only, never the feeds.
// Network-first for everything; the cache is a fallback for the shell URLs so the
// installed app still opens offline (it then shows each organ's last good feed
// from localStorage, marked unreachable).
const CACHE = "pyauto-cockpit-shell-v1";
const SHELL = ["/cockpit/", "/cockpit/index.html"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const isShell = url.origin === self.location.origin && SHELL.includes(url.pathname);
  // Feeds (state.json) and everything else: straight to the network, never cached.
  if (!isShell) return;
  event.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(url.pathname, copy));
        }
        return res;
      })
      .catch(() => caches.match(url.pathname))
  );
});

// Focus (or open) the cockpit when a status-change notification is tapped.
self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
      for (const c of list) if ("focus" in c) return c.focus();
      return self.clients.openWindow("/cockpit/");
    })
  );
});
