# Implementation record template

[`deliver`](SKILL.md) writes `implementation-record.md` beside the spec in this shape, as reviews
close and complete at the end. The spec says what was decided *before* the code; the record says what
was decided *while writing it*.

It is **not** a build log: no tool output, no gate results. CI proves those. It holds only what a reader
could expect to go the other way, what waits for later, and what changes how the system is operated.

```markdown
# <Topic> — Implementation Record

**Date:** YYYY-MM-DD
**Spec:** [spec.md](spec.md)
**Ticket:** <KEY> | none
**Built as:** N tasks
**Built at review tier:** light | medium | heavy — <"as the spec said", or "raised from <tier>: <why>"> | none (untiered spec)

## Decisions

One row per call made without asking that a reader could expect to go the other way.

| # | Decision | Why | Passed over | Confirm? |
|---|---|---|---|---|
| 1 | <what was chosen, one line> | <the reason, one line> | <the alternative and why not> | yes/no |

`Confirm? = yes` puts it on the review walkthrough, with the choice above as the recommendation that is
built. Use it for calls that are cheap to reverse now and expensive later, or where a reasonable
reviewer would choose differently. [`babysit`](../babysit/SKILL.md) writes the user's answer in as
`answered: <answer>`. **A decision still unanswered when the review merges accepts the recommendation.**

## Deferred

Real findings that wait for a later change: review findings triaged as *defer*, plan-check changes that
could not be applied, and a parked task. They become the review description's "worth knowing" bullets.

- `<file or area>` — <finding> — <why it waits>; an `adjacent` cleanup says *worth a follow-up*

## Screenshot reviews

Only when the plan has a task with `Screens:`: one line per screens review, its findings fixed or
deferred, or "no findings". A run without images says why. Delete the section otherwise.

- Task <N> · <screens> — <finding> — fixed | deferred: <why> | no findings

## Second pass

Only when the end review ran twice: the reason, in one line. Delete the section otherwise.

## Worth knowing

Anything that changes how the system behaves or is operated: migrations, config or secrets, a contract
other systems consume, something deliberately left undone.
```

## Rules

- **Write it as you go.** Written at the end it is a reconstruction, and the reasons are already gone.
- **A decision needs a live alternative.** "Used the existing table component" counts only if writing a
  new one was a real option.
- **Plain technical wording.** A reviewer skims this in a minute; it is not a decision record.
- A decision that closes off alternatives *across* the codebase earns its own decision record, where
  `.agents/docs.md` says those live. Propose it; the numbering is the user's.
