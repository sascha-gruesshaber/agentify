# The lifecycle, as this repo runs it

Which phases run, how much the maintainer reads, and which reviews are worth their cost here.

## Phases

| Phase | Skill | On? | Notes |
|---|---|---|---|
| frame the request | `/frame` | yes | |
| grill the design | `/grill` | yes | |
| write the spec | `/spec` | yes | first run creates `docs/specs/` |
| plan against the code | `/plan` | yes | |
| check the plan | `/plan-check` | yes | |
| build it | `/deliver` | yes | the session builds; fresh agents review |
| open the review | `/ship` | yes | ship mode `review` — see [`forge.md`](forge.md) |
| tend the review | `/babysit` | on request | not part of the ship mode; run it by name |

**The fast path.** A change that needs the word "and" to describe takes the full path. Everything below
that skips straight to a commit:

- a single-file documentation edit — `README.md`, `CONTRIBUTING.md`, `ATTRIBUTION.md`, one plugin README
- a version bump across `plugin.json` and `marketplace.json` together
- a typo or one-line wording fix inside one skill, with `skills.mjs check` still clean
- adding a CI step that only greps, with nothing else changed

**Not fast, however small it looks:** any edit under `skills/_shared/fragments/` (it rewrites up to 18
tracked files), and anything that changes what a skill *does* rather than how it reads.

**The ratchet is one way.** Hidden complexity found later upgrades the path. Nothing downgrades
mid-flight, and reaching for a lighter label to skip work *is* the doubt that means you should take the
heavier one.

## Review tiers

**Not used here.** A single maintainer reads every change in full, so a walkthrough would add ceremony
without saving attention. Specs carry no `Review tier:` line and are built without a sign-off.
Recorded as a choice, not an oversight: if a second contributor ever builds here, revisit it.

## Reviewers

The end review sends one fresh `change-reviewer` per row, all at once. Lens bodies are in the plugin's
`deliver/prompts.md`.

| Reviewer | Lenses | Runs |
|---|---|---|
| spec alignment | spec alignment · over-engineering · adjacent | always |
| correctness | correctness · test gaps | always; `test gaps` **only if anything under a `tools/` directory or `check-page.mjs` changed** |
| repo standards | repo standards · docs completeness | always |

**Not in use here, and why:**

- **UI patterns** — never. There is no front end, no component, no page. It can never apply.
- **security & permissions** — never. There is no auth, no tenancy, no permission model, no runtime that
  handles a request. It can never apply.

Both are recorded as *never applicable*, not as *dropped for cost*. If this repo ever grows either, this
line is wrong and the lens comes back.

**Why `docs completeness` is an always here** and not the most deferrable lens it usually is: this repo's
product *is* documents. `README.md` mirrors what ships in four tables, and `CONTRIBUTING.md` § *What is
not proved yet* is a live list. Drift there is a defect in the deliverable, not a stale comment. See
[`docs.md`](docs.md) § *Docs are part of done*.

**Why `test gaps` is conditional:** for a markdown skill there is no test that can fail, so the lens
would push toward a test that asserts prose still exists. It earns its cost only on the `.mjs` tools. See
[`gates.md`](gates.md) § *What "test-first" means here*.

**Risky tasks** — the ones that get their own review before the next task starts — are those touching:
`skills.mjs`, `fragments.json` or a fragment (one edit reaches up to 18 files), `spec-gate.mjs` (it gates
every build), or the shape of `.agents/` (every consumer's install disagrees with a changed template).

## Effort and budget

**Plan paying for this:** Max 5×
**Profile taken:** the Max 5× profile from the plugin's `onboard/plan-profiles.md`, **unchanged.**

| Setting | Value |
|---|---|
| spec cold reads | all 4 |
| plan-check | one reviewer, all 8 axes, opus |
| task review (risky tasks) | opus |
| screens review | never — no UI |
| end review | the 3 reviewers above, opus |
| fix rounds | 1 per pass, 2 passes at most |

What a single call is allowed to cost. **The number of agents moves cost far more than the tier does**,
and a cheaper reviewer that misses a defect is the most expensive review there is.

| Role | Model | Effort* | Soft output ceiling |
|---|---|---|---|
| the session — builds every task, fixes every finding | the session's | high | — |
| `code-scout` — locate code, cite `path:line` | sonnet | low | 800 |
| `spec-reviewer` — one lens on a spec | sonnet | medium | 400 |
| `spec-reviewer` — the implementability lens | opus | high | 600 |
| `change-reviewer` — plan check, all axes | opus | high | 800 |
| `change-reviewer` — task review | opus | high | 400 |
| `change-reviewer` — one end-review reviewer | opus | high | 600 |
| `finding-fixer` — review comments, via `/babysit` | sonnet | medium | 300 |

***Effort is only settable where the harness exposes it.*** Some subagent dispatches take an effort,
some do not; where one does not, the agent inherits the session's. Pass the column where you can, and
otherwise read it as the effort this session should run at.

**Ceilings are in output tokens, and they are soft.** A callee that cannot finish inside its ceiling
returns `reviewer-uncertainty` and says what it did not reach. **It never returns a shallow pass that
fits the budget** — the caller cannot tell that apart from a clean result, and would ship on it.

### Per-phase ceilings

Not enforced by anything. They are the number at which a run should stop and ask whether it is still
doing the right thing. **These are set low, because this is a small repo** — under a hundred
tracked files, three tested tools. A phase that blows one of these is almost certainly re-reading things it already read.

| Phase | Rough ceiling | What blows it |
|---|---|---|
| `/frame` | 20k | scouting more than the two or three files a change here touches |
| `/spec` + its 4 cold reads | 60k | a second and third review round |
| `/plan` + `/plan-check` | 100k | re-planning after a Not ready verdict |
| `/deliver`, per task | 40k | a task the plan under-specified |
| the end review + its fix round | 100k | the reviewer count above, more than anything else |

### If a limit is hit, cut in this order

Ranked by value per token. The full table is in the plugin's `onboard/plan-profiles.md`.

1. no second end-review pass
2. drop, from the bottom up: test gaps (if it was even on), adjacent, over-engineering, repo standards
3. mark fewer tasks risky — only the list above

**Never cut the implementability spec review or plan-check's claims axis**, whatever the plan. They are
the two places where a small spend prevents a large one.

**Do not cut `docs completeness` here** unless nothing outside `plugins/` moved. In this repo it is
checking the deliverable, not a comment.

### When to spend more, deliberately

- a change under `skills/_shared/fragments/`, on the correctness lens — one edit reaches up to 18 files
- a change to `skills.mjs` or `fragments.json`, on correctness and test gaps — it is the gate itself
- a change that alters what a skill *does*, on spec alignment — CI cannot see behaviour, only consistency
- a reviewer that came back `clean` on a diff you have concrete reason to distrust

**Say in one line when you escalate, and why.** Silently overspending and silently underspending are the
same defect.

## Loop caps

| Loop | Cap | Then |
|---|---|---|
| fix rounds per review | 1 | what is not fixed goes into the record as deferred, with the reason |
| end-review passes | 2 | the second only with a written reason, scoped to the fix range and the reviewers that found a `must` |
| re-plan after a Not Ready verdict | 1 | fetch a human — twice means the premises are wrong |
| spec cold-read rounds | 2 | the second only if the first changed the design |
| grilling rounds | none | ends when the frontier is empty, or the user stops it |

## Worktrees

**This repo can be checked out twice.** No database, no build output, no absolute paths; `skills.mjs`
resolves everything relative to the plugin root, and `.claude/worktrees/` is already gitignored.

- **One feature, one tree:** `.claude/worktrees/<branch with / → +>`. A fresh tree needs nothing: there
  is nothing to install or generate.
- **Two features at once** collide on the fragments, `fragments.json`, `README.md`'s tables and the
  version pair. Merge one before starting the other, or expect to resolve them.

## Where specs go

See [`tracker.md`](tracker.md).
