---
name: grill
description: A relentless interview that sharpens a design until nothing is silently assumed, and writes the glossary terms and decision records it settles as it goes. Use whenever a design needs stress-testing — "grill me", "poke holes in this", "let's think this through", "what am I missing" — and as the design half of the lifecycle, between `/frame` and `/spec`. Keywords - grill, grilling, stress test, poke holes, think it through, design tree, frontier, what am I missing, sharpen the idea, decision record, glossary.
---

# Grill (a rough idea → a settled design)

Interview the user relentlessly until you reach a shared understanding. This is the part that cannot
be delegated: the **decisions** are theirs. The **facts** are yours.

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

## The design tree

Map the design as a tree: every decision branches into the decisions that hang off it.

The **frontier** is every decision whose prerequisites are already settled — the questions you can ask
*now* without guessing at answers you have not heard yet.

**Ask the whole frontier in one round.** Number each question, give your recommended answer, then
wait.

```
❓ **Q1** — **<question title>**: <the body, including the choices>

➡️ <your recommended answer, and the one clause of why>
```

Each round's answers reshape the tree: settled decisions push the frontier outward and unblock
questions that depended on them. Recompute and ask the next round.

**A question whose answer depends on another question still open in this round belongs to a later
round.** Asking it now forces the user to answer two things at once, and the second answer is a guess.

**When a round has more than about three questions, or the options differ structurally rather than in a
word, put it on a page instead.** [`show`](../show/SKILL.md) builds a decision sheet — one card per
question, the recommendation marked, every card annotatable — and their notes come back labelled with the
question they belong to. Six questions are far easier to answer side by side than as prose.

**The session ends when the frontier is empty** — every branch visited, nothing silently assumed. Do
not act on it until the user confirms you have a shared understanding.

## Facts are your job

When a frontier question needs a fact from the codebase, **dispatch
[`code-scout`](../../agents/code-scout.md) rather than asking**. Never ask the user something you
could look up.

**Do not block on it.** A running investigation is an unsettled prerequisite, so only the questions
downstream of it wait. Ask the rest of the frontier now.

## Where the frontier comes from

Three sources, in this order:

1. **[`frame`](../frame/SKILL.md)'s open questions**, if it ran. They are already sized and carry
   recommendations.
2. **The edge-case sweep** — anything `frame` recorded as an assumption is a *silent* decision, and
   any one the user might disagree with belongs on the frontier as a question.
3. **What the conversation opens up.** Most rounds after the first come from here.

<!-- shared:edge-case-probe:start source=edge-case-probe.md -->
**Sweep these seven every time, and lose none of them.** The brief states the happy path; the cost sits
in what it left unsaid.

- **Boundary, empty and limit values** — zero, empty, maximum, very large; first and last item; ranges
  that are off by one.
- **Absent or partial data** — null, missing, not-yet-set fields; an optional relationship that does not
  exist.
- **Concurrency and ordering** — two users acting at once, the action repeated, steps out of order, a
  double submit.
- **Failure and rollback** — a dependency fails midway. What state remains, what the user sees, whether
  it is retryable.
- **State and lifecycle transitions** — the entity is already in the target state, archived, deleted or
  locked; the action fired twice.
- **Permissions and roles** — a role the brief never mentioned reaching this path.
- **Locale, formatting and units** — time zones, currencies, decimal and thousands separators.

**Every edge case you find gets exactly one of two homes.** Either it is a decision only the product
owner can make — then it is a question — or you settle it yourself and write it under `## Assumptions`
with the handling you chose and why. **Nothing is dropped.** An edge case that vanishes into prose is one
an implementer will settle alone, silently, at 200k context.

The test for "the product owner must decide this": the answer changes *what* is built rather than *how*;
a developer cannot settle it from the code, the conventions or the domain; and getting it wrong means
reworking shipped behaviour rather than refactoring. If any of the three fails, settle it and record the
assumption. **Better to ask one too few than to flood them with developer-answerable questions.**
<!-- shared:edge-case-probe:end -->

## Three things happen inline, not afterwards

This is why the interview runs before the spec rather than after it — each of these is cheap while the
user holds the design in their head, and expensive once they have moved on.

- **A term that conflicts with the glossary gets challenged on the spot.** Two words for one thing is
  the cheapest bug in the project to fix at this moment and the most expensive later, because it ends
  up in code, tests, tickets and commit subjects. The glossary is named in `.agents/docs.md`.
- **A resolved term goes into the glossary immediately**, in the same round it was settled. If
  `.agents/docs.md` says there is no glossary, say so once and record terms in the spec instead.
- **A decision earns its own record** when all three hold: it is hard to reverse, it is surprising
  without context, and it is the result of a real trade-off. Write it where `.agents/docs.md` says
  decisions live. **Two of three is a line in the spec, not a decision record.**

## What good grilling looks like

- **Lead with your recommendation, always.** A question with no recommended answer moves the whole
  decision onto the user, which is the opposite of the point. They are answering, not designing alone.
- **Push back once on an answer you think is wrong**, with the reason and the cost. Then take their
  decision and record it. Arguing twice is the same as not listening.
- **Name what the answer rules out.** "If we take A, B stops being possible without a migration" is
  the sentence that makes a decision real.
- **Cut what nobody asked for**, out loud, from every option before you present it.
- **Track the rejected alternatives as you go.** They go into the spec; a design with no recorded
  alternatives gets relitigated in three months.

## When to stop early

- **The request is several independent subsystems.** Say so immediately rather than refining the
  details of something that needs decomposing first. Help split it, then grill the first piece.
- **The user says stop.** They chose when to stop thinking. Record what is still open and move on.

## Where it ends

An empty frontier, and the user's confirmation. Then [`spec`](../spec/SKILL.md) writes it down.

Report in four or five lines: what was decided, what was ruled out, which terms went into the
glossary, and any decision record written.

## Dispatching the agents

<!-- shared:agent-names:start source=agent-names.md -->
**These agents ship inside this plugin, so their `subagent_type` carries the plugin prefix:**
`lifecycle:code-scout`, `lifecycle:spec-reviewer`, `lifecycle:change-reviewer`,
`lifecycle:finding-fixer`.

A bare name may resolve, and it may also pick up a different agent the repo happens to define. **Pass
the prefixed form.** Where this document links an agent by file, the prefixed name is what goes in the
dispatch.
<!-- shared:agent-names:end -->
