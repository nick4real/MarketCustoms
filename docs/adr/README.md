# Architecture decision records

An ADR records one decision: the context, the options considered, the decision and its consequences. ADRs explain why the code looks the way it does, so a later change can revisit a decision deliberately instead of by accident.

## When to write one

- A new technology or library is chosen (for example a messaging library or a search client).
- An open decision from the [roadmap](../development_plan/ROADMAP.md) is settled.
- A documented decision is changed. Write a new ADR and mark the old one as superseded; don't rewrite the old one.

Small, local choices that are easy to reverse don't need one.

## How

1. Copy [0000-template.md](0000-template.md) to `NNNN-kebab-title.md`, using the next free number.
2. Fill in every section and set the status: `Proposed` while it's being discussed, `Accepted` once decided, `Superseded by NNNN` when replaced.
3. Add it to the index below.

## Index

| # | Decision | Status |
| --- | --- | --- |
| [0001](0001-github-flow.md) | GitHub flow | Accepted |
| [0002](0002-single-ci-workflow.md) | Single CI workflow | Accepted |
| [0003](0003-auth0-roles-and-permissions.md) | Auth0 roles and permissions | Accepted |
