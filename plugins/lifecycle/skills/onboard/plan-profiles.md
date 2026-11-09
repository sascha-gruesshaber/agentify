# Picking tiers and reviewers for the plan you are actually on

Read this with `/onboard` question 6. It turns "how much may one call cost" into four ready-made
profiles, because the honest answer depends on something the repo cannot tell you: **which subscription
is paying for the run.**

> **This is calibrated on one project, not a benchmark.** The numbers below come from one production
> repo where this lifecycle built many features over several months. Treat
> the *shape* as advice and the numbers as a starting point. **Plan names and prices change** — check
> current pricing rather than trusting the figures here; the profile is the durable part.

## First, what actually burns the budget

1. **The number of agents.** Every agent pays a fixed start-up cost — on the order of 15–20k tokens —
   before it reads a line. Eight reviewers reading the same diff pay it eight times. **This is the
   single biggest lever**, and why `/deliver` groups lenses into a few reviewers and builds in the session
   instead of handing tasks to implementer agents.
2. **The session's own length.** `/deliver` builds every task in one session; a long plan is a long
   session. Compaction carries it, and the plan's `## Build` checklist is what makes a fresh session
   resume cheaply.
3. **The tier.** Real, but third — and see the trap below before you reach for it.

## The trap: cut agents before you cut tier

**A cheap model on hard work often costs more than an expensive one.** It takes two or three times the
turns, misses what it was sent to find, and you pay for the miss later. A reviewer on a cheaper tier that
returns `clean` on a real defect is the most expensive review there is.

So when the budget is tight, in this order:

1. **Fewer reviewers.** Merge lenses into the standing reviewers; drop conditional ones by the cut order.
2. **Fewer task reviews.** Mark only what truly touches auth, tenancy, permissions, a migration or a wire
   contract as `Risky: yes`.
3. **Only then** a cheaper tier for a reviewer, and expect it to miss things.

## The four profiles

### Pro — roughly €20/month

Real constraint. Assume the most capable tier is scarce, and plan for it rather than discovering it
mid-run.

| Setting | Value |
|---|---|
| spec cold reads | **1 lens: implementability** |
| plan-check | **keep it** — one reviewer, all eight axes, sonnet |
| task review (risky tasks) | **keep it**, sonnet |
| screens review | only for a heavy tier |
| end review | **2 reviewers: correctness · spec alignment** |
| fix rounds | 1 per pass, 1 pass |

**Also worth doing on Pro:** take the fast path more often. `/frame` offers it, and a change that
genuinely does not need a contract should not get one.

### Max 5× — roughly €100/month

**The measured working point.** One feature at a time, a full working day within the window.

| Setting | Value |
|---|---|
| spec cold reads | all 4 |
| plan-check | one reviewer, all 8 axes, opus |
| task review (risky tasks) | opus |
| screens review | every UI task |
| end review | the 3 standing reviewers, conditional ones on their trigger, opus |
| fix rounds | 1 per pass, 2 passes at most |

### Max 20× — roughly €200/month

Headroom for the full shape, and for two features in two worktrees at once.

| Setting | Value |
|---|---|
| spec cold reads | all 4, opus on implementability and scope |
| plan-check | one reviewer, all 8 axes, opus |
| task review, screens review | as Max 5× |
| end review | standing + conditional reviewers, opus; the most capable tier on a diff you distrust |
| fix rounds | 1 per pass, 2 passes at most |

**Above two features at once, the binding limit stops being the plan and becomes you.** Every finished
feature ends at a walkthrough a person reads; more in flight means walkthroughs get skimmed, which is the
failure the reviews existed to prevent.

### API or console billing

No rolling window, so nothing stops a runaway — the failure mode inverts. **The per-phase ceilings in
`.agents/lifecycle.md` do the work here**, and they are the section to actually fill in rather than
leave as defaults.

## The cut order

When something has to go, drop from the bottom. This is ranked by **value per token**, not by how
thorough it feels:

| Keep | Why it earns its cost |
|---|---|
| 1 · **implementability**, on the spec | One call, and it can prevent a whole wrong build. Best ratio in the kit. |
| 2 · **plan-check's claims axis** | Greps and file opens. Cheap, and it stops work being built on fiction. |
| 3 · **correctness**, in the end review | Finds real bugs, with a repro attached. |
| 4 · **spec alignment**, in the end review | Catches what the build drifted from, which nobody inside the session can see. |
| 5 · **the task review** on a risky task | Catches an auth or contract mistake before later tasks build on it. |
| — | *cut from here down first* |
| 6 · the screens review | Real value on a new screen; a person still looks at the walkthrough. |
| 7 · test gaps, over-engineering, adjacent | Cheap to fix later; nothing breaks meanwhile. |
| 8 · repo standards | Largely what a linter and a formatter already enforce. |
| 9 · docs completeness | The most deferrable. Costs nothing today and something in six months. |

**Never cut 1 or 2**, whatever the plan. They are the two places where a small spend prevents a large
one, and cutting them is how a tight budget becomes an expensive rebuild.

## When you hit a limit mid-run

- **Finish and commit the task in flight**, with its `## Build` line checked. A half-built task is the
  most expensive thing to come back to.
- **Stop there.** `/lifecycle:advance` picks the run up from disk later, at the first unchecked line —
  that is what the checklist is for.
- **Then cut by the order above and resume.** Do not re-run the same review on a cheaper tier and hope;
  that pays twice for one result.
