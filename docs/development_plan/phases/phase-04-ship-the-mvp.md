# Phase 4: Ship the MVP

Part of the [MarketCustoms roadmap](../ROADMAP.md).

**Goal:** the MVP runs outside `aspire run`, on Kubernetes, deployed automatically.

**User story:** as the developer, merging to `main` builds the images and deploys the new version to my local cluster.

**Services touched:** all active services, Gateway, web client (production build), infrastructure.

**Scope:**

- Container images for each service, the gateway and the client (a static build served by the gateway or nginx), pushed to GitHub Container Registry (GHCR).
- Kubernetes manifests via Aspire publishing (Kubernetes/Helm output) or hand-written Helm charts. A local `kind` cluster.
- In-cluster dependencies: SQL Server, MongoDB (replica set), RabbitMQ, Redis, Azurite, Mailpit. Use Helm charts or operators where sensible.
- Configuration and secrets: Auth0 and Stripe keys as Kubernetes secrets, never in the repository.
- Ingress in front of the gateway. Health and readiness probes using the existing `/health` and `/alive` endpoints.
- CD: a GitHub Actions job that builds and pushes the images and deploys to the cluster (a self-hosted runner or a manual `helm upgrade` script, since the cluster is local).
- Observability in the cluster: an OpenTelemetry collector and a dashboard (Aspire dashboard standalone or Grafana).

**Out of scope:** Azure deployment (Phase 5), a cloud Kubernetes cluster (see the parking lot), autoscaling tuning.

**New technology:** Docker images, Kubernetes, Helm, GHCR, CD.

**Open decisions:**

- Aspire-generated manifests vs hand-written Helm charts.
- How CD reaches a local cluster: a self-hosted runner vs GitOps (Argo CD / Flux) pulling from the repository.

**Done when:**

- [ ] `kind` cluster with the whole MVP. The full buy flow works through the ingress.
- [ ] A merge to `main` results in new pods running the new image tags.
- [ ] Killing a pod mid-checkout does not lose the order (outbox plus RabbitMQ redelivery).
