# Deliver, built in the session — Implementation Record

**Date:** 2026-11-09
**Spec:** [spec.md](spec.md)
**Ticket:** none
**Built as:** two commits and one fix round, without `plan.md` (spec decision 7)
**Built at review tier:** none (this repo uses no tiers)

## Decisions

| # | Decision | Why | Passed over | Confirm? |
|---|---|---|---|---|
| 1 | `/advance` checks the spec status before the plan rows | Once `/deliver` commits `Status: Building`, the old staleness test re-ran `/plan` and wiped the `## Build` progress | Keep the order and define staleness more narrowly only — both are done, the order is the one that cannot regress | no |
| 2 | Screenshots live uncommitted in `screens/` beside the spec; a resume retakes missing before images | A resumed session had no path to find them; committing images grows the repo by every byte | Commit the images | no |
| 3 | `spec-gate.mjs` reads only the first word of `Review tier:` and exits 2 on usage and I/O errors | `/frame`'s line carries a reason after the tier, and an unreadable spec must not send a valid one back to be signed again | A stricter header format | no |
| 4 | CI installs `jsdom` for `check-page`'s wiring tests; locally they skip without it | The plugin ships no `node_modules`, but the DOM check is the part worth testing | Static checks only | no |
| 5 | Keep `/deliver --confirm` | It is opt-in per run and costs nothing when unused | Drop it, as Decision 3 of the spec might suggest | yes |

## Deferred

- `spec-gate.mjs` — `Review tier:` and `Risk:` are outside the fingerprint, so a heavy spec edited down to
  medium after the sign-off still passes — fingerprinting them changes what a sign-off covers, worth its
  own change.
- `onboard/templates/preview.md` — the *review command* and *several worktrees* sections go beyond
  requirement 10; kept because `/deliver` step 6 and the walkthrough name the review command.
- Commit `ec5927e` uses scope `specs`, not in the scope list — history is not rewritten for it.

## Worth knowing

- `/build` is gone with no alias. A repo onboarded on 0.6.0 keeps working only after `/onboard` runs
  again: its `.agents/` lacks `preview.md`, the ship mode, the reviewer table and the walkthrough language.
- The end review found two flow defects no single skill shows: the `/advance` re-plan loop and the
  unread risky list. Both are fixed; neither is covered by a test, because the skills are prose.
