---
name: deliver
description: Takes a committed spec to the end of the run unattended - a green branch, an open review, or a watched review, as this repo's ship mode says. Plans it, has the plan checked, then builds every task in this session test-first, one commit per task, with a fresh reviewer after each risky task, a screenshot review after each UI task, and fresh reviewers over the whole diff at the end. Writes the review walkthrough and the implementation record. Use whenever a spec exists and the user wants it made real - "deliver it", "build it", "implement the spec", "ship it", "take it from here", "go", or a spec path. Keywords - deliver, build, implement, implement the spec, ship it, autopilot, spec to pull request, code review loop, review walkthrough, screenshots.
---

# Deliver (spec → the end of the run)

[`spec`](../spec/SKILL.md) ends at a committed contract. This skill ends where `.agents/forge.md`'s
**ship mode** says: a green pushed branch, an open review, or a review it keeps watching. **It asks
nothing in between.** Its decisions go into the implementation record and come back on the review
walkthrough.

**You build it yourself, in this session, one task after another.** No agent writes production code.
What leaves the session is review: a fresh [`change-reviewer`](../../agents/change-reviewer.md) that
never saw your reasoning reads a risky task as soon as it lands, and fresh reviewers, each with its own
lenses, read the whole diff at the end. You triage what they find and fix it yourself.

Why this shape: hand-overs cost more than the code. An implementer agent pays tens of thousands of
tokens to orient itself, a fixer rereads code someone else wrote, and a review after every task does not
reduce what the end review finds. The session that wrote the code fixes it cheapest; a reviewer that did
not write it reads it best.

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

## When to use

A spec with `**Status:** Specced` and the user says build it. Also to resume a spec at
`Status: Building`: the plan's `## Build` checklist says what is still owed.

Not for: work with no spec ([`frame`](../frame/SKILL.md) → [`grill`](../grill/SKILL.md) →
[`spec`](../spec/SKILL.md)), or a built branch that only needs its review opened ([`ship`](../ship/SKILL.md)).

## Arguments

| Form | Means |
|---|---|
| `/deliver <spec dir>` | run to the end of the ship mode without stopping |
| `/deliver <spec dir> --confirm` | stop once after the plan for a go-ahead |

## The shape

```
spec ── /plan ── /plan-check ── print the plan ── (before images) ── Status: Building
          │
          ▼  for each unchecked line of plan.md's ## Build, top to bottom:
        Task N:          test-first → gates → commit (line checked off)
        Task N review:   risky tasks only — fresh reviewer on the task's commit → triage → fix
        Task N screens:  UI tasks only — after images → fresh reviewer on the images → triage → fix
          │
          ▼
        End review:      fresh reviewers, each with its own lenses, in parallel → triage → one fix round
        record:          written as reviews close, completed at the end
          │
          ▼
review walkthrough ── Status: Built ── ship mode: branch | review (/ship) | review+watch (/ship, /babysit)
```

## Step 1 — Ground yourself

1. **Find the spec.** An argument path wins; otherwise derive it from the branch name through
   `.agents/naming.md`. When neither names one, list the specs at `Specced` or `Building` and ask which;
   **never take the newest**, it may be another session's. No spec → send the user to `/frame`.
2. **Read its status.**
   - `Specced` → carry on.
   - `Building` → finish this step, then go to [the build loop](#step-4--the-build-loop) at the first
     unchecked line of `plan.md`'s `## Build`. Every line checked → step 5, which completes only what is
     still owed: the record, the tier, the walkthrough.
   - `Built` → the branch is done; go to step 6 for what the ship mode still owes, or stop if nothing.
   - `Shipped` → name the review from the header and stop.

   Then, on `Specced` and `Building` alike, **run the spec gate**:
   `node <skills>/_shared/tools/spec-gate.mjs check <spec dir>`, where `<skills>` is the parent of
   this skill's own directory. Exit 1 stops the run with
   its line: the spec goes back to `/spec --revise` and the user signs it off again. A spec with no
   `**Review tier:**` passes and is built as before.
3. **Stand in the feature worktree.** The spec usually exists only on the feature branch.

<!-- shared:worktree:start source=worktree.md -->
**One feature, one working tree, one writer.** Two writers in one tree interleave edits and lose work.

Cut it from the main checkout, from the default branch:

```bash
git worktree add -b <branch> .claude/worktrees/<branch with / → +> <default-branch>
```

- The directory name replaces `/` with `+`. Git refuses a branch nested under an existing branch name.
- **Cut it before the first committed file exists.** A tree cut later leaves the spec dirtying the main
  checkout. Carry uncommitted work across rather than stranding it: `git diff > /tmp/carry.patch`,
  `git apply` in the new tree, then revert the original.
- **Already standing in a worktree on a feature branch** (one your harness made, or one an earlier phase
  cut)? Use it. Do not nest a second tree inside it.
- **Never remove a worktree you did not create.** Somebody else's half-finished work looks exactly like
  a stale directory.

**A tool may resolve your path against the wrong tree, and say nothing.** Anything running outside your
shell — an MCP server, a language server, a scanner — may resolve a relative path against the directory
it started in, and report on the *unmodified* file with no error.

- **Pass the absolute path** of the file in your tree.
- **Spot it by the line numbers.** If a reported range matches the file *before* your change, the tool
  read the other tree.

**Say the path once, in one line.** Everything after that happens there.
<!-- shared:worktree:end -->

4. **Uncommitted changes on a resume belong to the first unchecked task.** Finish that task and commit
   it before anything else.
5. **Merge the default branch in, unasked**, and resolve a conflict yourself (for a real tangle,
   [`resolve-conflicts`](../resolve-conflicts/SKILL.md)). Run the gates, commit, carry on.
6. **Read** the spec and the documents `.agents/docs.md` names for the areas the spec touches.

## Step 2 — Plan it, and have the plan checked

**A spec without a current `plan.md` is not built.** Invoke [`plan`](../plan/SKILL.md), then
[`plan-check`](../plan-check/SKILL.md). A plan is current when its `Spec:` header matches and it was
scouted after the last spec commit. Reuse a current plan and say so in one line.

- **Ready to build** → carry on.
- **Ready with changes** → apply them to `plan.md` yourself. Do not run the check again. Anything you
  could not apply goes under *Deferred* in the implementation record, with the reason.
- **Not ready** → re-plan, up to the cap in `.agents/lifecycle.md`, then one fresh `/plan-check`. Still
  not ready → stop and take it to the user: a plan that fails twice has wrong premises.

**The plan needs a `## Build` checklist and a `Risky:` line on every task** (the
[template](../plan/SKILL.md#step-6--write-planmd)). Add them if an older plan lacks them.

## Step 3 — Print the plan, take the before images, and start

Print the shape once:

```
<KEY> · <feature>                                       7 tasks · 2 risky · 1 UI
 1  add the bulk-assign operation        api        risky: contract     → task review
 2  selection state in the table         ui                             → screens review
 3  wire the panel to the operation      ui
 4  permission check + audit trail       api, docs  risky: permissions  → task review
 …
 end review   spec alignment · correctness · repo standards · + security & permissions
 I will decide alone
   · reuse the existing selection state rather than a new store
 review tier medium (spec) · review walkthrough at the end
 ends at      <the ship mode, in words: a pushed branch | an open review | a watched review>
```

**Images live in `screens/` beside the spec** — `screens/before/` and `screens/after-<N>/` — and are not
committed; the review walkthrough embeds the ones it shows. A resumed session that finds `screens/before/`
missing takes the before images again, from the default branch, before the next screens line.

**When a task has `Screens:` and `.agents/preview.md` is configured, take the "before" images now**, in
the tree as it stands on the default branch, with the commands that file names: bring the app up, seed
the scenario as it is on the default branch, and screenshot every screen of every task that exists
there. Leave out a screen that is new in this change. A preview that will not start, or a missing input
it names, means no images for this run: note the reason for the review walkthrough and build on. An
unconfigured `.agents/preview.md` skips every screens step, said once.

Then set the spec header to `**Status:** Building`, commit, and **start the build in the same turn.**
Only with `--confirm` is this print a question; treat any answer but a go-ahead as an adjustment. If the
*design* is wrong, not the plan, send it back to `/grill`.

## Step 4 — The build loop

Work the `## Build` checklist top to bottom. **The first unchecked line is always where you are.**
After a compaction or in a new session, read `plan.md` and `git log`, and carry on from there — never
from memory.

**A task line** (`Task N — <title>`):

1. Read the task: its `Files`, `Reuse`, `Consumes` and `Produces`. Use the names `Produces` gives, even
   when memory says otherwise.
2. Build it test-first with [`tdd`](../tdd/SKILL.md): one test, one implementation, at the seam the plan
   named. A task with a `Reference:` builds the screen from that reference.
3. Run the task's `Verify` command, then the gates.
4. Check the line off in `plan.md` and commit both together, one commit for the task, per
   `.agents/naming.md`.

<!-- shared:gates:start source=gates.md -->
**Run the gates the way CI runs them, before you claim anything passes.** They are recorded in
`.agents/gates.md`, at the repository root — the commands, their order, and which of them a local run
weakens. Read that file; do not reconstruct the gate from what you see in the tree.

- **Run them in the order given.** A formatter after a build check wastes the check, and most orders are
  written down because somebody already lost an hour to the other one.
- **A local command that is not the CI command is not the gate.** Where `.agents/gates.md` says a local
  invocation is softer than CI's — warnings not fatal, a subset of projects, coverage not measured — run
  the CI form or say which one you ran.
- **Generated files are regenerated by the command `.agents/gates.md` names**, never edited by hand.
- **A gate that fails for a reason outside this change is not yours to work around.** Say so and stop.
- **When a gate fails in a way that makes no sense**, read the troubleshooting document
  `.agents/gates.md` points at before debugging your own code.

If `.agents/gates.md` is missing, run the repo's obvious test and build commands, **say which you chose
and that they were not configured**, and do not claim CI parity.
<!-- shared:gates:end -->

**A review line** (`Task N review`, after a task marked `Risky: yes`): send **one** `change-reviewer`
with the task's own commit as the range (`<sha>^...<sha>`, the commit that checked `Task N` off), the
plan task and the spec as paths, and [the task review](prompts.md#the-task-review). Triage, fix in **one
round**, and commit the fixes with the review line checked off. With nothing to fix, commit the checked
line on its own.

**A screens line** (`Task N screens`, after a task with `Screens:`): restart what the task changed, seed
the scenario as the change now has it, and screenshot the task's screens. Then send **one**
`change-reviewer` with the images as paths, the task's `Reference:`, the plan task, the spec and
[the screens review](prompts.md#the-screens-review). Triage, fix in **one round**, and write each finding
into the record's *Screenshot reviews*. Commit the fixes and the record with the screens line checked
off. With no images this run, check the line off with a note in the record.

**The `End review` line**: send the reviewers of [the end review](prompts.md#the-end-review), **all in
one message**, against `<default-branch>...HEAD`. Run every standing reviewer; add a conditional one only
when its trigger fires, and name the ones you skipped and why.

**The `End review fix round` line**: apply what triage kept, run the gates, and commit with both lines
checked off. **A second pass** runs only when a `must` fix changed behaviour no reviewer has seen: add
`End review pass 2` and `End review pass 2 fix round` lines, write the reason into the record, and send
only the reviewers that found a `must`, against the fix range.

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

**Triage, for every review** — yours, not the reviewer's:

- **fix now** — a `must`, and a `should` whose fix is small and inside the diff. **Coverage is the one
  debt the branch cannot carry** where `.agents/gates.md` names a floor, and the fix is the seam, never a
  test written to reach the line.
- **defer** — real, but outside this change or bigger than it: write it under *Deferred* in the record,
  with why it waits.
- **drop** — wrong, enforced by tooling, or contradicted by the spec, the plan or a convention: one line
  in the record when a reader would expect it fixed.

**The record is written as you go**, in the commit that closes each review. Create
`implementation-record.md` beside the spec from [`record-template.md`](record-template.md) the first time
something goes into it; a new session finds what earlier reviews decided there.

<!-- shared:file-handoff:start source=file-handoff.md -->
**Hand work over by path, and keep what a reviewer reads small.**

The session builds the plan itself; what leaves it is review. A reviewer starts with a fresh context and
only what the dispatch names, so the dispatch carries paths and a range, never the conversation.

- **Briefs by path.** The spec, the plan and the review catalogue are named, never pasted. Name the task
  or the lenses the reviewer works; never make it read a whole plan to find its slice.
- **Diffs by range.** A reviewer gets a pinned range (`<base>...<tip>`) and runs `git diff` itself. A
  task review's range is the task's own commit (`<sha>^...<sha>`), found in `git log`; a remembered base
  breaks after a new session merges the default branch in.
- **Reports come back as the agent's answer.** A read-only reviewer cannot write a file, so never name a
  report file in its dispatch. Ask for findings only — `clean` plus at most three lines when there are none.
- **Never tell a reviewer what you decided while building.** Its read is worth having because it did not
  see your reasoning; the plan and the spec are what it judges against.
<!-- shared:file-handoff:end -->

## Step 5 — Complete the record, and write the review walkthrough

When every line is checked, complete `implementation-record.md`: add the decisions you made while
building that a reader could expect to go the other way, and anything worth knowing. Keep every entry
the reviews already wrote.

**Judge the review tier again from the diff**, by the definitions in `.agents/lifecycle.md` § *Review
tiers*. It may go up, never down. Write it as the record's `**Built at review tier:**` line, with the
reason when it went up. **Leave the spec's tier as it is**: it is what the user signed, and the raise
belongs in the record and the review description. Commit the record.

**For a medium or heavy built tier, write the review walkthrough** with [`show`](../show/SKILL.md),
shape `walkthrough`, as `review-walkthrough.html` beside the spec, in the language
`.agents/working-agreement.md` names (English when it names none):

- on a raise: the raise and its reason first, then the spec-walkthrough content the lower tier skipped
- the key facts
- every `Confirm? yes` decision, with the recommendation that is built
- every changed screen: what to open, what to click, what to expect, its "after" image and its "before"
  image where it had one, and the review command from `.agents/preview.md`; for a missing image, the reason
- on heavy: the pattern review (which new pattern, where it lives, what to read in the code) and links to
  the documents `.agents/docs.md` names

Commit it. Bring the preview down if this run brought it up.

## Step 6 — Hand over, as far as the ship mode goes

Set the spec header to `**Status:** Built`, commit, and push the feature branch. Then read
`.agents/forge.md` § *Ship mode*:

| Ship mode | What happens next | Spec status |
|---|---|---|
| `branch` (or not configured) | report and stop; name this repo's ship step from `.agents/forge.md` | `Built` |
| `review` | invoke [`ship`](../ship/SKILL.md) with the facts below; it opens the review | `Shipped`, with the review link |
| `review+watch` | as `review`, then invoke [`babysit`](../babysit/SKILL.md) on that review as your last act | `Shipped` |

**Starting `/deliver` authorizes exactly the steps its ship mode names** — the push, opening the review,
the standing tracker writes `.agents/tracker.md` lists, and the watch. Nothing beyond them.

Hand `ship` what the review description needs, all of it from the spec, `git log` and the record, never
from memory: a title per `.agents/naming.md`; what changed, one line per behaviour; the before → after
evidence; the door (one-way or two-way, and why) and the blast radius; the built review tier; the screens
worth opening; the record's worth-knowing items; the `Confirm? yes` decisions with the outcome built; the
review walkthrough's path.

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

Then report:

```
Branch      <name>, pushed · <n> commits
Review      <link | not opened: ship mode branch>
Gates       <the exact commands you ran, and what each printed>
Built as    <N tasks> · <n> risky reviewed · <n> screens reviewed · <n> parked
Decisions   <n> recorded · <n> marked Confirm? yes
Walkthrough <path | none: light tier>
Next        <what the ship mode leaves to a person>
```

With changed screens and a configured preview, end with the review command as a fenced block, ready to
paste.

## Model choice

<!-- shared:model-choice:start source=model-choice.md -->
**The session builds; agents review and scout.** A call names its model only where this table says so.
`.agents/lifecycle.md` § *Effort and budget* may lower a row for cost; it says so when it does.

| Call | Model |
|---|---|
| build a plan's tasks, and fix what review found | the session's own model — in `/deliver`, no agent writes production code |
| apply review comments a person wrote, via `/babysit` | `finding-fixer`, `sonnet` |
| every `change-reviewer`: plan check, task review, screens review, each end-review reviewer | `opus` |
| the `implementability` spec lens | `opus` |
| the other spec lenses · scouting | `sonnet` |

- **A tier above `opus` is allowed where one missed flaw would be expensive, and is never a
  default.** Name each such step in the plan with one line on why.
- **A `sonnet` agent blocked on execution gets one re-run on `opus`.** An `opus` agent that fails twice is
  re-scoped, or its question left to the end review.
- **Fewer agents beat thinner agents.** Every agent pays a fixed start-up cost before it reads a line —
  on the order of 15–20k tokens — so merging two lenses into one reviewer saves more than trimming a
  tool list or picking a cheaper tier.
<!-- shared:model-choice:end -->

## Review budget

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

## Autonomy — decide, don't ask

The line is in `.agents/working-agreement.md`, and it is binding. Absent one, **default to deciding**:
record it, ship it, and let the review walkthrough show it. The run stops only when:

- the spec gate refuses the spec (step 1);
- the plan fails its check past the re-plan cap (step 2);
- a gate fails for a reason outside this feature (a broken default branch, an expired secret, a service
  down): say it in one line and stop; a fresh `/deliver` resumes at the first unchecked line;
- the design itself is wrong — that goes back to `/grill`.

**A choice the spec leaves open that is expensive to reverse** — a persisted schema, a wire contract, a
permission boundary — is yours too: make it, and record it with `Confirm? yes`, which puts it on the
review walkthrough. Everything else is yours without a question: naming, layering, test level, which
findings to fix. **A question the documents `.agents/docs.md` names can answer is a lookup.**

**Never leave the user with nothing shipped** because one task would not build. Park it: discard its
uncommitted edits, mark its line, its review line and the line of every task that depends on it as
parked (`- [-] … — parked: <reason>`), say why in the record, build what does not depend on it, and
ship that. A parked line is never the next line.

**A task with no seam the plan named** is not a stop: test at the nearest existing seam and record the
choice as a decision.

## Dispatching the agents

<!-- shared:agent-names:start source=agent-names.md -->
**These agents ship inside this plugin, so their `subagent_type` carries the plugin prefix:**
`lifecycle:code-scout`, `lifecycle:spec-reviewer`, `lifecycle:change-reviewer`,
`lifecycle:finding-fixer`.

A bare name may resolve, and it may also pick up a different agent the repo happens to define. **Pass
the prefixed form.** Where this document links an agent by file, the prefixed name is what goes in the
dispatch.
<!-- shared:agent-names:end -->

**Reviews are subagents this session dispatches.** Nothing here needs a harness's thread, delegate or
workflow tool, and nothing should reach for one: a subagent cannot start subagents, so every review is
sent from this session.
