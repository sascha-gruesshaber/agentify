**Date:** 2026-11-09
**Status:** Built
**Branch:** feat/deliver-in-session
**Ticket:** none

**Scope:** Replace `/build`'s implementer waves with `/deliver`: the session builds, fresh agents only
review. Add review tiers with a signed-off spec walkthrough, a review walkthrough at the end, screenshot
review of UI tasks, and a configurable end of the run (branch, review, or watched review) that `/onboard`
picks per repo. Ported from the process a production repo arrived at after many built features. It does
not port that repo's tracker, forge or UI tooling.

## Problem

`/build` hands every ticket to an implementer agent in its own worktree, reviews each ticket, and
fixes through more agents. Measured on the source repo's agent transcripts:

- Hand-overs cost more than the code. Each implementer paid tens of thousands of tokens to orient
  itself, the lead spent a large share triaging and integrating, and fixers reread code someone else
  wrote.
- A per-ticket review found a `must` about as often as the end review after it did. The per-ticket
  review did not reduce what the end review found.
- Compaction now holds a long build in one session.

The human's attention also went to the wrong place: decision threads on a finished change, with no
picture of the UI and no check that the spec they agreed to is still the one being built.

## Requirements

1. `/build` is renamed `/deliver`. The session that runs it builds every plan task itself, serially,
   test-first, one commit per task. No agent writes production code. `ticket-implementer` and
   `operator-view` are removed; ticket splitting, waves and per-ticket worktrees are removed.
2. `plan.md` carries a `## Build` checklist. `/deliver` checks each line off in the commit that
   completes it, and a compacted or new session resumes at the first unchecked line. The ledger is
   removed.
3. Every plan task carries `Risky: yes|no`. After a risky task, one fresh `change-reviewer` reads that
   task's own commit before the next task starts. The session triages and fixes in one round.
4. After the last task, fresh reviewers read the whole diff in parallel, each with its own lenses: three
   standing reviewers and conditional ones on a trigger. One fix round by the session; a second pass only
   with a written reason, scoped to the fix range and the reviewers that found a `must`.
5. Reviews are subagents the session dispatches. Nothing in the plugin depends on a harness's thread,
   delegate or workflow tool.
6. A spec may carry `**Review tier:** light | medium | heavy`. `/frame` proposes it. For medium and heavy,
   `/spec` shows a spec walkthrough page; for light, a chat summary. The sign-off is a header line with a
   fingerprint over requirements, criteria and decisions, written by a shipped tool.
7. `/plan`, `/deliver` and `/advance` refuse a tiered spec whose sign-off is missing or no longer matches.
   A spec without a tier is built as before.
8. `/deliver` judges the tier again from the diff, only upward, and for medium or heavy writes a review
   walkthrough before the run ends: key facts, `Confirm? yes` decisions with the built recommendation,
   changed screens with before and after images.
9. A plan task that changes a screen names `Screens:`, a `Scenario:` and a `Reference:`. When the repo
   configured a preview, `/deliver` takes before images on the default branch, after images per UI task,
   and has one fresh reviewer read them against the reference. Unconfigured, it skips the step and says so.
10. How the preview works is a new `.agents/preview.md`: bring the app up, seed a scenario, take
    screenshots, stop it, and where the design reference lives.
11. How far `/deliver` runs is `.agents/forge.md`'s **Ship mode**: `branch` (a green pushed branch),
    `review` (also open the review), or `review+watch` (also tend it until merged or closed). Starting
    `/deliver` authorizes exactly the steps that mode names.
12. Two new skills carry the forge half: `ship` opens the review the way `.agents/forge.md` says, with the
    description built from the record; `babysit` tends an open review (comments, CI, conflicts) and hands
    comment-driven code changes to `finding-fixer`.
13. `/onboard` detects the forge CLI and its auth, branch protection, CI on reviews and a UI with a
    screenshot tool, recommends a ship mode and whether to use review tiers, and writes `preview.md`.
14. Walkthroughs are written in the language `.agents/working-agreement.md` names; the default is English.
15. Model choice: the session builds; every reviewer defaults to `opus`; scouts and the cheaper spec
    lenses to `sonnet`. The plan profiles set reviewer counts instead of wave widths.

## Acceptance criteria

1. No file under `plugins/` names `ticket-implementer`, `operator-view`, `/build` as a skill, a wave or a
   ledger, except where a document says they were removed.
2. `skills.mjs check` is clean and its tests pass; `spec-gate.mjs` and `check-page.mjs` have `node:test`
   suites that pass and run in CI.
3. `spec-gate.mjs check` refuses a tiered spec without a sign-off, after an edit to a signed section, and
   for a `Risk:` other than `none` below heavy; it passes an untiered spec.
4. `check-page.mjs` refuses a walkthrough over its size limit, a page with no note block and a page
   without its notes script; it runs the wiring in `jsdom` when the repo has it, and a static check otherwise.
5. The onboard templates contain `preview.md`, a ship mode in `forge.md` and a walkthrough language in
   `working-agreement.md`; the README tables list nine files and the new skills.
6. This repo's own `.agents/` describes the new lifecycle: ship mode `review`, preview not configured.
7. Both versions are bumped together.

## Decisions

1. **Rename to `/deliver` without an alias.** The skill no longer stops at a branch in every repo, so
   `build` would misname it. Single maintainer, pre-1.0; an alias is a second name to keep in step.
2. **A ninth `.agents/` file for the preview**, not a section of `gates.md`. Gates block a merge; a
   preview never does, and a repo without a UI writes `NOT CONFIGURED` once.
3. **Ship mode is a repo setting, not a run flag.** A repo either wants the agent to open reviews or it
   does not; asking per run reintroduces the question `/deliver` exists to avoid.
4. **`check-page.mjs` falls back to a static check** when `jsdom` is not resolvable from the repo, and
   says so. The plugin ships no `node_modules`.
5. **`/plan-check` sends one reviewer with all eight axes**, not one per axis. Same reason as the
   grouped end review: eight agents reading the same two documents pay the start-up cost eight times.
6. **`/babysit` approves or merges only on the user's word, and only with a command `.agents/forge.md`
   names.** Without one, the person presses the button. This is not a forge-specific command in the
   plugin, so it stays inside Out of scope.
7. **Built directly, without `plan.md` or `/deliver`.** The skills that would plan and build this are
   the ones it changes; the installed plugin still runs the old `/build`. The end review ran as three
   fresh reviewers by hand.
8. **Not ported:** the source repo's discuss wrapper, retro skill, transcript cost tool, worktree tool and
   tracker or forge scripts. Each is tied to that repo's tracker, forge or harness.

## Constraints

- Nothing in `plugins/lifecycle/` names a specific repository, language, tracker or company
  (`CONTRIBUTING.md` § *The one rule*).
- A rule used in two skills lives in a fragment.

## Out of scope

- A forge-specific approve or auto-merge command. `ship` and `babysit` run what `forge.md` writes down.
- Migrating a repo that already ran `/onboard` beyond what a re-run of `/onboard` does.

## Open

Nothing open.
