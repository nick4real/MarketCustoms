# Phase 9: Analytics

Part of the [MarketCustoms roadmap](../ROADMAP.md).

**Goal:** sellers see how their listings perform.

**User story:** as a seller, I see views, conversion rate and revenue per listing and over time.

**Services touched:** Analytics, Catalog, Ordering, Gateway, web client (seller dashboard).

**Scope:**

- Kafka (KRaft mode) in the AppHost and the cluster.
- Producers: listing viewed, search performed, order completed (published from the gateway, Catalog and Ordering).
- Analytics service consumes the topics and builds aggregates (per listing, per day) in its own store.
- Seller dashboard charts in the client.
- Replaying a topic rebuilds the aggregates.

**Out of scope:** a data warehouse, marketplace-wide admin KPIs (can follow in Phase 10).

**New technology:** Kafka.

**Open decisions:** client library (`Confluent.Kafka`); schema format (JSON vs Avro with a schema registry); aggregate store.

**Done when:**

- [ ] Viewing a listing updates its view count on the seller dashboard within seconds.
- [ ] Deleting the aggregates and replaying the topics produces the same numbers.
