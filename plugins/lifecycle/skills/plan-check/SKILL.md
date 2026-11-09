---
name: plan-check
description: Adversarially review an implementation plan before anyone builds it — open every path the plan cites, verify every claim it makes about the repository with a command, check it against the spec and the repo's own rules, and return a Ready / Ready with changes / Not ready verdict. Read-only; it judges a plan and never revises one. Use before starting a build, on a plan written days ago, or on one somebody else wrote. Keywords - plan check, review the plan, is this plan sound, safe to start, sanity check the plan, verify the claims, not ready.
---

# Plan check (a plan → a verdict)

Review a plan **before it is built**, the way a code review works after.

> **A plan is the only artefact in the flow with no independent review.** Code gets a review after each
> risky task and fresh reviewers over the whole diff; the plan every one of them is measured against was written once, by one
> model, and read once by a human seeing it for the first time. That is backwards. A wrong plan is the
> cheapest thing here to fix and the most expensive to miss, because everything after it is built
> correctly on top of the mistake.

A plan is a **prediction, and nothing compiles it.** Its claims about the codebase are true when written
and quietly rot. So this skill spends its effort on the one thing a reader cannot do quickly by eye:
**checking the plan's assertions against the repository as it is now.**

<!-- shared:repo-config:start source=repo-config.md -->
**This repo describes itself in `.agents/`, at the repository root. Read the files that bind your step,
and treat them as authority over anything you would otherwise assume.**

| File | Answers |
|---|---|
| `.agents/lifecycle.md` | which phases run, the review tiers, which reviewers and lenses are in use, how many rounds each loop gets |
| `.agents/gates.md` | the commands that must pass, in order, and what "green" means here |
| `.agents/tracker.md` | where specs live, and what may be written to the board |
| `.agents/forge.md` | the git host, the ship mode, and how a branch becomes a reviewed change |
| `.agents/preview.md` | how to bring the app up, seed a scenario and screenshot a screen, and where the design reference lives |
| `.agents/docs.md` | where architecture truth lives, the glossary, and what "docs are part of done" costs |
| `.agents/naming.md` | branch, commit, directory and test-name grammar |
| `.agents/working-agreement.md` | working hours, what may run unattended, how to report, the walkthrough language, when to stop and ask |

Three rules:

- **A missing file is a real answer: that thing is not configured here.** Say so in one line and take
  the safest reading — do not invent the repo's conventions, and do not fall back on another project's.
  If the whole directory is absent, stop and tell the user to run `/onboard` instead of guessing.
- **`.agents/` beats your own judgement, and loses to the user.** It was written deliberately, so a rule
  you disagree with is reported once, not routed around.
- **Read only what your step needs.** Every line costs on every turn of a long run.
<!-- shared:repo-config:end -->

## When NOT to use

- To review code that exists → the review catalogue in [`deliver`](../deliver/SKILL.md).
- On a change too small to have had a plan.
- To settle an open design question the plan rests on → [`grill`](../grill/SKILL.md) first. A plan
  review cannot tell you what the user wanted.

## Step 1 — Read both documents

The plan and **the spec it argues from**. The spec is the binding authority; the plan is its argument.
Where they disagree, the spec wins and the disagreement is a finding.

## Step 2 — Send one reviewer with every axis

Spawn **one** [`change-reviewer`](../../agents/change-reviewer.md) with all eight axes below as one
checklist, and the plan path and the spec path. **Never paste either into the prompt.** Eight agents
reading the same two documents pay the start-up cost eight times for the same read; one agent with a
checklist finds the same things.

Ask it to label every finding with its axis, and to put the claims table first: checking claims against
the repository is the axis this skill exists for.

<!-- shared:no-prejudging:start source=no-prejudging.md -->
**Never tell a reviewer what not to flag.** If the prompt you are writing contains "do not flag", "don't
treat X as a defect", "at most Minor", or "the spec chose this" — stop. You are pre-judging, and the
reason is almost always to spare yourself a review round.

Let the reviewer raise it. Adjudicate it afterwards, in the open, and record the ruling.

Two rules that follow:

- **Do not add open-ended directives** — "check all uses", "run the race tests if useful" — without a
  concrete, task-specific reason. They cost a reviewer's whole budget and return nothing.
- **Do not ask a reviewer to re-run the gates the session already ran on the same commit.** The
  commit is gated; a reviewer reads, it does not rebuild.

**Triage is the caller's job, not the reviewer's.** A reviewer that filters while it looks leaves buckets
empty for the wrong reason: cover first, filter second, and judge severity as a separate pass over a list
that already exists.
<!-- shared:no-prejudging:end -->
<!-- shared:budget:start source=budget.md -->
**How much a call is allowed to cost is configured, not improvised.** `.agents/lifecycle.md` § *Effort
and budget* sets, per role: the **model tier**, the **reasoning effort**, and a **soft output ceiling**.
Read it before dispatching. Pass the tier; pass the effort too where your harness's dispatch takes one,
and otherwise treat it as the effort this session should run at.

Four levers, in the order they actually move cost:

1. **How many agents** — every agent pays a fixed start-up cost, so grouping lenses into fewer reviewers
   is the largest lever by a distance.
2. **Which tier** — a cheap tier on a call whose shape is already written down.
3. **How much effort** — reasoning effort per call, independent of tier.
4. **The output ceiling** — how long a report may run.

**The ceiling is an instruction to the callee, not an enforced limit.** So it is written as a
consequence, and the consequence is never "skim":

> Stay under about `<n>` output tokens. **If the work does not fit, return `reviewer-uncertainty` and say
> what you did not reach — never a shallow pass inside the budget.**

A truncated report that reads as complete is the one outcome worse than an expensive one, because the
caller cannot tell the difference and ships on it.

Two rules that keep a budget honest:

- **Report what a phase cost** when the run is over: calls made, tier each ran on, and anything that hit
  its ceiling. A budget nobody measures is a preference.
- **A budget is a default, not a cap on judgement.** Where a call genuinely needs more — a diff far past
  what one reviewer can hold, a security lens over a permission change — take the higher tier and **say in
  one line that you did and why.** Silently overspending and silently underspending are the same defect.

**A budget is tight because of the subscription, not the repo**, so `.agents/lifecycle.md` records which
plan is paying and which profile was taken. When it says a lens was dropped for **cost** rather than
relevance, do not helpfully add it back.

If `.agents/lifecycle.md` sets no budget, say so once and use the defaults in this document's own model
table.
<!-- shared:budget:end -->
<!-- shared:review-budget:start source=review-budget.md -->
**A review pass is a fixed number of agents, and the number of passes is fixed too.** Rounds after the
first mostly return wording, not defects. `.agents/lifecycle.md` § *Reviewers* names the reviewers; the
shape below holds whatever they are.

| Phase | Agents | Passes |
|---|---|---|
| spec written | one `spec-reviewer` per lens, in one message | 1, and a second **only** if the first changed the design — then **one** agent over the changed sections |
| plan written | 1 `change-reviewer`, every axis in one checklist | 1, no repeat |
| risky task built | 1 `change-reviewer`, the *task review*, before the next task starts | 1 fix round, no re-review |
| UI task built | 1 `change-reviewer`, the *screens review*, on that task's images | 1 fix round, no re-review |
| last task built | the standing reviewers plus one per triggered conditional reviewer, in one message | 2 at most; the second needs a written reason and is scoped to the fix range and to the reviewers that found a `must` |

**A task gets its own review only when the plan marks it `Risky: yes`:** it touches what
`.agents/lifecycle.md` § *Reviewers* lists as risky — by default authentication, tenancy, permissions, a
migration or a wire contract. Every other task is read by the end review.

**One fix round per pass, by the session that wrote the code.** What it does not fix goes into the
implementation record as a deferral, with the reason — never into another review round.

**Never argue with a finding by sending another reviewer.** Settle it yourself, in the open.

**Spending more than this is the user's call, never a quiet one of yours.** Say what another pass would
look at and what it would cost, and let them ask.
<!-- shared:review-budget:end -->

## The eight axes

1. **Coverage.** The plan delivers the spec in full. Name anything the spec asks for that no task
   touches. A plan silent about part of its spec has not deferred that part — it has lost it.

2. **Claims about the codebase.** A plan is mostly assertions: this file exists, that handler is the
   template, this behaviour is missing, there are five call sites. **Every one is checkable, and you are
   the last person who can check them cheaply.** Open every `path:line` the plan cites. Report each
   claim with **the command you ran and what it printed**. Pay particular attention to:
   - *"already exists" / "already implemented"* — if true the task should not exist; if false the plan
     is missing work;
   - *counts* — "the five sites" that nobody confirmed should have read "every site";
   - *negative claims* — "nothing else calls this" needs a repository-wide search, and these are the
     assertions most often carried over from a stale reading.

3. **Convention compliance.** Against **this** repository's rules, not a generic standard — everything
   `.agents/docs.md` names: the glossary, the conventions, the documented seams, the accepted decisions.
   A documented seam and an accepted decision are **constraints, not suggestions.**

4. **Executability.** Every task names its files and how it will be verified. No placeholders —
   "implement the handler" is not a task and `TODO` in a plan is a defect. Every command runnable as
   written, with no machine-specific path and no credential that will not exist elsewhere.

5. **Sequencing and interfaces.** Task N can run once N−1 is done, and each task leaves the tree
   building. **`## Build` lists every task in order, a review line after every task marked `Risky: yes`
   and a screens line after every task with `Screens:`, and ends with the end review.** **Cross-check every `Consumes` against the matching `Produces`** — a name or a type that
   does not line up is the conflict that shows up at integration, and it is free to find here.

6. **Risk and blast radius.** Migrations, permissions and tenancy, public contracts, message schemas,
   deploy ordering, backward compatibility. **A task that touches what `.agents/lifecycle.md` § *Reviewers*
   lists as risky** (by default authentication, tenancy, permissions, a migration or a wire contract)
   **and says `Risky: no` is a blocking finding.** Ask what happens if this ships half-applied, because sooner
   or later something will.

7. **Testability.** The tests the plan names actually observe the behaviour, at a seam that exists or
   that the plan creates deliberately. Reject any test whose expected value is computed the way the code
   computes it — it passes by construction and can never disagree with the implementation. Check the
   plan clears the coverage floor in `.agents/gates.md`.

8. **Scope.** Work the spec did not ask for, work it asked for that is missing, and work that
   re-implements something the codebase already has. All three are findings, and **the third is the one
   a plan review is uniquely placed to catch** — after implementation it just looks like code.

## Step 3 — The conflict table

While the reviewer runs, build one table yourself. It is cheap and it catches what a checklist read
cannot see.

- **One row for every pair of tasks that share a file or an interface** — the two tasks, what one
  produces against what the other consumes, and what you found.
- **One row for every task** — whether its own text agrees with itself: the tests it specifies against
  the code it specifies, the files it creates against the files it later touches.

**"The scan is clean" without those rows is not a scan you ran.** Write the table into the report even
when every row says "no conflict".

<!-- shared:evidence-before-claims:start source=evidence-before-claims.md -->
**If you have not run the command in this message, you cannot say it passes.**

Before any statement that work is done, fixed, passing or ready:

1. Name the command that would prove the claim.
2. Run it in full. Not a subset, not a remembered earlier run.
3. Read the whole output and the exit code.
4. State the claim **with** the evidence, or state what actually happened.

| Claim | What proves it | What does not |
|---|---|---|
| tests pass | the test command's output, 0 failures | a previous run, "should pass" |
| build succeeds | exit 0 from the build | the linter passing |
| lint clean | the linter's output, 0 errors | a partial check |
| the bug is fixed | the original symptom, retested | the code changed |
| the agent finished | `git diff` / `git log` in its tree | the agent reporting success |
| the requirement is met | that requirement checked by name | the suite being green |

**Report what happened, not what you hoped.** A failing gate is reported with its output. A skipped step
is reported as skipped. Words that imply success without evidence — "should", "probably", "looks
right" — are the same violation as claiming it outright.
<!-- shared:evidence-before-claims:end -->

## Step 4 — The verdict

Write `plan-check.md` beside the plan and commit it with the plan.

```markdown
**Date:** YYYY-MM-DD
**Plan:** `<path to plan.md>`
**Verdict:** Ready to build | Ready with changes | Not ready
**Axes:** coverage, claims, conventions, executability, sequencing, risk, testability, scope
**Claims checked:** <n> confirmed · <n> contradicted · <n> could not verify

## Blocking
- <finding> — <task heading it lands on> — <what to do about it>

## Changes to make first
- ...

## Claims
| Claim | Command run | Result |
|---|---|---|
| "the handler is at X" | `rg -n "class X" src/` | confirmed, `src/…:120` |
| "nothing else calls this" | `rg -n "Foo\(" -g '!**/obj/**'` | **contradicted** — 3 call sites |

## Task conflicts
| Tasks | Shared | Found |
|---|---|---|

## Not verified
- <what nobody could check, and why>
```

**A finding cites a task heading, not a `file:line`.** The code does not exist yet.

**A reviewer that verified nothing is a failed reviewer**, however well written its report. Checking
claims against the repository is the axis this skill exists for; an axis that returned reasoning instead
of evidence contributed neither. Say so in the report rather than counting it.

**A contradicted claim is never a wording fix.** The plan asserted something false, so the reasoning
resting on it has not been done — that area gets re-scouted, not re-worded.

## Chat summary

The verdict in the first line. Then the blocking count, the claim counts, and the single most expensive
thing found. Then: `/deliver` on Ready, `/plan` again on Not ready.

**The re-plan cap is in `.agents/lifecycle.md`** — typically one, then get a person. A plan that fails
twice has something wrong with its premises, and a re-plan loop is unusually cheap to get stuck in.

## Dispatching the agents

<!-- shared:agent-names:start source=agent-names.md -->
**These agents ship inside this plugin, so their `subagent_type` carries the plugin prefix:**
`lifecycle:code-scout`, `lifecycle:spec-reviewer`, `lifecycle:change-reviewer`,
`lifecycle:finding-fixer`.

A bare name may resolve, and it may also pick up a different agent the repo happens to define. **Pass
the prefixed form.** Where this document links an agent by file, the prefixed name is what goes in the
dispatch.
<!-- shared:agent-names:end -->
