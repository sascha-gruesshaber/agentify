# Implementation record template

Copy to `implementation-record.md` beside the spec at the start of a [`build`](SKILL.md) run and append
as the build runs. It is the counterpart to the spec: the spec says what was decided *before* the code,
this says what had to be decided *while writing it*, and by whom.

It is **not** a build log. No tool output, no gate results, no "then I ran the tests" — CI proves that,
and the review does not repeat it either.

```markdown
# <Topic> — Implementation Record

**Date:** YYYY-MM-DD
**Spec:** [spec.md](spec.md)
**Ticket:** <KEY> | none
**Built as:** N tickets in M waves | a single unit

## How it was cut

One paragraph: why this split (or no split), and what the parallel waves were. Enough that someone
re-running the feature would cut it the same way. Name any ticket that ran on a cheaper model than the
session's, in one clause — it is the first thing worth revisiting if that ticket comes back in review.

## Decisions

One row per call made without asking, and only the ones a reader could have expected to go the other
way. A decision with no live alternative is not a decision.

| # | Decision | Why | Passed over | Confirm? |
|---|---|---|---|---|
| 1 | <what was chosen, one line> | <the reason, one line> | <the alternative and why not> | yes/no |

`Confirm? = yes` means a human should look at it. Reserve it for calls that are cheap to reverse now and
expensive later, or where a reasonable reviewer would have chosen differently.

## Deferred

Findings that were real but not worth fixing in this change, from the per-ticket reviews and the sweep.

- `<file or area>` — <finding> — <why it waits>

## Worth knowing

Anything that changes how the system behaves or is operated: migrations, config or secrets, a contract
other services consume, something deliberately left undone, a parked ticket.
```

## Rules

- **Append as you go.** Written at the end it is a reconstruction, and the reasons are already gone.
- **A decision needs a live alternative.** "Used the existing table component" counts only if writing a
  new one was genuinely on the table.
- **Plain technical wording.** A reviewer skims this in a minute; it is not a decision record.
- A decision that closes off alternatives *across* the codebase earns its own decision record instead,
  where `.agents/docs.md` says those live. Propose it; the numbering is the user's.
