---
name: plan
description: Turn a committed spec into an ordered, executable plan — after agents have actually read the code it will change. Every task names its files, its test, its seam and the command that verifies it; a coverage table maps every numbered requirement to a task or an explicit deferral. Writes plan.md beside the spec. It plans, it never implements. Use when a spec exists and someone asks how we build it, wants the work broken into ordered tasks, or wants to know where the code lives today. Keywords - plan, how do we build it, break it into tasks, implementation plan, task order, test seams, coverage, where does this code live.
---

# Plan (a contract → an executable plan)

Turn a spec into work somebody can execute, **after reading the code it will change**.

> **A plan written without reading the code is the spec restated with filenames guessed onto it.** It
> looks like work, it reviews as work, and whoever picks it up discovers the guesses one at a time. So
> every plan rests on a scouting pass, and every claim it makes about the codebase carries a
> `path:line` somebody actually opened — which is exactly what
> [`plan-check`](../plan-check/SKILL.md) then verifies.

**This skill plans. It never implements.** Writing the code is [`deliver`](../deliver/SKILL.md).

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

- The spec is **draft**, with anything under `## Open` → settle it in [`grill`](../grill/SKILL.md)
  first. Planning around an open question means silently planning one of its answers.
- There is no spec → [`spec`](../spec/SKILL.md). Planning straight from a ticket is how requirements
  get invented inside a plan, where nobody reviews them as requirements.
- A bug whose cause is unknown → [`diagnose`](../diagnose/SKILL.md). You cannot plan a fix for a cause
  nobody has established.

## What you are working from

<!-- shared:spec-shape:start source=spec-shape.md -->
**A spec states WHAT. A plan states HOW.** The moment a spec names a class, a method, a table or a
control-flow step it has become a plan, written before anybody read the code — and it gets none of the
checking a plan gets.

The test: **could two competent developers satisfy this with different designs?** If not, you have
specified a design.

**The numbers are permanent.** Requirements and acceptance criteria are each one numbered list, and the
number is the handle every later step uses — a review finding, a review comment, a commit, a plan's
coverage table.

- Adding a requirement **appends**. It never inserts.
- Removing one leaves the number **retired**: `~~withdrawn~~` with the reason and the date. Never reused.
- Renumbering is the one edit that silently breaks every consumer. A revision preserves numbers by
  definition; if it cannot, it stops and says why.

**Every requirement and criterion names where it came from** — the ticket, a comment, an answered
question, a recorded assumption. A line with no trace is one somebody invented, and inventing
requirements is the easiest failure to commit here: the ticket is terse, the gap is obvious, and filling
it feels like diligence. **Fill nothing. A gap goes under `## Open`.**

**A spec with anything under `## Open` is a draft, not a contract.** Say so in the header and in the
summary, and name the open questions.

**`## Out of scope` is not filler.** A reviewer who assumes a nearby behaviour was in scope reports its
absence as a missing requirement, and the round trip is spent explaining that nobody asked for it.
<!-- shared:spec-shape:end -->

## Step 1 — Read the spec, and refuse a draft or an unsigned one

Resolve the spec from `.agents/tracker.md` and read its status line. **A spec marked draft, or carrying
a non-empty `## Open`, stops the run.** Name the open questions and point at `/grill`. Then run the spec gate:
`node <skills>/_shared/tools/spec-gate.mjs check <spec dir>`, where `<skills>` is the parent of this skill's
own directory. Exit 1 — a tiered spec with no
sign-off, or one whose requirements, criteria or decisions changed since it — stops the run with its
line and sends the spec back to `/spec --revise`. These are the only refusals here, and both are worth
keeping.

**`## Constraints` is binding.** Those are the edge cases somebody settled deliberately; a plan that
quietly re-decides one has thrown away the only record of the decision.

**`## Out of scope` is binding in the other direction.** Work listed there is work the plan must not
contain, however obviously adjacent it looks.

## Step 2 — Scout before you plan

Group the requirements into work areas — a service, a layer, a feature surface — and spawn one
[`code-scout`](../../agents/code-scout.md) per area, **all in a single message** so they run
concurrently.

Ask each for **evidence, not a design**: where the behaviour lives today, what the code does at
`path:line`, which call sites exist, what the surrounding conventions are, **what already exists that
this should copy rather than reinvent**, and what it could not establish.

**A scout that comes back empty is a result, not a failure to hide.** The plan says `NOT LOCATED` for
that area, and its first task becomes the investigation rather than a change to a file nobody found.

## Step 3 — Read the rules that bind this change

Before designing anything, read what already governs it. A plan that routes around a documented seam or
reaches for a forbidden library is wrong before a line is written, and this is the cheapest moment to
find out. `.agents/docs.md` names all of it: the glossary, the repo rules, the conventions, the
architecture documents, the accepted decisions.

**Documented seams and accepted decisions are constraints, not suggestions.** A change that routes
around one is a finding even when the code is otherwise correct.

**Anything an analyzer, formatter or the compiler already enforces is not a plan decision.** The build
fails on it anyway.

## Step 4 — Name the test seams here, not while writing tests

A **seam** is the public boundary the behaviour can be observed at without reaching inside.

- **Prefer an existing seam.** A new one is new public surface, and it usually exists only to make one
  test convenient.
- **Use the highest seam that still observes the behaviour.** Higher means fewer tests covering more,
  each closer to what a user actually does.
- **Fewer is better; one is ideal.** Every extra seam is another interface the change is pinned to.
- **Pick the cheapest test level that can faithfully reproduce the failure mode.** If stubbing at a
  cheap level would trivialise the assertion, promote the test or rename it to match what it actually
  proves. The levels and their costs are in `.agents/gates.md`.

**A seam chosen while writing the test is chosen to make that test easy**, which is how a suite ends up
pinned to the implementation it was meant to be independent of.

**An acceptance criterion no seam can observe belongs in `## Unresolved`, never in a task.** Either the
criterion needs restating or the change needs a seam it does not have, and both are decisions somebody
should take deliberately.

**Clear the coverage floor in the plan, not at the gate.** The floor is in `.agents/gates.md`. Anything
genuinely not worth covering — a thin adapter, a generated surface — says so here, with the reason.

## Step 5 — Map every requirement to a task

**Every numbered requirement and criterion gets a task, or an explicit deferral.** A requirement the
plan never mentions has not been deferred — it has been lost, and that is the most common way a plan
fails.

| Spec | Covered by |
|---|---|
| Requirement 1 | Task 2, Task 3 |
| Requirement 2 | **deferred** — <why, and what unblocks it> |
| Criterion 1 | Task 3 test |

## Step 6 — Write `plan.md`

Next to the spec. Committed, like the spec.

````markdown
**Date:** YYYY-MM-DD
**Spec:** `<path to spec.md>` (Specced)
**Scouted:** <sha> on <date>

## Approach

<a paragraph: the shape of the change and why this shape. Alternatives rejected, briefly.>

## Coverage

| Spec | Covered by |
|---|---|
| Requirement 1 | Task 2 |

## Test seams

- `<seam>` — observes requirement <n>; misses: <what it cannot see>. Existing (`path:line`) | new, because <nothing existing observes it>.

## Build

- [ ] Task 1 — <imperative title>
- [ ] Task 2 — <imperative title>
- [ ] Task 2 review
- [ ] Task 2 screens
- [ ] End review
- [ ] End review fix round

## Task 1 — <imperative title>

**Risky:** no
**Files:** `path/one`, `path/two`
**Today:** <what the code does now> (`path/one:120`)
**Reuse:** <the nearest existing thing to copy> (`path/other:44`)
**Reference:** <the design reference this screen follows, from `.agents/preview.md`> | none
**Screens:** <the routes or screens this task changes> | none
**Scenario:** <the seed scenario these screens are checked with, and what this task adds to it> | none
**Change:** <what to do — behaviour, not a diff>
**Test:** <which test, at which seam, at which level>
**Verify:** `<command>` → <what passing looks like>
**Consumes:** <exact signatures this takes from earlier tasks>
**Produces:** <exact names and types later tasks will rely on>
**Assumes:** Task <n> is done | nothing

## Task 2 — ...

## Risks

- <migration, tenancy, permissions, public contract, deploy ordering> — <what happens if this ships half-applied>

## Unresolved

- <what a scout could not establish, and what it blocks>
- <any criterion no seam can observe>
````

**`## Build` is the run's progress.** `/deliver` builds its lines top to bottom and checks each one off in
the commit that completes it, so a compacted or a new session resumes at the first unchecked line. One
line per task; after each risky task, a `Task N review` line; after each task with `Screens:`, a
`Task N screens` line; at the end, `End review` and `End review fix round`. `- [-]` marks a line
`/deliver` parked.

**Mark a task `Risky: yes` when it touches authentication, tenancy, permissions, a migration or a wire
contract.** A fresh reviewer reads that task's commit before the next task starts. Every other task says
`no` and is read by the end review. Marking everything risky buys a review per task that measurably does
not reduce what the end review finds.

**A task that changes a screen names its `Screens:`, `Scenario:` and `Reference:`.** The screens are what
`/deliver` photographs and a fresh reviewer reads against the reference; the scenario gives them the data
they need. When no scenario has that data yet, the task adds it in the same change. When
`.agents/preview.md` is not configured, write the lines anyway — they tell the end review which screens
changed — and say once that no images will be taken.

**`Consumes` and `Produces` are required.** By the time a later task is built, the session may have
compacted away the earlier one. These lines keep the exact names each task relies on in the plan, so
nothing is renamed from memory.

**`## Unresolved` is mandatory and never empty by omission.** When there is genuinely nothing, write
"Nothing unresolved." An absent section reads as full confidence, and a plan is exactly where unfounded
confidence is most expensive.

## Step 7 — Write tasks somebody can execute

- **No placeholders.** "Implement the handler" is not a task, and `TODO` in a plan is a defect.
- **Every command runnable as written** — no machine-specific absolute path, no credential that will
  not exist elsewhere.
- **Each task leaves the tree building.** A plan whose middle tasks cannot compile is a plan whose
  one-commit-per-task rule is fiction.
- **Order by dependency**, and say what each task assumes is already done.
- **Do not inline the code.** Name the behaviour, the file and the test. Pasted code blocks go stale the
  moment the repo moves, and the session that builds the task is better at writing them than you are at
  guessing them.

<!-- shared:model-choice:start source=model-choice.md -->
**The session builds; agents review and scout.** A call names its model only where this table says so.
`.agents/lifecycle.md` § *Effort and budget* may lower a row for cost; it says so when it does.

| Call | Model |
|---|---|
| build a plan's tasks, and fix what review found | the session's own model — no agent writes production code |
| every `change-reviewer`: plan check, task review, screens review, each end-review reviewer | `opus` |
| the `implementability` spec lens | `opus` |
| the other spec lenses · scouting | `sonnet` |

- **The most expensive tier is allowed where one missed flaw would be expensive, and is never a
  default.** Name each such step in the plan with one line on why.
- **A `sonnet` agent blocked on execution gets one re-run on `opus`.** An `opus` agent that fails twice is
  re-scoped, or its question left to the end review.
- **Fewer agents beat thinner agents.** Every agent pays a fixed start-up cost before it reads a line —
  on the order of 15–20k tokens — so merging two lenses into one reviewer saves more than trimming a
  tool list or picking a cheaper tier.
<!-- shared:model-choice:end -->
<!-- shared:budget:start source=budget.md -->
**How much a call is allowed to cost is configured, not improvised.** `.agents/lifecycle.md` § *Effort
and budget* sets, per role: the **model tier**, the **reasoning effort**, and a **soft output ceiling**.
Read it before dispatching, and pass the tier and effort you find there.

Four levers, in the order they actually move cost:

1. **How many calls** — the lens count. Six lenses cost three times two lenses, and this is the largest
   lever by a distance.
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
  what one lens can hold, a security lens over a permission change — take the higher tier and **say in
  one line that you did and why.** Silently overspending and silently underspending are the same defect.

**A budget is tight because of the subscription, not the repo**, so `.agents/lifecycle.md` records which
plan is paying and which profile was taken. When it says a lens was dropped for **cost** rather than
relevance, do not helpfully add it back.

If `.agents/lifecycle.md` sets no budget, say so once and use the defaults in this document's own model
table.
<!-- shared:budget:end -->

## Re-planning after a Not Ready verdict

Feed the blocking findings and every **contradicted** claim back in, and rewrite.

**A contradicted claim is not a wording problem.** The plan asserted something false about the
repository, so the reasoning resting on it has not been done — re-scout that area rather than editing
the sentence.

**The re-plan cap is in `.agents/lifecycle.md`** — typically one. A plan that fails review twice has
something wrong with its premises, and this loop is cheap to get stuck in. Then get a person.

## Chat summary

The path written, the spec it came from, N tasks and M seams, whether every requirement is covered or
which are deferred, **every area whose scout returned `NOT LOCATED` by name**, and everything under
`## Unresolved`. Then: `/plan-check`.

## Dispatching the agents

<!-- shared:agent-names:start source=agent-names.md -->
**These agents ship inside this plugin, so their `subagent_type` carries the plugin prefix:**
`lifecycle:code-scout`, `lifecycle:spec-reviewer`, `lifecycle:change-reviewer`,
`lifecycle:finding-fixer`.

A bare name may resolve, and it may also pick up a different agent the repo happens to define. **Pass
the prefixed form.** Where this document links an agent by file, the prefixed name is what goes in the
dispatch.
<!-- shared:agent-names:end -->
