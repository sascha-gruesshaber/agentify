# Naming grammar

One `<short-desc>` per effort, reused across the branch, the spec directory and the commit scope, so
the three are greppable together. Kebab-case, four words or fewer.

**There is no ticket key here** — no tracker, per [`tracker.md`](tracker.md). Everywhere the plugin's
grammar offers a `<KEY>-` prefix, this repo drops it.

## Branches

```
<type>/<short-desc>
```

- **Types in use:** `feat | fix | docs | chore` — observed in history. `refactor | test | build` are
  allowed and unused so far.
- **Observed example:** `chore/onboard-itself`.
- **Branch model:** trunk-based off `main`. No `develop`, no `release/*`.

## Commits

```
<type>(<scope>): <imperative subject, lower case, no full stop>

<body: why, not what — the diff already says what>
```

- **Subject is imperative** — "add the workflow driver", not "added" or "adds". All 8 commits in history
  match.
- **Scope** is the plugin or the area: `lifecycle`, `onboard`, `fragments`, `plain-words`, `docs`, `ci`
  — per [`../CONTRIBUTING.md`](../CONTRIBUTING.md) § *Commits*. **A repo-wide documentation edit may
  drop the scope entirely** (`docs: …`) — observed twice, and it is fine.
- **The body carries real weight in this repo.** History uses multi-paragraph bodies that say what was
  wrong and why the fix is shaped as it is. Match that; a one-line body on a design change is
  under-documented here.
- **One commit per plan task**, and each review fix round its own commit, so a reviewed range stays as it
  was reviewed.
- **Trailer:** none. There is no ticket to reference.
- **Never `--no-verify`.**

### One open question about trailers

**NOT CONFIGURED: whether an AI attribution trailer is wanted.** All 8 commits in history carry none,
while the assistant's own default is to add a `Co-Authored-By:` line. **Follow the history — add no
trailer — until the maintainer says otherwise.** Starting one part-way through a history makes the
history look like two projects.

## Spec directories

`docs/specs/<short-desc>/` — the same `<short-desc>` as the branch. See [`tracker.md`](tracker.md).

## Tests

Three test files exist — `skills.test.mjs` and `spec-gate.test.mjs` under `plugins/lifecycle/skills/_shared/tools/`,
and `check-page.test.mjs` under `plugins/lifecycle/skills/show/` — and they share one grammar:

```js
test('<subject> <the behaviour asserted>', () => { … })
```

- Lower case, a plain sentence, no underscores and no `Should_`/`When_` shape.
- **Observed:** `'check fails on a drifted copy and sync repairs it'`,
  `'a $comment key in the manifest is documentation, not a rule'`.
- **The subject is the unit under test** — `check`, `syncText`, `targets`, `regionsIn`.
- **No `// Arrange` / `// Act` / `// Assert` comments.** The file uses none.
- Enforced in review. No tool checks test names.

## Review titles

`<type>(<scope>): <what the change achieves, in plain words>` — the achievement, not the mechanism.
Same grammar as the commit subject, which is what `gh pr create` should be given.
