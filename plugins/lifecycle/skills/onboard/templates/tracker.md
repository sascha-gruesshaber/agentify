# Issue tracker and specs

## Where the artefacts live

Specs for this repo live as **committed markdown in the worktree**, under
`<docs/specs/>`. One directory per effort:

```
<docs/specs>/<KEY>-<short-desc>/
├── spec.md                       ← /spec writes this; its Status: header is the authority
├── spec-walkthrough.html         ← /spec writes this for a medium or heavy review tier
├── plan.md                       ← /plan writes this; its ## Build checklist is /deliver's progress
├── plan-check.md                 ← /plan-check writes this
├── implementation-record.md      ← /deliver writes this: what it decided, and why
└── review-walkthrough.html       ← /deliver writes this for a medium or heavy built tier
```

- Directory name is `<KEY>-<short-desc>`, or `<short-desc>` when there is no ticket — same grammar as
  the branch, per [`naming.md`](naming.md).

**They are committed.** That is what makes "was this requirement weakened to fit the code?"
answerable at all.

## The board

- **Tracker:** <Jira | GitHub Issues | Azure Boards | none>
- **Project / key:** <KEY>
- **How to read it:** <the plugin, CLI or API to use>

## Reading it

Read freely. Summarise what comes back in one or two lines and use it to ground the work.

**This must never block.** Missing credentials, a 404 or an outage each cost one line — carry on with
the key recorded and no context.

## Writing to it

**Default: nothing is written unasked.** Anything wider than the standing writes below needs a
manifest shown to the user and an explicit go-ahead.

### Standing writes — the complete list

<Delete this section entirely if the answer is "none".>

| When | What | Skill |
|---|---|---|
| work starts | assign to the caller and move to *In Progress* | `/frame` or `/spec` |
| the spec is committed | one comment: the agreed design, the spec path, the branch | `/spec` |
| the work ships | one comment: the review link | `/ship` |

Limits on all of them:

- **Never another field.** The comment body is the whole write.
- **Append-only and small.** Reference-level; the repo holds the authority and the comment carries the
  path to it.
- **Only ever forwards on the board**, and never a status that reports an *outcome*. Those stay human
  calls, because an automatic transition is wrong exactly when a change then sits unreviewed for a
  week.
- **Never takes an item off somebody else.**
- **English**, whatever language the session ran in.
- **Never blocking.**

### Known automation to work around

- <e.g. editing a description re-triggers an automation that moves the item to another status, so
  transition last>

## Commit cadence

**One commit per plan task** — the reviewable unit, and the line `/deliver` checks off. See
[`naming.md`](naming.md).
