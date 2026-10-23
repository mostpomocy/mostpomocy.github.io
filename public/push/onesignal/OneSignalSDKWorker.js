// Retired with the owner's approval on 2026-10-23.
// Keep this URL so previously registered devices receive the cleanup update.
// This worker handles only the former /push/onesignal/ scope, not the PWA /sw.js.
self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const subscription = await self.registration.pushManager.getSubscription();
    if (subscription && !(await subscription.unsubscribe())) {
      throw new Error('Former push subscription could not be disabled.');
    }
    // Do not unregister before a subscription has successfully been disabled.
    await self.registration.unregister();
  })());
});
