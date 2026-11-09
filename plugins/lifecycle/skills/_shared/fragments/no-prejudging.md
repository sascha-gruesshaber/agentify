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
