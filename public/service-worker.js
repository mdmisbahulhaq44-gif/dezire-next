const CACHE_NAME = "venom-cache-v3"

self.addEventListener("install", () => { self.skipWaiting() })

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    )
  )
  self.clients.claim()
})

function isCacheFirst(url) {
  return url.hostname === "res.cloudinary.com"
    || url.hostname === "fonts.gstatic.com"
    || url.hostname === "fonts.googleapis.com"
}

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return
  const url = new URL(event.request.url)
  if (!isCacheFirst(url)) return

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached
      return fetch(event.request).then(response => {
        if (response.ok || response.type === "opaque") {
          const copy = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy))
        }
        return response
      })
    })
  )
})
