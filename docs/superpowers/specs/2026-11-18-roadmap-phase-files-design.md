# Roadmap phase files

## Intent

`ROADMAP.md` had grown to 36 KB, and every phase was squeezed into one section of the same shape. Phases need room to grow as they are discussed (starting with Phase 1), so each one gets its own file.

## Design

- `docs/development_plan/phases/phase-NN-<slug>.md`: one file per phase (0–10), holding the former roadmap section unchanged, with relative links adjusted and a link back to the roadmap.
- `ROADMAP.md` keeps what applies to the whole project: purpose, how to use it, principles, where we are today, the technology map, the phase overview table and diagram, the parking lot, "not in this project" and the links. The phase names in the overview table link to the phase files.
- The Phase 0 spec's link to the old roadmap anchor now points to the phase file. `STRUCTURE.md` mentions `phases/`.

## Approaches

- **One file per phase in a flat `phases/` folder** (chosen): simple, and each file can grow on its own.
- One folder per phase: too heavy for a single file each.
- Keep a summary paragraph per phase in the roadmap as well: duplicates the overview table.

## Non-goals

No changes to the content of any phase. Phase 1 brainstorming continues separately.
