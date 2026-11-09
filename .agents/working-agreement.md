# Working agreement

How to work *with the people here* — as binding as the gates. Everything below is a decision somebody
made, not a default.

## Hours and unattended work

- **Working hours:** Mon–Fri, 08:00–15:00 CET.
- **Nothing runs unattended outside them.** A run that finishes at 02:00 with a question nobody answers
  has stalled, not succeeded.
- **Before arming any watch, loop, cron or background run that outlives the working day, ask.** It is
  the maintainer's call to waive this, and only theirs. Asking costs one line; a loop nobody stopped
  costs a night of tokens.

## The autonomy line

**Default to deciding.** Record it, ship it, surface it as a review question. Stop and ask only when:

- proceeding either way changes **user-visible behaviour the spec does not settle**, and the choice is
  expensive to reverse. In this repo, "user-visible" and "expensive to reverse" mean:
  - **the public contract of a skill or command** — its name, its frontmatter `description` (which is how
    the model decides to load it), or the phase it hands off to;
  - **the shape of `.agents/`** — adding, removing or renaming one of the nine files, or a section other
    skills read, because every consumer repo's install then disagrees with the templates;
  - **a version bump** that puts a change in front of consumers, since the marketplace cache is keyed on
    it and there is no way to un-ship;
  - **a new CI gate that would fail existing content**;
- a gate fails for a reason outside this change — a broken `main`, an expired token, GitHub down;
- **the design itself turns out wrong.** That goes back to `/grill`, not forward into code.

Everything else is the agent's: wording, which fragment a rule belongs in, how to split the work, test
tier, which findings to fix, which model each agent runs on.

**A question answerable from the documents in [`docs.md`](docs.md) is a lookup, not a question.**

## How to report

- **Plain, controlled English** — the `plain-words` style that ships in this repo. Small words, short
  sentences, one idea per sentence.
- **Three things: what you did, whether it worked, what to do now.** Detail belongs in the artefact, not
  in the chat.
- **Two options maximum** when a decision is needed, each with the context to choose fast, and a
  recommendation.
- **Paths and commands exact.** Never paraphrased.
- **Language:** English for everything written to the repo, whatever language the session ran in.
- **Walkthrough language:** English — moot while review tiers are off, set so a later switch-on has an answer.

## Deliberately not adopted

Proposals from `/onboard` that were declined, so nothing re-argues them.

| Date | Proposal | Declined because |
|---|---|---|
| — | *none yet* | The 2026-08-14 install proposed 8 changes and all 8 were adopted. |

## Known traps that already cost a round

Facts, not preferences.

- **The plugin you are editing is not the plugin you are running.** Skills load from
  `~/.claude/plugins/cache/agentify/lifecycle/<version>/`. A fix to `plugins/lifecycle/` changes nothing
  in the current session until the version is bumped and the plugin reinstalled. This makes a broken
  skill look fixed. See [`gates.md`](gates.md).
- **Editing an injected copy instead of its fragment.** The edit looks right, then `skills.mjs sync`
  silently overwrites it, or `check` fails and names a file you never meant to touch. **Edit
  `skills/_shared/fragments/<name>.md`, then `sync`.**
- **Bumping one version and not the other.** `plugin.json` and `marketplace.json` must move in the same
  commit. CI catches it; a local run does not.
- **Nothing blocks a merge.** `main` has no branch protection and CI is advisory, so a red run can be
  merged by accident. Treat red as blocking yourself — see [`forge.md`](forge.md).
- **Two grep-able comment surfaces on a pull request.** `gh pr view --comments` and the
  `pulls/<n>/comments` API return different sets. Read both before saying a review is clear.
