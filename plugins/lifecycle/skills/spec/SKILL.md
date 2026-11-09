---
name: spec
description: Write the settled design down as the contract — one numbered list of requirements, one numbered list of acceptance criteria, the decisions and what they ruled out. States WHAT, never HOW. Commits the spec where the repo keeps them, at Status Specced, where `/plan` and `/deliver` pick it up. Where the repo uses review tiers, shows the user a spec walkthrough (or a chat summary for a light change) and records their sign-off before the commit. Use after a design is agreed, when someone asks to "write it up", "spec it out", "pin down the requirements", or to revise a spec the work has outgrown. Keywords - spec, write it up, spec it out, requirements, acceptance criteria, the contract, pin it down, revise the spec.
---

# Spec (a settled design → the contract)

Turn the agreed design into a document that can be **graded**. That is the whole difference between a
spec and a conversation: `/plan`, every reviewer and `/deliver` all measure their work against this file,
and against a conversation they measure against nothing.

Runs after [`grill`](../grill/SKILL.md) reaches an empty frontier.

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

## When NOT to use

- **The frontier is not empty** → back to [`grill`](../grill/SKILL.md). A spec with holes is a contract
  nobody can sign.
- **A spec already exists for this work** → read it and use `--revise`. Never write a second one; two
  specs for one change is a contradiction nothing detects.
- **A change too small to have requirements.** A one-line fix does not need a contract, and writing one
  costs more than the change.
- **Turning it into tasks** → [`plan`](../plan/SKILL.md).

## Step 1 — Where it goes

The path is in `.agents/tracker.md` — typically `<specs dir>/<KEY>-<short-desc>/spec.md`, with the
same `<short-desc>` as the branch per `.agents/naming.md`. Without a ticket key the directory is just
`<short-desc>`.

**It is committed.** Unlike every comparable system, the spec lives in the repo, moves through review
and has a history — which is what makes "was this requirement weakened to fit the code?" answerable at
all. Do not put it anywhere else.

## Step 2 — Write it

```markdown
**Date:** YYYY-MM-DD
**Status:** Specced
**Ticket:** <KEY> | none
**Risk:** none | <what could go wrong in production: data, auth, a contract, a migration>
**Review tier:** light | medium | heavy   ← only where `.agents/lifecycle.md` uses review tiers
**Signed off:** YYYY-MM-DD · walkthrough | chat · <fingerprint>   ← written by spec-gate.mjs sign, never by hand

**Scope:** One paragraph — what this covers and what it deliberately doesn't.

## Problem

Two or three sentences: what is wrong or missing today, for whom, and why now. No design.

## Requirements

1. <what the system must do, observably> — *source: ticket description*
2. <...> — *source: Q3 answered B*
3. ~~withdrawn~~ — <why, and when>

## Acceptance criteria

1. <an observable outcome a test or a tester can settle> — *covers requirement 1*
2. <...> — *covers requirements 2, 3*

## Decisions

- **<decision>** — <the reason, one clause>. Rejected: <the live alternative and why not>.

## Constraints

- <an edge case settled without asking> — assumed because <convention / codebase / low-risk default>.

## Out of scope

- <what this deliberately does not cover, especially anything a reader would expect it to>

## Open

- <a question still unanswered> — blocks criterion <n>. *(Delete this section once empty.)*
```

**The header is fixed, not free-form.** It is the one place any skill looks to know where the work
stands, and **no skill re-derives state from a branch name or a directory listing.**

| `**Status:**` | Means | Set by |
|---|---|---|
| `Specced` | designed and agreed, nothing built | `/spec`, when it commits |
| `Building` | in flight; `plan.md`'s `## Build` checklist says how far | `/deliver`, when it starts building |
| `Built` | the branch is green and pushed; `**Branch:**` carries the name | `/deliver`, at the end |
| `Shipped` | the review is open; `**Review:**` carries the link | `/ship` |
| `Superseded by <path>` | a later spec replaced this one | whoever wrote the replacement |

**A stale header is worse than no header, because the next run trusts it.** `Superseded by` is the one
that gets forgotten: a spec replaced by a later one and left at `Specced` is a spec `/advance` will
happily pick up and plan.

Anything beyond this table is not a status. Do not invent one.

**`Risk:` and `Review tier:` are proposed by `/frame`**, by the definitions in `.agents/lifecycle.md` §
*Review tiers*. A `Risk:` other than `none` makes the tier `heavy`; the spec gate refuses anything less,
and treats a missing `Risk:` line as a risk. Without review tiers in `.agents/lifecycle.md`, leave both
tier lines out: the spec is built as before. `Signed off:` is added in step 4.

**`## Decisions` carries the rejected alternatives**, or the design gets relitigated in three months.
A decision with no live alternative is not a decision; leave it out.

**`## Decisions` is not `## Implementation`.** Record *what was chosen* — a library, a boundary, a data
shape the user agreed to. The moment you name a file path, a class or a task order, it belongs in
[`plan`](../plan/SKILL.md), where it gets scouted against the real code and reviewed.

<!-- shared:criterion-quality:start source=criterion-quality.md -->
**A criterion nobody can settle is worse than a missing one.** It survives every review, because each
reviewer grades how completely the wording was satisfied rather than whether it could be.

- **State an observable outcome. Never name a function, a control-flow step, or a validity notion the
  change is expected to introduce.** Naming one that does not exist yet hands the implementer a design to
  invent in order to satisfy the wording, and from then on every review grades how completely the
  invention was built.
- **No proxy evidence.** A criterion the repository cannot produce evidence for is not a criterion. The
  only thing that could satisfy "the code is clear" is a test asserting some prose is still present.
- **Verify every count, path, symbol and file the criterion asserts, with a command you actually ran** —
  a `git ls-files`, a grep whose output you read. A number you have not confirmed belongs in the
  criterion as **"every site"**, a form an off-by-one cannot falsify, not as "the five sites".
- **Read the criteria together as a set** and confirm one implementation can satisfy all of them at once.
  Two criteria that are individually reasonable and jointly impossible are visible only side by side.

The same bar governs an assumption recorded instead of a question: an assumption you cannot check is a
question somebody should have asked.
<!-- shared:criterion-quality:end -->
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

**A task gets its own review only when the plan marks it `Risky: yes`:** it touches authentication,
tenancy, permissions, a migration or a wire contract. Every other task is read by the end review.

**One fix round per pass, by the session that wrote the code.** What it does not fix goes into the
implementation record as a deferral, with the reason — never into another review round.

**Never argue with a finding by sending another reviewer.** Settle it yourself, in the open.

**Spending more than this is the user's call, never a quiet one of yours.** Say what another pass would
look at and what it would cost, and let them ask.
<!-- shared:review-budget:end -->

## Step 3 — Check it before anyone builds on it

Everyone who has read this so far was in the room while it was designed, so the question that decides
its quality — **does this document stand on its own?** — is still unasked.

Spawn [`spec-reviewer`](../../agents/spec-reviewer.md) once per lens, all of them in one message.
Lenses, and the bodies to paste, are in [`spec-lenses.md`](spec-lenses.md).

Say one line first, so a fresh round of questions does not arrive unexplained:

> Four reviewers are reading this cold — none of them saw our conversation. Anything they cannot work
> out from the document alone is something an implementer will not be able to either.

**Route by severity. That is yours, not the user's:**

- **`fix`** — apply it yourself and report a count, not a list.
- **`question`** — back to [`grill`](../grill/SKILL.md). Each is a live frontier item: ask them as one
  round, each with your recommendation, then wait. A gap settled here in a sentence is one an
  implementer would otherwise settle alone at 200k context.
- **`note`** — drop it unless it changes something.

Fold every answer back in, decisions and rejected alternatives included, so the document carries the
reasoning rather than the conversation.

**The round cap is in `.agents/lifecycle.md`** — typically two, the second only if the first changed
the design. A spec that gained three decisions is worth re-reading; one that gained wording is not. If
a further round still returns `question` findings, stop spawning reviewers, carry on with the user
directly, and record what is still open under `## Open`.

## Step 4 — The user signs it off

After the cold read, before the commit. **A spec without a review tier skips this step**; show it the
way step 5 says instead.

- **Medium or heavy:** invoke [`show`](../show/SKILL.md), shape `walkthrough`, for
  `spec-walkthrough.html` beside the spec, in the language `.agents/working-agreement.md` names (English
  when it names none). Overview first, and as little prose as possible:
  - what changes for the user
  - how it is solved, to the depth a lead developer must understand
  - what later work will copy
  - the one-way doors, and what is left out
  - the tier, and the clause that sets it
  - every changed user flow as a UI mock
- **Apply or answer every note, show the page again, and repeat until they sign it off with no note
  open.** A note that changes the design is one more grilling round.
- **Light:** one paragraph in the chat with what changes and why it is light. Their "fine" is the
  sign-off.
- **Then record it:** `node <skills>/_shared/tools/spec-gate.mjs sign <spec dir> --via walkthrough|chat`,
  where `<skills>` is the parent of this skill's own directory. The fingerprint covers requirements,
  criteria and decisions, so sign after the last edit to them.

**Why a page and a signature:** the person who owns the change reads two pages — this one before the
build, the review walkthrough after it — instead of every line of a spec and a diff. The fingerprint is
what makes the first page binding: `/plan`, `/deliver` and `/advance` refuse a tiered spec whose signed
sections changed since.

## Step 5 — Commit

One commit, with the walkthrough file when there is one: `docs(specs): design <feature>`, per
`.agents/naming.md`. Leave it uncommitted until steps 3 and 4 are done — what comes back usually
changes it.

An untiered spec still gets put in front of the user: name the file, or, when the requirements are worth
reading one at a time and annotating, [`show`](../show/SKILL.md) builds it as a page whose numbered lines
they can comment on.

## Step 6 — Tell the board, if that is a standing write

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

## Revising

`--revise` rewrites an existing spec **in place, preserving every number**. New requirements append;
removals become `~~withdrawn~~`. If it cannot preserve the numbering, it stops and says why.

**An edit to requirements, criteria or decisions invalidates the sign-off.** Before the revision is
committed, update the walkthrough, show it again and run step 4 once more. `/plan` and `/deliver` send a
spec here when the spec gate refuses it.

**A revision during implementation is a retrofit risk.** Weakening a requirement so the code passes
turns a failed implementation into a passing one without anybody deciding to. So a revision says in the
header **what changed and why** — and because the spec is committed, the diff backs that up.

**An old-shape spec is left alone until it is revised.** Specs written before this numbering existed
are read as they are; `--revise` is what gives them numbers.

## Chat summary

The path, the status, the counts (N requirements, M criteria, K constraints), every open question by
name if the status is draft, and anything the grounding pass found — a requirement the codebase already
satisfies, one that looks impossible, an attachment nobody could read. Then: `/plan` is next.

## Language

The spec is **English**. Chat may stay in the user's language. The walkthrough is in the language
`.agents/working-agreement.md` names for walkthroughs — it is written for the person who signs it off.

## Dispatching the agents

<!-- shared:agent-names:start source=agent-names.md -->
**These agents ship inside this plugin, so their `subagent_type` carries the plugin prefix:**
`lifecycle:code-scout`, `lifecycle:spec-reviewer`, `lifecycle:change-reviewer`,
`lifecycle:finding-fixer`.

A bare name may resolve, and it may also pick up a different agent the repo happens to define. **Pass
the prefixed form.** Where this document links an agent by file, the prefixed name is what goes in the
dispatch.
<!-- shared:agent-names:end -->
