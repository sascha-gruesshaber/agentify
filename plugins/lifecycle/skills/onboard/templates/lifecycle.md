# The lifecycle, as this repo runs it

Which phases run, how much the owner reads, and which reviews are worth their cost here.

## Phases

| Phase | Skill | On? | Notes |
|---|---|---|---|
| frame the request | `/frame` | yes | proposes the path, the review tier and the risk |
| grill the design | `/grill` | yes | |
| write the spec | `/spec` | yes | shows the spec walkthrough and records the sign-off |
| plan against the code | `/plan` | yes | |
| check the plan | `/plan-check` | yes | |
| build it | `/deliver` | yes | the session builds; fresh agents review |
| open the review | `/ship` | <yes / no> | per the ship mode in `forge.md` |
| tend the review | `/babysit` | <yes / no> | per the ship mode in `forge.md` |

**The fast path.** A change that needs the word "and" to describe takes the full path. Everything
below that skips straight to a commit:

- <a single-file documentation edit>
- <a dependency bump>
- <a one-line fix with an existing test>

**The ratchet is one way.** Hidden complexity found later upgrades the path. Nothing downgrades
mid-flight, and reaching for a lighter label to skip work *is* the doubt that means you should take
the heavier one.

## Review tiers

<Delete this section if the repo does not use tiers; specs are then built without a sign-off.>

The owner's attention goes to what is built and how it feels, not to every line. Reviewers and CI read
the code; the owner reads two pages. The fast path and a bug fix with no new behaviour have no tier.

| Tier | When | What the owner does |
|---|---|---|
| **light** | no UI change, no new behaviour a user or another system can observe, and a two-way door | agrees to the spec in the chat; reads the review description at the end |
| **medium** | everything that is neither light nor heavy | signs off the spec walkthrough; checks the screens and answers the decisions on the review walkthrough |
| **heavy** | sets a pattern later work will copy (a new seam, flow, shared component or convention), is a one-way door, or has a `Risk:` other than `none` | as medium, plus the pattern review on the review walkthrough |

- **Heavy wins.** A change that meets heavy's definition is heavy, even when it also meets light's.
- **`/frame` proposes it, the spec states it, the sign-off confirms it.** `/deliver` judges it again from
  the diff, only upward; a raise goes into the record and the review description, never into the spec.
- **A decision still unanswered when the review merges accepts the recommendation that is built.**

## Reviewers

The end review sends one fresh `change-reviewer` per row, all at once. Lens bodies are in the plugin's
`deliver/prompts.md`. **Group lenses into few reviewers**: every agent pays a fixed start-up cost.

| Reviewer | Lenses | Runs |
|---|---|---|
| spec alignment | spec alignment · over-engineering · adjacent | always |
| correctness | correctness · test gaps | always |
| repo standards | repo standards · docs completeness | always |
| <security & permissions> | <security & permissions> | <when the diff touches auth, permissions or tenant scoping> |
| <UI patterns> | <UI patterns> | <when the front end changed> |
| <a reviewer for a failure mode this repo keeps having> | <its lens> | <when> |

**Not in use here, and why:** <lens> — <reason>. A lens nobody drops is a lens nobody chose.

**Risky tasks** — the ones that get their own review before the next task starts — are those touching:
<authentication, tenancy, permissions, a migration or a wire contract — adjust to this repo's list>.

## Effort and budget

**Plan paying for this:** <Pro | Max 5x | Max 20x | API billing>
**Profile taken:** <the matching one from the plugin's `onboard/plan-profiles.md`, adjusted where noted>

What a single call is allowed to cost. **The number of agents moves cost far more than the tier does**,
and a cheaper reviewer that misses a defect is the most expensive review there is.

| Role | Model | Effort* | Soft output ceiling |
|---|---|---|---|
| the session — builds every task, fixes every finding | the session's | high | — |
| `code-scout` — locate code, cite `path:line` | sonnet | low | 800 |
| `spec-reviewer` — one lens on a spec | sonnet | medium | 400 |
| `spec-reviewer` — the implementability lens | opus | high | 600 |
| `change-reviewer` — plan check, all axes | opus | high | 800 |
| `change-reviewer` — task review, screens review | opus | high | 400 |
| `change-reviewer` — one end-review reviewer | opus | high | 600 |
| `finding-fixer` — review comments, via `/babysit` | sonnet | medium | 300 |

***Effort is only settable where the harness exposes it.*** A subagent dispatch usually takes a model
but no effort, so the agent inherits the session's. Treat the column as intent: it says which calls
deserve a high-effort session, not a flag anybody can pass.

**Ceilings are in output tokens, and they are soft.** A callee that cannot finish inside its ceiling
returns `reviewer-uncertainty` and says what it did not reach. **It never returns a shallow pass that
fits the budget** — the caller cannot tell that apart from a clean result, and would ship on it.

### Per-phase ceilings

Not enforced by anything. They are the number at which a run should stop and ask whether it is still
doing the right thing.

| Phase | Rough ceiling | What blows it |
|---|---|---|
| `/frame` | <30k> | scouting a codebase nobody has mapped |
| `/spec` + its cold reads | <80k> | a second review round |
| `/plan` + `/plan-check` | <150k> | re-planning after a Not ready verdict |
| `/deliver`, per task | <60k> | a task the plan under-specified |
| the end review + its fix round | <150k> | the reviewer count above, more than anything else |

### If a limit is hit, cut in this order

Ranked by value per token. The full table is in the plugin's `onboard/plan-profiles.md`.

1. drop conditional reviewers, then merge standing ones
2. mark fewer tasks risky — only what truly touches the risky list above
3. skip the screens review below the heavy tier
4. no second end-review pass

**Never cut the implementability spec review or plan-check's claims axis**, whatever the plan. They are
the two places where a small spend prevents a large one.

### When to spend more, deliberately

- a diff of more than ~15 changed files, on the correctness or spec-alignment reviewer
- any change touching auth, permissions, tenancy, a migration or a wire contract
- a reviewer that came back `clean` on a diff you have concrete reason to distrust

**Say in one line when you escalate, and why.** Silently overspending and silently underspending are the
same defect.

## Loop caps

| Loop | Cap | Then |
|---|---|---|
| fix rounds per review | 1 | what is not fixed goes into the record as deferred, with the reason |
| end-review passes | 2 | the second only with a written reason, scoped to the fix range and the reviewers that found a `must` |
| re-plan after a Not ready verdict | 1 | fetch a human — twice means the premises are wrong |
| spec cold-read rounds | 2 | the second only if the first changed the design |
| grilling rounds | none | ends when the frontier is empty, or the user stops it |

## Worktrees

- **One feature, one tree:** `.claude/worktrees/<branch with / → +>`. <Or: this repo cannot be checked
  out twice — work happens on a branch in the main checkout, one feature at a time.>
- **Making a fresh tree ready:** <the command — see `gates.md` § *Generated files*>.

## Where specs go

See [`tracker.md`](tracker.md).
