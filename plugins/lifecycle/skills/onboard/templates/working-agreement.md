# Working agreement

How to work *with the people here* — as binding as the gates, and the one thing a repo almost never
writes down. Everything below is a decision somebody made, not a default.

## Hours and unattended work

- **Working hours:** <Mon–Fri, 08:00–15:00 CET>
- **Nothing runs unattended outside them.** A run that finishes at 02:00 with a question nobody
  answers has stalled, not succeeded.
- **Before arming any watch or loop that outlives the working day, ask.** It is the user's call to
  waive this, and only theirs.

## The autonomy line

**Default to deciding.** Record it, ship it, surface it as a review question. Stop and ask only when:

- proceeding either way changes **user-visible behaviour the spec does not settle**, and the choice is
  expensive to reverse — a persisted schema, a wire contract, a permission boundary;
- a gate fails for a reason outside this change — a broken default branch, an expired secret, a
  dependency service down;
- **the design itself turns out wrong.** That goes back to `/grill`, not forward into code.

Everything else is the agent's: naming, layering, test tier, which findings to fix, how to split the
work, which model each agent runs on, which existing library to use.

**A question answerable from the documents in [`docs.md`](docs.md) is a lookup, not a question.**

## How to report

- <Short declarative answers. Detail belongs in the artefact, not the chat.>
- <Two options maximum when a decision is needed, each with the context to choose fast, and a
  recommendation.>
- <Paths and commands exact.>
- <Language: <English | the user's language>. Anything written to a shared board or repo is English.>
- **Walkthrough language:** <English> — the spec and review walkthroughs are written for the person who
  signs them off; specs, plans and commits stay English.

## Deliberately not adopted

Proposals from `/onboard` that were declined, so nothing re-argues them.

| Date | Proposal | Declined because |
|---|---|---|
| <YYYY-MM-DD> | <what was proposed> | <the reason> |

## Known traps that already cost a round

Facts, not preferences. Each one is here because somebody lost time to it.

- <the trap, and the one line that avoids it>
