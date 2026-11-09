---
name: frame
description: Turn a ticket or a half-formed sentence into the facts, the size of the work, and the question set worth asking — before any design conversation starts. Reads the ticket, sweeps the edge cases, and splits what it finds into questions only you can answer and assumptions it settled itself. Use at the very start of new work, or on its own when someone asks "what do we actually know about this?", "what still needs deciding?", or "how big is this?". Produces no file; `/grill` consumes what it returns. Keywords - frame, scope it, what do we know, open questions, how big is this, assumptions, edge cases, before we design.
---

# Frame (a request → the facts and the questions)

Everything before the design conversation. You arrive with a ticket key or a sentence; this ends with
three things on the table: **what is true**, **how big it is**, and **what still has to be decided**.

It writes nothing. [`grill`](../grill/SKILL.md) takes the question set straight from here, and
[`spec`](../spec/SKILL.md) turns the assumptions into `## Constraints`. Re-running is cheap.

## When to use

- The first move on any new work.
- Someone asks how big a thing is, or what is still open on a ticket.

Not for: work that already has a spec (that is [`plan`](../plan/SKILL.md)), or a bug whose cause is
unknown (that is [`diagnose`](../diagnose/SKILL.md)).

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

## Step 1 — Read the source

**With a ticket key**, resolve it the way `.agents/tracker.md` says, and mine the whole issue, not
just the description:

- **Fetch everything, then drop the noise.** A field allow-list drops the custom field where this
  project keeps its acceptance criteria.
- **Follow links one hop** — linked issues and subtasks. Stop at one hop; an epic graph is not a
  requirements document.
- **Read the comment thread for scope changes.** A requirement added or withdrawn in a comment
  outranks the description, and it is the most common reason work is measured against the wrong ask.
- **Name any attachment you could not read.** A mockup nobody opened is a stated gap, never a
  requirement guessed from its filename.

**Without one**, the user's sentence is the source. Say back what you understood in two lines before
going further — a misread here costs the whole session.

## Step 2 — Ground it in what already exists

Read the glossary named in `.agents/docs.md` first; it is short and it decides the vocabulary. Then
find out whether the thing being asked for is already here. Spawn
[`code-scout`](../../agents/code-scout.md) — one per area, in a single message — when the answer is
not quick.

**A requirement the codebase already satisfies is a finding, not a requirement.** Say so and let the
user decide whether the ticket is stale or the code is wrong.

Where `.agents/docs.md` names frozen ground, skim it for questions already thought through and pull
the *reasoning* forward. Its conclusions stay behind.

## Step 3 — Classify the path, out loud

Say the classification in one line so it can be overridden. The fast-path rule is in
`.agents/lifecycle.md`.

| Path | What it is | Where it goes |
|---|---|---|
| **spike** | a feasibility question whose output is an answer, not code you keep | say what you will try, get a nod, find out, report a recommendation. Anything built is labelled throwaway. |
| **fast** | whatever `.agents/lifecycle.md` lists — typically a one-file doc edit, a dependency bump, a one-line fix | branch, make the change, commit. No worktree, no grilling, no spec. |
| **full** | everything else | continue to [`grill`](../grill/SKILL.md) |

**A change that needs "and" to describe takes the full path. The ratchet is one way.** Hidden
complexity found later upgrades the path — stop and say so. Nothing downgrades mid-flight, and
reaching for a lighter label to skip work *is* the doubt that means you should take the heavier one.

**Propose the review tier and the risk of a full-path change**, when `.agents/lifecycle.md` § *Review
tiers* uses them: light, medium or heavy, by the definitions written there, and the risk in one clause
or `none`. A spike or the fast path has neither. The tier decides what the user reads later — a chat
summary, or a walkthrough before the build and another after it — so name the clause that sets it.
**Heavy wins**: a change that meets heavy's definition is heavy, even when it also meets light's.

## Step 4 — Sweep the edge cases

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

## Step 5 — Write the criteria so they can be settled

Whatever the user answers becomes an acceptance criterion in the spec, so hold the questions to the
bar the criteria will be held to.

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

## What you return

Four blocks, in the chat, nothing written to disk:

```
**Path:** full · <one clause of why>
**Review tier:** light | medium | heavy · <the clause that sets it>   — omit the line for a spike, the fast path, or a repo without tiers
**Risk:** none | <what could go wrong in production>
**Source:** <KEY> (+ 3 comments, 1 linked issue) | the conversation

**What is true today**
- <fact> — `path/to/file:120`
- <what already exists that this should reuse>

**Open — you decide** (each with two or three answers and my recommendation)
1. <one business question> — A) … → <implication> · B) … → <implication>. **I would take A** because …

**Assumptions — I settled these** (they become spec constraints)
- <edge case> → <handling>, because <convention / codebase / low-risk default>
```

**Every question carries a recommendation.** A question with no recommended answer moves the whole
decision onto the user, which is the opposite of the point.

**If there are no genuine questions, say so and go straight to `/grill`** — but still fill in the
assumptions. Skipping the round trip never skips the edge-case capture.

## Notes

- **Do not write to the board here.** Claiming a ticket is a standing write only where
  `.agents/tracker.md` says so, and it belongs to the skill that owns it.
- One question per line, all of them in one round. Never drip-feed.

## Dispatching the agents

<!-- shared:agent-names:start source=agent-names.md -->
**These agents ship inside this plugin, so their `subagent_type` carries the plugin prefix:**
`lifecycle:code-scout`, `lifecycle:spec-reviewer`, `lifecycle:change-reviewer`,
`lifecycle:finding-fixer`.

A bare name may resolve, and it may also pick up a different agent the repo happens to define. **Pass
the prefixed form.** Where this document links an agent by file, the prefixed name is what goes in the
dispatch.
<!-- shared:agent-names:end -->
