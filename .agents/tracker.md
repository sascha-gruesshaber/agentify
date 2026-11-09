# Specs

## There is no issue tracker

- **Tracker:** **none.** GitHub Issues is **disabled** on this repository — `gh issue list` returns
  *"the 'sascha-gruesshaber/agentify' repository has disabled issues"*.
- **Nothing is ever written to any board.** There is no board. No skill claims an item, posts a
  comment, or moves a status. If a future run finds a tracker, it stops and asks rather than writing.
- **Ticket keys do not exist here.** Every place the plugin's naming grammar offers `<KEY>-<short-desc>`,
  this repo uses `<short-desc>` alone. See [`naming.md`](naming.md).

The work item is therefore whatever the user says in the session, plus the spec that session commits.

## Where the artefacts live

Specs live as **committed markdown in the worktree**, under `docs/specs/`. One directory per effort:

```
docs/specs/<short-desc>/
├── spec.md                       ← /spec writes this; its Status: header is the authority
├── plan.md                       ← /plan writes this; its ## Build checklist is /deliver's progress
├── plan-check.md                 ← /plan-check writes this
└── implementation-record.md      ← /deliver writes this: what it decided, and why
```

- No walkthroughs: this repo uses no review tiers ([`lifecycle.md`](lifecycle.md) § *Review tiers*).
- Directory name is `<short-desc>` — the same kebab-case phrase as the branch, per
  [`naming.md`](naming.md).

**They are committed.** With no tracker and no issue history, the committed spec is the *only* record
of what was asked for — which makes "was this requirement weakened to fit the code?" answerable at all.

## Commit cadence

**One commit per plan task** — the reviewable unit, and the line `/deliver` checks off. Each review fix
round is its own commit, so a reviewed range stays as it was reviewed. See [`naming.md`](naming.md).
