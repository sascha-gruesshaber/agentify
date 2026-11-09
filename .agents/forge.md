# Forge — how a branch becomes a reviewed change

How a built branch becomes a reviewed change here, and how far `/deliver` takes it on its own.

## Ship mode

**Ship mode:** review

**Why:** `gh` is installed and authenticated with the `repo` scope, and CI runs on every pull request. But
nothing blocks a merge and there is one maintainer, so the agent opens the pull request and the
maintainer reads and merges it. `review+watch` is not taken: there are no reviewers whose comments need
tending. `/babysit` still works when asked by name.

## The host

- **Host:** GitHub, public repository
- **Remote:** `https://github.com/sascha-gruesshaber/agentify.git`
- **Default branch:** `main` · **Release branches:** none — trunk-based
- **CLI:** `gh` at `/opt/homebrew/bin/gh`, authenticated for account `sascha-gruesshaber` from the
  macOS keyring. Token scopes: `gist`, `read:org`, `repo`, `workflow` — enough to open a pull request
  and read a workflow run.

## Opening a change for review

```bash
git push -u origin <branch>
gh pr create --base main --title "<type>(<scope>): <what the change achieves>" --body-file <file>
gh pr list --head <branch> --state open          # the open pull request for a branch
gh pr edit <n> --body-file <file>                # rewrite a description
```

- **Target:** `main`
- **Required reviewers:** none. **Single maintainer repo** — review is the maintainer reading their own
  pull request. That is a smaller safety net than a second pair of eyes, which is why the review lenses
  in [`lifecycle.md`](lifecycle.md) are the real review here.
- **Description:** no template exists. State what changed and why, and **name which of the two
  verification claims you can make** — CI green, or CI green plus a reinstalled behaviour run. See
  [`gates.md`](gates.md) § *The trap that matters more than any of the above*.
- **Draft first?** No. CI runs on every pull request, so a normal pull request already gets the gate.
- **Agent marker:** a comment an agent writes starts with `🤖`. `/babysit` skips its own comments by it.

## Reading review comments

```bash
gh pr view <n> --comments
gh api repos/sascha-gruesshaber/agentify/pulls/<n>/comments    # line-anchored review comments only
```

Two resources, two answers: `gh pr view --comments` shows the conversation thread, the `pulls/<n>/comments`
endpoint shows comments anchored to lines. **A finding can be in one and not the other.** Read both
before claiming a pull request has no open comments.

## Finding the build for a change

```bash
gh pr checks <n> --watch
gh run list --branch <branch> --limit 5
gh run view <run-id> --log-failed
```

The workflow is `ci` and it has **one job, `gate`**. A failure names the step, and the step names the
rule it enforces — read the step name before reading your own diff.

## Branch policies that block a merge

**None.** `gh api repos/sascha-gruesshaber/agentify/branches/main/protection` returns
`404 Branch not protected`.

| Policy | Threshold |
|---|---|
| build must pass | **not enforced** — `ci` is advisory; nothing stops a merge over a red run |
| coverage on new code | not configured |
| scanner quality gate | not configured |
| reviewer approvals | **0** |

**So the gate is a habit, not a wall.** Treat a red `ci` run as blocking anyway and say so out loud;
the machine will not say it for you. This is the single largest gap between how this repo is set up and
how the lifecycle assumes a repo is set up.

## Approving and merging

**NOT CONFIGURED: the maintainer merges.** No agent approves or merges a pull request here.

## What is deliberately not automated here

- **No board write, ever** — there is no board. See [`tracker.md`](tracker.md).
- **No automatic merge.** The maintainer merges.
- **No release or publish step.** Distribution is the marketplace manifest, so a consumer only sees a
  change once **both** versions are bumped together and `main` moves. See
  [`../CONTRIBUTING.md`](../CONTRIBUTING.md) § *Versioning*.
