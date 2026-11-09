---
name: build
description: Takes a committed spec and drives it to a green feature branch unattended. Use whenever a spec exists and the user wants it made real, however they phrase it — "build it", "build the spec", "implement it", "ship it", "take it from here", "run it", "go", "autopilot", or a spec path as the argument. Plans it, has the plan checked, sizes the work, splits it into tickets only when one context cannot hold it, shows a plan and takes one go-ahead, then implements / reviews / fixes each ticket in its own worktree in parallel, sweeps the finished feature, and records every decision it made. Stops at a green branch — opening the review is the repo's own step. Keywords - build, build the spec, implement, implement the spec, ship it, run it, autopilot, orchestrate tickets, parallel implementation, code review loop, spec to branch.
---

# Build (spec → a green feature branch)

The unattended half of the lifecycle. [`spec`](../spec/SKILL.md) ends at a committed contract; this
skill costs **one go-ahead** and ends at a branch that builds, tests clean and carries a written record
of every decision it took on your behalf.

You are the orchestrator: you schedule sub-agents, triage what they report, and **decide**. After the
plan is approved the user is not a step in this loop.

**It stops before the forge.** Opening a review, posting questions on it and watching it are this
repo's own business — see `.agents/forge.md`. That boundary is deliberate: everything above it is the
same in every repo, and everything below it never is.

<!-- shared:repo-config:start source=repo-config.md -->
**This repo describes itself in `.agents/`, at the repository root. Read the files that bind your step,
and treat them as authority over anything you would otherwise assume.**

| File | Answers |
|---|---|
| `.agents/lifecycle.md` | which phases run, which review lenses are in use, how many rounds each loop gets, how wide a wave may be |
| `.agents/gates.md` | the commands that must pass, in order, and what "green" means here |
| `.agents/tracker.md` | where specs and tickets live, and what may be written to the board |
| `.agents/forge.md` | the git host, and how a branch becomes a reviewed change |
| `.agents/docs.md` | where architecture truth lives, the glossary, and what "docs are part of done" costs |
| `.agents/naming.md` | branch, commit, directory and test-name grammar |
| `.agents/working-agreement.md` | working hours, what may run unattended, how to report, when to stop and ask |

Three rules:

- **A missing file is a real answer: that thing is not configured here.** Say so in one line and take
  the safest reading — do not invent the repo's conventions, and do not fall back on another project's.
  If the whole directory is absent, stop and tell the user to run `/onboard` instead of guessing.
- **`.agents/` beats your own judgement, and loses to the user.** It was written deliberately, so a rule
  you disagree with is reported once, not routed around.
- **Read only what your step needs.** Every line costs on every turn of a long run.
<!-- shared:repo-config:end -->

## When to use

A spec exists with `**Status:** Specced` and the user says build it. Also for resuming a half-built spec
(`Status: Building`) — the ticket checkboxes, the wave counter and `git log` say where you are.

Not for: work with no spec (that is [`frame`](../frame/SKILL.md) → [`grill`](../grill/SKILL.md) →
[`spec`](../spec/SKILL.md)), or a built tree that only needs shipping.

## The shape

```
<specs dir>/<dir>/spec.md                            Status: Specced
      |
      +-- /plan --> plan.md --> /plan-check --> Ready | Not ready
      |                                                            |
      +-- size it --> fits one 250k context? --> one unit of work --+
      |               otherwise split --> tickets 01 .. NN ---------+
      |                                                            |
      v                            [ shape drawn, one go-ahead ]   |
                                                                    v      Status: Building
  wave = tickets that are unblocked AND touch disjoint areas (width from .agents/lifecycle.md)
      |
      +--> worktree t01 --> implement (TDD) --> review --> fix --> squash --+
      +--> worktree t02 --> implement (TDD) --> review --> fix --> squash --+
      +--> worktree t03 --> ...                                            |
                                                                           v
                              cherry-pick in ticket order --> wave gate (the gates, once)
                                                                           |
                                     next wave <------------------- frontier not empty
                                                                           |
                                                                           v  frontier empty
                    full sweep: the lenses .agents/lifecycle.md names --> one fix pass
                                                                           |
                                                                           v
                    implementation-record.md --> a green branch        Status: Built
                                                                           |
                                                                           v
                                                      this repo's ship step — .agents/forge.md
```

Every write happens inside a per-ticket worktree; that is what makes the parallelism safe. Integration
is the only serialized step.

## Step 0 — Start in a clean context

Everything this skill needs is committed to disk, so a fresh session costs nothing and a loaded one
costs a lot: you are about to run for hours triaging reports from a dozen agents, and anything the
session already carries is dead weight on every turn.

If this session carries a design conversation, a grilling session or a long stretch of unrelated work —
the common case, since the design usually happened right here — say one line and stop:

> This will run for a while. Start a fresh session (or `/clear`) and run `/build` again — I read
> everything from the spec directory, so nothing here is lost.

**Being invoked again is the override — then run.** Ask once at most, and not at all in a session only a
few turns old.

### Staying lean once you are running

You are the one context that lives for the whole build.

- **Leave source files to the agents.** Their reports are terse so you can hold a dozen.
- **One line per wave to the user**, not a transcript of agent reports.
- Read the spec once, the plan once, the tickets once.

<!-- shared:file-handoff:start source=file-handoff.md -->
**Hand work to an agent as a file path. Never paste it into the prompt.**

Everything you paste into a dispatch, and everything an agent prints back, stays in your context and is
re-read on every later turn of the run. You are the one context that lives for the whole build.

- **Brief in, by path.** Write the agent's brief to a file and give it the path. Never make an agent read
  a whole spec or plan to find its own slice.
- **Diff in, by path.** `git log --oneline`, `git diff --stat` and `git diff -U10` for the pinned range,
  redirected to one file. The reviewer reads it in a single call and the diff never enters your context.
- **Report out, by path.** Name the report file in the dispatch. The agent writes its full findings
  there and **returns only**: a status, the commits it made, a one-line test result, and its concerns.
- **A dispatch describes one task, not the session's history.** Do not paste "state after tickets 1–3"
  into a later dispatch. A fresh agent needs its task, the interfaces it touches, and the constraints
  that bind it. Nothing else.

**Pin the range yourself.** Record `BASE` before dispatching and use it for every diff afterwards.
`HEAD~1` silently drops all but the last commit of a multi-commit task.
<!-- shared:file-handoff:end -->
- **Show the run rather than narrating it.** At each wave boundary hand the progress to
  [`operator-view`](../../agents/operator-view.md). It is cosmetic and never blocks — carry on without
  its answer.

## Step 1 — Ground yourself, and guarantee the worktree

1. **Find the spec.** An argument path wins; otherwise derive from the branch name; otherwise the most
   recently modified spec directory at `Status: Specced` or `Building`. No spec → say so and send the
   user to `/frame`.
2. **Read the status** — it is the authority, not the filesystem:
   - `Specced` → fresh build. Start at step 1.5.
   - `Building` → resumed build. The `**Wave:**` line and the tickets' `Status:` fields say what is
     done; skip to step 3 and re-derive nothing the header already answers.
   - `Built` → finished. Name the branch from the header and stop.
3. **Guarantee isolation.** `git rev-parse --show-toplevel` and the branch tell you where you are.
   - In a worktree on a feature branch → good.
   - In the main checkout on the default or a release branch → cut the worktree now, named from the spec
     directory (the name is decided; do not ask). Carry uncommitted spec files across with
     `git diff > /tmp/carry.patch` + `git apply`, then revert the main checkout.
   - In the main checkout on a feature branch → stay, and say so in one line.
4. **Read** the spec, and the documents `.agents/docs.md` names for the areas the spec touches. You are
   the only agent holding the whole feature; sub-agents get slices.
5. **Open the record.** Create `implementation-record.md` beside the spec from
   [`record-template.md`](record-template.md) and append as you go, while you still remember why.
6. **Open the ledger** at `ledger.md` beside the spec, and make its **first line name its own spec**:

   ```
   # build ledger — spec: <path to spec.md>
   ```

   Every wave boundary, every completed ticket and every ruling you make appends one line. **This is
   your recovery map.** Your conversation does not survive compaction, and a controller that lost its
   place re-dispatches work that is already committed — the single most expensive failure this loop has.
   After a compaction, trust the ledger and `git log` over your own recollection.

   A ledger whose first line names a different spec belongs to another run. Leave it and start your own.

<!-- shared:worktree:start source=worktree.md -->
**Every writing agent gets its own working tree.** Parallelism without one interleaves edits and loses
work, and that is the whole safety model.

Cut it from the main checkout:

```bash
git worktree add -b <branch> .claude/worktrees/<branch with / → +> <default-branch>
```

- The directory name replaces `/` with `+`. Git refuses a branch nested under an existing branch name,
  so a per-ticket tree suffixes `-t<NN>` and never `/t<NN>`.
- **Cut it before the first committed file exists.** A worktree cut later leaves the spec and the tickets
  dirtying the main checkout. Carry uncommitted work across rather than stranding it:
  `git diff > /tmp/carry.patch`, `git apply` in the new tree, then revert the original.
- Per-ticket branches are local scaffolding. Never push one; delete it after integration.
- **Never remove a worktree you did not create.** Somebody else's half-finished work looks exactly like
  a stale directory.

**A tool may resolve your path against the wrong tree, and say nothing.** Anything running outside your
shell — an MCP server, a language server, a scanner — resolves a relative path against **the directory it
started in**, which is the main checkout, not your worktree. It then reports on the *unmodified* file with
no error and no hint, which reads exactly like "my fix did not work".

- **Pass a path that is correct from the main checkout**: `.claude/worktrees/<name>/<path>`. A bare
  worktree-relative path is the trap.
- **Spot it by the line numbers.** If a reported range matches the file *before* your change, the tool
  read the other tree.
- **The fallback is a throwaway copy inside the main checkout**, analysed and then deleted.

**Say the path once, in one line.** Everything after that happens there, and a reader who does not know
where they are will look for their files in the main checkout.
<!-- shared:worktree:end -->

## Step 1.5 — Plan it, and have the plan checked

**A spec at `Specced` with no `plan.md` beside it does not go to an implementer.** Invoke
[`plan`](../plan/SKILL.md), then [`plan-check`](../plan-check/SKILL.md).

This runs here rather than in the design phase for two reasons: scouting the code is unattended work
that wants the clean context you are sitting in, and the go-ahead below should be about a plan somebody
has already verified against the repository.

- **Ready to build** → carry on.
- **Ready with changes** → apply them yourself, re-run `/plan-check` on the changed sections only.
- **Not ready** → re-plan, up to the cap in `.agents/lifecycle.md`. Past it, stop and take it to the
  user: a plan that fails review twice has something wrong with its premises.

A plan already exists and is current (its `Spec:` header matches, scouted after the last spec commit) →
skip to step 2. Say in one line that you reused it.

## Step 2 — Size it, split it, draw the plan, take one go-ahead

Estimate what a *fresh* implementer context costs. Count rather than guess:

| Signal | Estimate |
|---|---|
| baseline — repo rules, spec, orientation in the code | 40k |
| each production file created or meaningfully changed, with its tests | 15k |
| each schema change or migration | 20k |
| each new integration harness | 40k |
| each document touched | 5k |
| the unit's own review + fix cycle | 60k |

**Under the split threshold in `.agents/lifecycle.md` → one unit of work: the whole spec.** No
ticketing; the spec is the brief, and it still runs the full implement → review → fix cycle.

**Over it → split**, into the ticket layout `.agents/tracker.md` defines, and **approve the breakdown
yourself** against this checklist:

- every slice is vertical (a complete path through the layers), not a layer
- every slice is independently verifiable and estimates under the threshold
- the blocking edges are acyclic, and each edge is real rather than narrative order
- as many slices as possible carry **no** blocking edge — the parallelism is decided here

Adjust once yourself if a slice fails, then approve and write the ticket files. Commit as
`docs(specs): break <feature> into tickets`.

**Then draw the plan and ask once.** This is the only interruption, so make it worth reading:

```
<KEY> · <feature>                                 est. 640k · 4 tickets · 3 waves
──────────────────────────────────────────────────────────────────────────────────
 wave 1  ┌── 01  <ticket title>                      <area>     ~180k  opus
         └── 02  <ticket title>                      <area>     ~120k  sonnet  ║ parallel
 wave 2  ─── 03  <ticket title>                      <area>     ~140k  opus
 wave 3  ─── 04  <ticket title>                      <area>     ~110k  sonnet
──────────────────────────────────────────────────────────────────────────────────
 per ticket   TDD → review (sonnet) → fix → one commit
 sweep        <n> lenses in parallel (sonnet), then one fix pass (opus)
 I will decide alone
   · <the design call you are taking, one line>
   · <the test level you are taking, and the coverage floor you are holding to>
   · <which tickets are mechanical enough for the cheap tier>
   · <a naming call, and which document decides it>
 ends at   a green branch · <n> open decisions recorded for review
──────────────────────────────────────────────────────────────────────────────────
 go?  (or tell me what to change)
```

Anything other than a go-ahead is an adjustment: fold it in, redraw what changed, carry on. If the
*design* turns out wrong rather than the plan, send the user back to `/grill` rather than redesigning
here.

On the go-ahead, set the spec header to `**Status:** Building` and add `**Wave:** 1 of N`. From then on
you decide alone, except under [Autonomy](#autonomy--decide-dont-ask).

## Step 3 — Schedule the wave

Loop until every ticket is done. Each pass:

1. **Frontier** — every not-done ticket whose blockers are all done.
2. **Footprints** — from each frontier ticket's text, predict the areas it writes. A quick `grep` beats
   a guess.
3. **Batch** — greedily take frontier tickets with pairwise-disjoint footprints, up to the wave width in
   `.agents/lifecycle.md`. A frontier of one is a wave of one.

**Two classes of file conflict for structural reasons**, and `.agents/gates.md` names them:

- **generated files** — built once at integration, never in a ticket worktree, where every parallel tree
  would rewrite the same file;
- **append-heavy manifests** — expect conflicts; the resolution is almost always "keep both lines".

## Step 4 — Run the ticket cycle, inside the ticket's own worktree

Per ticket in the wave. Send the implementer agents in a **single message** so they run concurrently.

```
BASE=$(git rev-parse HEAD)
git worktree add -b <feature-branch>-t<NN> .claude/worktrees/<feature-branch with / → +>-t<NN> $BASE
```

The suffix is `-t<NN>`, not `/t<NN>`: git refuses a branch nested under an existing branch name. These
branches are local scaffolding — never pushed, deleted after integration.

1. **Implement** — one [`ticket-implementer`](../../agents/ticket-implementer.md). Cut its brief to its
   own file — the ticket's text, its `Consumes`/`Produces` block from the plan, and the seams — and pass
   **the path**. Name its report file in the dispatch. Choose its model
   ([Model choice](#model-choice)).

   **Batch small same-shape work.** When several tickets are each the same small mechanical edit — one
   rename repeated across files, one field added in four places — compose **one** brief listing every
   file and its change and send the batch to a single agent. Reserve one agent per ticket for work that
   needs its own judgement, its own tests and its own review surface.

2. **Handle the report by its status.**
   - `DONE` → review it.
   - `DONE_WITH_CONCERNS` → read the concerns first. Correctness or scope doubts are settled before
     review; observations are noted and you carry on.
   - `NEEDS_CONTEXT` → supply what the brief missed and re-dispatch on the same model.
   - `BLOCKED` → act on the signal. `hard-execution` → same tree, one tier up.
     `architectural-ambiguity` → back to `/plan` for that area; **never guess**, because a plausible
     guess produces working code for the wrong design and review cannot tell the difference.

   **Never re-dispatch the same model unchanged after a block.** If the agent said it was stuck,
   something has to change.

   **These do not count as a model failure**: a build dying on memory pressure, a transient auth or API
   error, or a missing dependency in a fresh worktree (it holds tracked files only). Bootstrap and retry
   on the same model.

3. **Review** — one [`change-reviewer`](../../agents/change-reviewer.md) with the *ticket review* lens,
   pinned to `$BASE...<ticket-branch-tip>`. Write the range to a diff file and pass **the path**; the
   diff never enters your context. Reviewers hold no write tools, so they may overlap anything.

<!-- shared:no-prejudging:start source=no-prejudging.md -->
**Never tell a reviewer what not to flag.** If the prompt you are writing contains "do not flag", "don't
treat X as a defect", "at most Minor", or "the spec chose this" — stop. You are pre-judging, and the
reason is almost always to spare yourself a review round.

Let the reviewer raise it. Adjudicate it afterwards, in the open, and record the ruling.

Two rules that follow:

- **Do not add open-ended directives** — "check all uses", "run the race tests if useful" — without a
  concrete, task-specific reason. They cost a reviewer's whole budget and return nothing.
- **Do not ask a reviewer to re-run tests the implementer already ran on the same code.** The
  implementer's report carries that evidence.

**Triage is the caller's job, not the reviewer's.** A reviewer that filters while it looks leaves buckets
empty for the wrong reason: cover first, filter second, and judge severity as a separate pass over a list
that already exists.
<!-- shared:no-prejudging:end -->

4. **Triage — yours, not the reviewer's.** Three buckets:
   - **fix now** — wrong behaviour, a missed acceptance criterion, a violated repo standard, a security
     or data-integrity risk, a missing test at a seam the plan named, or a non-empty `Uncovered:` line
     from the implementer. **Coverage is the one debt the branch cannot carry** where
     `.agents/gates.md` names a floor — and the fix is the seam, never a test written to reach the line.
   - **fix if cheap, else defer** — smells, naming, duplication under ~20 lines. Deferring means one line
     in the record.
   - **drop** — anything tooling enforces, anything the conventions endorse, anything outside this
     ticket's scope.
5. **Fix — round one goes back to the agent that wrote the code.** Its context is intact: it knows the
   ticket, the code and its own choices, so it fixes faster and cheaper than anything starting cold.
   Send it the triaged list verbatim. Only if your harness cannot reach it, or the round is past the
   first, spawn a fresh [`finding-fixer`](../../agents/finding-fixer.md) in the same worktree — one agent
   with the **whole** list, never one per finding.

   **The round cap is in `.agents/lifecycle.md`** — typically three. Every round ends with a re-review
   scoped to the fix range, never a fresh full review: a scoped re-review verifies the fixes and cannot
   wander. Past the cap the failure is structural: park what is left with a written ruling in the ledger.

   **Every parked finding is a ledger line, and every ledger `Ruling:` line reaches the user at the
   end.** A ruling that dies in the worktree was a decision taken in secret.

6. **Squash to one commit** — `git reset --soft $BASE`, then commit per `.agents/naming.md`. One commit
   per ticket; the implement/fix split is scaffolding the history should not remember.

## Step 5 — Integrate the wave

Serialized, in ticket-number order, on the feature branch:

```
git cherry-pick <ticket-branch-tip>
git worktree remove .claude/worktrees/<dir> && git branch -D <ticket-branch>
```

Resolve conflicts yourself ([`resolve-conflicts`](../resolve-conflicts/SKILL.md) for a real tangle).
Then run the gates **once per wave** — two branches that were green apart can be red together.

<!-- shared:gates:start source=gates.md -->
**Run the gates the way CI runs them, before you claim anything passes.** They are recorded in
`.agents/gates.md`, at the repository root — the commands, their order, and which of them a local run
weakens. Read that file; do not reconstruct the gate from what you see in the tree.

- **Run them in the order given.** A formatter after a build check wastes the check, and most orders are
  written down because somebody already lost an hour to the other one.
- **A local command that is not the CI command is not the gate.** Where `.agents/gates.md` says a local
  invocation is softer than CI's — warnings not fatal, a subset of projects, coverage not measured — run
  the CI form or say which one you ran.
- **Generated files are built once, at integration.** `.agents/gates.md` names them. Never regenerate one
  inside a per-ticket worktree; every parallel tree would rewrite the same file.
- **A gate that fails for a reason outside this change is not yours to work around.** Say so and stop.
- **When a gate fails in a way that makes no sense**, read the troubleshooting document
  `.agents/gates.md` points at before debugging your own code.

If `.agents/gates.md` is missing, run the repo's obvious test and build commands, **say which you chose
and that they were not configured**, and do not claim CI parity.
<!-- shared:gates:end -->

A red gate is yours to fix — amend it into the offending ticket's commit when it is clearly one ticket's
fault, otherwise a small `fix(...)` commit. Tick the ticket's checkboxes, set `**Status:** done` in its
file, bump `**Wave:**` in the spec header, **append the completion line to the ledger**, and go back to
step 3.

```
ticket 03: complete (commits abc1234..def5678, review clean)
ticket 04: complete (commits …, 2 parked)  Ruling: <what you decided, and what it costs if wrong>
```

## Step 6 — Sweep the finished feature

With the frontier empty, review the feature as a whole — what no per-ticket review can see. Take the
lens set from `.agents/lifecycle.md`, drop the ones whose trigger this diff never touched, and run the
rest as parallel `change-reviewer` agents against `<default-branch>...HEAD`. Bodies are in
[`prompts.md`](prompts.md#lens-catalogue).

Then synthesize: dedupe across lenses, drop what the step-4 rules drop, rank what is left. Hand the
survivors to **one `finding-fixer` on `model: opus`** (two only for genuinely disjoint areas), then
re-run the wave gate. One `fix(...)` or `refactor(...)` commit for the sweep is right — it is one
reviewable unit of thought.

A spec-level miss — something the spec asked for that nobody built — is a missing ticket rather than a
fix. Add it and run one more wave.

## Step 7 — Close the record

Finish `implementation-record.md`: every decision you made without asking, each with its one-line why
and the alternative you passed over. Flag the ones a human should confirm. Commit as
`docs(specs): record the implementation decisions`.

**The list is exhaustive, and the ledger is how you prove it.** Every `Ruling:` line in `ledger.md` has
a matching entry here, in the order you made them, each saying what it costs if it is wrong. This is the
only place the decisions you took on the user's behalf reach them.

## Step 8 — Hand over a green branch

Set the spec header to `**Status:** Built`, commit that one-line change, and push the feature branch.

Then report, and stop:

```
Branch      <name>, pushed · <n> commits
Gates       <the exact commands you ran, and what each printed>
Built as    <N tickets in M waves | one slice>
Decisions   <n> recorded · <n> flagged for a human to confirm
Parked      <n> findings, each with a ruling in the record
Next        <this repo's ship step, from .agents/forge.md>
```

**Opening the review is not yours.** `.agents/forge.md` says how it happens here — a command, a skill
this repo owns, or a human. Name it and stop; do not improvise a forge interaction.

<!-- shared:tracker-limits:start source=tracker-limits.md -->
**Read the issue tracker freely. Write to it only as `.agents/tracker.md` allows** — at the repository
root. That file names the tracker, the project key, and the writes that are standing permission here
— typically none, or a small closed set such as claiming a ticket when work starts and commenting the
agreed design and the shipped link.

Limits that hold for every write, whatever the tracker:

- **Only the writes that file lists.** Anything wider — creating issues, a bulk edit, another field —
  needs a manifest shown to the user and an explicit go-ahead.
- **English, whatever language the session ran in.** A board is read outside the team that fills it.
- **Only ever forwards.** Never drag an item backwards, and never set a status that reports an *outcome*
  — those stay human calls.
- **If it is assigned to somebody else, leave it and say so.** Taking a colleague's ticket silently costs
  more than it saves.
- **Never blocking.** Missing credentials, a 404 or an outage each cost one line, and the run carries on.
  **The committed spec is the authority; the board is a convenience.**

Say in one line what you wrote and where. If `.agents/tracker.md` is missing, **write nothing** and
carry on with the local files.
<!-- shared:tracker-limits:end -->

## Model choice

<!-- shared:model-choice:start source=model-choice.md -->
**The session model is a ceiling, not a per-agent default.** Picking the tier per call is part of
orchestrating. An omitted model inherits the session's — usually the most expensive one.

| Call | Model | Why |
|---|---|---|
| review, any lens | `sonnet` | One lens, a pinned range, a rule to quote, a terse report. Several run at once. |
| scout / investigate | `sonnet` | Locating code and citing `file:line`. No design judgement. |
| implement a **mechanical** slice | `sonnet` | The shape is already written down: a page copied from a named existing page, a rename across call sites, wiring that follows an existing seam, a regenerated client, documentation. |
| implement a **design-carrying** slice | inherit | New seams, schema and wire contracts, permissions, concurrency. |
| fix an already-triaged finding list | `sonnet` | Bounded work with the reasoning done. |
| fix the whole-feature sweep | `opus` | Cross-cutting findings and the last write before review. |

Three rules:

- **Turn count beats token price.** A cheap model routinely takes two or three times the turns on
  multi-step work, which costs more overall. Use the cheap tier when the brief contains the shape;
  otherwise start one tier up.
- **A `sonnet` agent that fails its gates twice on the same thing gets one re-run on `opus`** — the
  failure is as likely to be the tier as the task. After that, re-scope or park.
- **Escalate a reviewer deliberately**, not by default: for correctness or spec alignment over a sweep of
  more than about fifteen changed files, or when a lens returned clean on a diff you have concrete reason
  to distrust. Escalating every lens costs the price of the build again.

Name the cheap-tier slices in the plan, so one go-ahead covers the choice.
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

## Autonomy — decide, don't ask

The line is in `.agents/working-agreement.md`, and it is binding. Absent one, **default to deciding**:
record it, ship it, flag it in the record. Stop and ask only when:

- proceeding either way changes **user-visible behaviour** the spec does not settle, and the choice is
  expensive to reverse (a persisted schema, a wire contract, a permission boundary);
- a gate fails for a reason outside this feature (a broken default branch, an expired secret, a
  dependency service down);
- the design itself turns out wrong — that belongs back in `/grill`.

Everything else is yours: naming, layering, test level, which findings to fix, how to split, which model
each agent runs on, which existing library to use. **A question answerable from the documents
`.agents/docs.md` names is a lookup, not a question.**

## Notes

- **One writing agent per working tree.** The worktree-per-ticket rule is the whole safety model;
  parallelism without it interleaves edits and loses work.
- **The roles are definitions**, under `agents/` in this plugin, so their gates, report shapes and
  worktree rules live there once. Change a role by editing its definition rather than by adding
  contradicting instructions to a call. `change-reviewer` holds no write tools by design; leave review
  work with it.
- A ticket whose implementer fails twice on the same thing has had its one Opus re-run (see
  [Model choice](#model-choice)). After that, re-scope it or park it, finish the rest of the feature, and
  report the parked ticket. **Never leave the user with nothing shipped.**
- Commit to the feature branch only.

## Dispatching the agents

<!-- shared:agent-names:start source=agent-names.md -->
**These agents ship inside this plugin, so their `subagent_type` carries the plugin prefix:**
`lifecycle:code-scout`, `lifecycle:spec-reviewer`, `lifecycle:change-reviewer`,
`lifecycle:ticket-implementer`, `lifecycle:finding-fixer`, `lifecycle:operator-view`.

A bare name may resolve, and it may also pick up a different agent the repo happens to define. **Pass
the prefixed form.** Where this document links an agent by file, the prefixed name is what goes in the
dispatch.
<!-- shared:agent-names:end -->
