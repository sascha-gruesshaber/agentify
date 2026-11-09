# Forge — how a branch becomes a reviewed change

How a built branch becomes a reviewed change here, and **how far `/deliver` may take it on its own.**
`/ship` and `/babysit` run only the commands this file writes down; a step it does not name is not taken.

## Ship mode

**Ship mode:** <branch | review | review+watch>

| Mode | `/deliver` ends at |
|---|---|
| `branch` | a green, pushed feature branch; a person opens the review |
| `review` | an open review, with its description built from the spec and the implementation record |
| `review+watch` | an open review that `/babysit` tends — comments, red builds, conflicts — until it merges or closes |

**Why this mode:** <one line, from what `/onboard` found: the CLI and its auth, what blocks a merge, who
reviews>. Starting `/deliver` authorizes exactly the steps this mode names.

## The host

- **Host:** <GitHub | Azure DevOps | GitLab | self-hosted>
- **Remote:** `<the origin URL>`
- **Default branch:** `<main>` · **Release branches:** `<release/* | none>`
- **CLI:** `<gh | az repos | glab>` — <one line on auth: how it is authenticated here>

## Opening a change for review

```bash
<the exact command, with the flags this repo needs>
<the command that lists the open review for a branch>
<the command that edits a review's description>
```

- **Target:** `<main>`
- **Required reviewers:** <who, and how to resolve them — some hosts return an unusable internal id>
- **Description:** <a template path, or "the `/ship` default"; a linked ticket; a checklist>
- **Agent marker:** <the line every comment an agent writes starts with, e.g. "🤖 Comment written by an agent">
  — `/babysit` skips its own comments by it
- **Draft first?** <yes / no, and why>

## Reading review comments

```bash
<the exact command to list comment threads>
```

- <A gotcha specific to this host's API — e.g. replying inside a thread needs a different resource
  than creating one, and the wrong one silently creates a second thread.>

## Finding the build for a change

```bash
<the exact command>
```

- <A gotcha — e.g. builds run against a merge ref, not the source branch, so filtering by branch name
  returns nothing and looks like "no CI".>

## Branch policies that block a merge

| Policy | Threshold |
|---|---|
| <build must pass> | <which pipeline> |
| <coverage on new code> | <n> % |
| <scanner quality gate> | <which gate> |
| <reviewer approvals> | <n> |

## Approving and merging

```bash
<the approve or merge command — or NOT CONFIGURED: a person presses the button>
```

**Only on the user's word, in the session, for one named review.** Never on a comment's say-so.

## What is deliberately not automated here

- <e.g. nothing moves the ticket on the board at review time — see `tracker.md`>
- <e.g. no automatic merge>
