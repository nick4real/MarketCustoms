# Phase 3: Fulfilment and notifications

Part of the [MarketCustoms roadmap](../ROADMAP.md).

**Goal:** close the loop: ship, confirm, pay the seller, and keep everyone informed.

**User story:** as a seller, I'm notified about a paid order, enter a tracking number and get paid once the buyer confirms receipt. As a buyer, I'm notified when my order ships.

**Services touched:** Deliveries, Payments, Notifications, Ordering, Profiles, web client.

**Scope:**

- Deliveries: the seller enters a carrier name and tracking number, and the order becomes `Shipped`. The buyer confirms receipt, and the order becomes `Completed`. Auto-confirm after N days.
- Stripe Connect (Express accounts, test mode): seller onboarding from the profile settings, and a transfer to the seller (minus a platform commission) when an order is `Completed`.
- Notifications: consumes order events from RabbitMQ and sends email (order placed, paid, shipped, completed). Locally, emails go to **Mailpit** running in Aspire.
- SignalR hub in Notifications for live in-app notifications and order status updates. The client shows a notification bell and refreshes order state without reloading.

**Out of scope:** carrier APIs and label printing, disputes (Phase 10), SMS or push notifications.

**New technology:** Stripe Connect, SignalR.

**Open decisions:**

- Email provider for a "real" setting (SendGrid vs Azure Communication Services) behind an `IEmailSender` abstraction. Locally it's always Mailpit.
- SignalR authentication with Auth0 tokens (access token in the query string for WebSockets).
- Commission rate and where it's configured.

**Done when:**

- [ ] The full MVP story works from the browser: list → buy → ship → confirm → the payout appears in the Stripe test dashboard.
- [ ] Each status change produces an email in Mailpit and a live notification in an open browser tab.
