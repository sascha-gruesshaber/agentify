---
name: workflow
description: Work out where a piece of work already stands and run the phase that comes next — reading the state off disk rather than asking. Advances through the unattended phases in a row and halts at any phase that needs a person. Use when the user says "advance", "next step", "continue", "keep going", "carry on", "what's next", "where are we", "pick up where we left off", or invokes /advance. Also use when resuming work after a break or a fresh session, and when you are unsure which lifecycle phase applies. Keywords - workflow, advance, next step, continue, keep going, carry on, what's next, where are we, resume, pick up, drive it forward, which phase, state of play.
---

# Workflow (state on disk → the phase that comes next)

**You do none of the work here. You route.** This skill reads where an effort already stands, names the
phase that comes next, and invokes it. Then it does the same again, until it reaches something that
needs a person.

It exists because the lifecycle has eight phases and remembering which one is next is not a good use of
anybody's attention — **and because the answer is already written on disk.** Every artefact the
lifecycle produces is committed, and the spec's `Status:` header is a state machine nobody was reading.

Three ways in, all the same thing: the command **`/lifecycle:advance`**, the skill **`lifecycle:workflow`**,
or just saying **"advance"** or **"what's next"** in a sentence.

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

## Arguments

| Form | Means |
|---|---|
| `/lifecycle:advance` | find the effort, run the next phase, keep going until a gate |
| `/lifecycle:advance <path>` | the same, for a named spec or effort directory |
| `/lifecycle:advance --once` | run exactly one phase, then stop and report |
| `/lifecycle:advance --dry` | say where you are and what is next. **Run nothing.** |

**Start with `--dry` when you are not sure the state is what you think it is.** It costs one turn and it
is the whole point of having the state written down.

**Write the command in its namespaced form whenever you name it back to the user** — a plugin command is
`/<plugin>:<command>`, and the bare `/advance` is an unknown command. Telling somebody to type a command
that does not resolve costs them a round for nothing.

## Step 1 — Find the effort

In this order, and **say which rule matched** in one line:

1. **A path in the argument.** A spec file, or the directory holding one.
2. **The current branch name.** `.agents/naming.md` maps a branch to its effort directory.
3. **The most recently modified effort directory** whose spec is neither `Built`, `Shipped` nor
   `Superseded by <path>`.
4. **Nothing found** → there is no work in flight. Say so and offer `/frame`.

**Two efforts in flight and no argument is an ambiguity, not a guess.** List them with their statuses
and ask which one. Picking the most recent is exactly the wrong move when somebody has just come back to
older work.

## Step 2 — Read the state

Read only these. **Every one is a fact on disk; none of it is inferred from the conversation**, which is
what makes this work in a fresh session.

| Question | Where the answer is |
|---|---|
| is this repo configured at all? | does `.agents/` exist |
| which phases are even on here? | `.agents/lifecycle.md` |
| is there a contract? | `spec.md` exists |
| how far has it got? | the spec's `**Status:**` header |
| is the contract complete? | is `## Open` absent or empty |
| is it signed off? | `spec-gate.mjs check <spec dir>` (in `<skills>/_shared/tools/`, `<skills>` being the parent of this skill's directory) |
| is there a plan? | `plan.md` exists |
| is the plan current? | its `Spec:` header names this spec, and no commit after `Scouted:` changed the spec below its header (a status or sign-off line is not a change) |
| was the plan checked? | `plan-check.md`, and its `**Verdict:**` line |
| how much is built? | `plan.md`'s `## Build` checklist, and `git log` |
| what has already been decided alone? | `implementation-record.md` |
| how far may the run go? | `.agents/forge.md` § *Ship mode* |

**`git log` outranks your memory and outranks a stale header.** A task whose commit is on the branch is
done whether or not its line is checked — say so, and fix the checklist.

## Step 3 — The state table

Read top to bottom and take the first row that matches. **The status rows come before the plan rows on
purpose:** once `/deliver` has started, the plan is its progress record, and re-planning would wipe it.

| State | Next phase | Gate? |
|---|---|---|
| no `.agents/` directory | `/onboard` | **halt** — it interviews you |
| `.agents/` exists, no effort found | `/frame` | **halt** — it returns questions |
| an effort exists, no `spec.md`, questions unanswered | `/grill` | **halt** — it is an interview |
| design settled in conversation, no `spec.md` | `/spec` | continue |
| `spec.md` has a non-empty `## Open` | `/grill` | **halt** — a draft is not a contract |
| `Status: Shipped` | `/babysit` when the user asks, or the ship mode watches | **halt** — name the review link |
| `Status: Built`, ship mode `review` or `review+watch` | `/ship` | continue |
| `Status: Built`, ship mode `branch` or none | — | **halt** — name this repo's ship step from `.agents/forge.md` |
| `Status: Building`, the spec gate passes | `/deliver` — it resumes at the first unchecked line | continue |
| `Status: Specced` or `Building`, the spec gate exits 1 | `/spec --revise` | **halt** — the user signs the walkthrough off again |
| `Status: Specced`, no `plan.md` | `/plan` | continue |
| `plan.md` exists but is stale for its spec | `/plan` | continue |
| `plan.md` current, no `plan-check.md` | `/plan-check` | continue |
| `Verdict: Not ready`, under the re-plan cap | `/plan` | continue |
| `Verdict: Not ready`, cap reached | — | **halt** — get a person |
| `Verdict: Ready with changes`, `Status: Specced` | `/deliver` — it applies them itself and does not check again | continue |
| `Verdict: Ready to build`, `Status: Specced` | `/deliver` | continue — it asks nothing until its ship mode ends |
| `Status: Superseded by <path>` | — | **halt** — say so, and offer to advance the spec it names instead |

**A phase `.agents/lifecycle.md` turns off is skipped, and you say you skipped it.** That file is the
authority on which phases exist here; a repo that does not use `/plan-check` should not be told it is
missing one.

**A state not in this table is a real finding.** Say what you observed, say it does not match a known
state, and stop. **Never pick the nearest row.** A `plan.md` beside a spec that says `Specced` with
every `## Build` line checked, a `Verdict:` line you cannot parse — each of those means something happened that
this table does not model, and guessing costs more than asking.

## Step 4 — Report, then run

**Report before you run**, in this shape, so a wrong reading is caught in one line rather than three
phases later:

```
effort    <path>            (matched by: branch name)
status    Specced
beside    plan.md ✓   plan-check.md ✗   signed off ✓
next      /plan-check, then /deliver
ends at   an open review   (ship mode: review)

running /plan …
```

Then invoke the phase **as a skill**. You are not reimplementing it.

- **`--dry` stops here.** Report and return.
- **`--once` runs this one phase**, reports, and returns.
- **Otherwise keep going**: after a phase completes, go back to step 2 and re-read the state from disk.
  **Re-read it; do not assume the phase moved it where you expected.** A phase that failed halfway leaves
  a state the table can route on, and trusting your expectation is how a run marches past a problem.

## Step 5 — Halt properly

A halt is a result, not a failure. **Say three things and stop:**

1. **where the work now stands** — the new status, and the artefact that proves it;
2. **why you stopped** — a human gate, a verdict, a cap, an unknown state;
3. **the exact next command**, or the exact question that needs answering.

```
halted   the spec changed after its sign-off
stands   Specced · spec-gate: requirements, criteria or decisions changed since the sign-off
next     /spec --revise <spec dir> — then sign the walkthrough off again
```

**Never halt silently, and never halt without naming the next move.** A driver that stops without saying
why is worse than no driver, because the user now has to work out both where they are *and* whether
something broke.

## What halts a run, in full

- **Every interactive phase** — `/onboard`, `/frame`, `/grill`, and `/spec`'s sign-off. Their whole
  value is that a person answers, and answering for them defeats the purpose.
- **A spec the spec gate refuses.** The sign-off is the person's, never the driver's.
- **A verdict or a cap** — `Not ready` twice, a fix loop past its round cap, a failing gate.
- **An unknown state**, per step 3.
- **Outside working hours**, where `.agents/working-agreement.md` sets them. Run the phase you are on if
  somebody is clearly there, then say you are not starting another chain tonight. **Do not begin an
  unattended chain that will finish with a question nobody is awake to answer.**

## What this skill must never do

- **Never do a phase's work itself.** If `/plan` is next, invoke `/plan`. A router that starts planning
  is a second planner nobody reviews.
- **Never skip a gate because the answer looks obvious.** The gates are where the expensive mistakes get
  caught.
- **Never edit a spec or a plan** — beyond correcting a status line or a checklist line that `git log`
  contradicts, which you report in one line.
- **Never sign a spec off.** Only `/spec` does, on the user's word.
- **Never advance an effort the user did not name when two are in flight.**

## Dispatching the agents

This skill spawns none. It invokes skills, and those skills dispatch their own agents.
