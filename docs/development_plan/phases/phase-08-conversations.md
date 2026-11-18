# Phase 8: Conversations

Part of the [MarketCustoms roadmap](../ROADMAP.md).

**Goal:** buyers and sellers can talk about a listing.

**User story:** as a buyer, I message the seller from the listing page and get answers in real time. As a seller, I see all my conversations in one inbox.

**Services touched:** Conversations, Notifications, web client (the "Message" button on profile and listing pages).

**Scope:**

- Conversations service: one conversation per buyer and listing, message history (MongoDB), read receipts, typing indicator.
- SignalR hub with a **Redis backplane**, running with several replicas on Kubernetes.
- An unread message triggers a notification (Phase 3) if the user is offline.
- Basic abuse controls: rate limit on sending, block a user.

**Out of scope:** attachments, moderation tools (Phase 10).

**New technology:** SignalR scale-out with a Redis backplane.

**Open decisions:** whether the Conversations hub is a separate SignalR hub or shares the Notifications connection.

**Done when:**

- [ ] Two browsers chat in real time while connected to different pods.
- [ ] History loads with pagination.
