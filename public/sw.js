/* global self,Response,location */

self.addEventListener('install', function (event) {
  // The promise that skipWaiting() returns can be safely ignored.
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', function (event) {
  if (!event.request.url.startsWith(location.origin + '/export')) return
  event.respondWith(async function () {
    // Try to get the response from a cache.
    console.log('trying to get response')
    const cachedResponse = await self.caches.match('tiles.tar')
    // Return it if we found one.
    console.log('cachedResponse', cachedResponse)
    return new Response(cachedResponse.body, {
      status: 200,
      headers: {
        'Content-Type': 'application/octect-stream; charset=utf-8'
      }
    })
  }())
})
