# Gates — what must pass, and what "green" means here

There is **no build system, no formatter, no linter and no coverage tool** in this repo. The gate is
one CI job, `gate`, in [`../.github/workflows/ci.yml`](../.github/workflows/ci.yml). **That file is
the authority on what blocks a merge**, not this one — if they disagree, fix this one.

## The local gate — run these in this order

```bash
cd plugins/lifecycle
node skills/_shared/tools/skills.mjs sync     # only after editing a fragment — rewrites the injected copies
node skills/_shared/tools/skills.mjs check    # must print "clean"
node --test "skills/_shared/tools/skills.test.mjs" "skills/_shared/tools/spec-gate.test.mjs" "skills/show/check-page.test.mjs"
```

**Edit the fragment, never the injected copy.** `check` fails on a drifted region, on a document
missing a fragment the manifest requires, on one carrying a fragment it forbids, and on a fragment
nothing declares. The mechanism is documented in
[`../plugins/lifecycle/skills/_shared/README.md`](../plugins/lifecycle/skills/_shared/README.md).

Then, from the repository root, the two cheap leak checks. **Both must print nothing:**

```bash
grep -rniE '(^|[^a-z])(dotnet (build|test|format|run)|npm run (lint|build)|cargo (build|test)|gradlew|mvn )' \
  plugins/lifecycle/skills plugins/lifecycle/agents --exclude-dir=templates
grep -rn "disable-model-invocation" plugins/*/skills plugins/*/commands
```

A wider pre-flight sweep for repo-specific leaks is in
[`../CONTRIBUTING.md`](../CONTRIBUTING.md) § *The gate*. Every hit must be either an example clearly
marked as one, or a sentence about how to *find* the real answer.

## Where a local run is weaker than CI

**This is the most valuable section in this file.** Five of the eight CI steps exist only as inline
`node` scripts in the workflow. There is no local runner for them.

| CI step | Lines | What it rejects | Locally |
|---|---|---|---|
| fragments are in sync | `ci.yml:19-21` | a drifted injected region | ✅ same command |
| fragment tooling tests | `ci.yml:23-25` | a broken `skills.mjs` | ✅ same command |
| every manifest parses | `ci.yml:27-31` | invalid JSON in any manifest | ❌ CI only |
| marketplace and plugin versions agree | `ci.yml:33-50` | a version bumped in one file but not the other | ❌ CI only |
| no repo-specific commands leaked | `ci.yml:54-64` | a concrete build command inside a skill | ✅ grep above |
| every skill has a name and a description | `ci.yml:66-83` | frontmatter missing `name:` or `description:` | ❌ CI only |
| no skill blocks model invocation | `ci.yml:88-97` | `disable-model-invocation` anywhere | ✅ grep above |
| every command has a description, and forwards to a skill that exists | `ci.yml:100-120` | a command pointing at a skill that is not there | ❌ CI only |

So a clean local run is **not** green. Green means the CI job passed:

```bash
gh pr checks --watch
```

### The trap that matters more than any of the above

**A change under `plugins/lifecycle/` does not affect the session that made it** — skills load from the
installed copy, not from this worktree. So CI being green proves the *files* are consistent and proves
nothing about the *behaviour* you changed.

The reinstall step, and the rule about which of the two claims you are making, are in
[`../CONTRIBUTING.md`](../CONTRIBUTING.md) § *A change here does not affect the session that made it*.
Stated once, there, deliberately.

## Generated files

`node skills/_shared/tools/skills.mjs sync` **writes into 18 tracked documents** — every managed
region in `plugins/lifecycle/skills/**` and `plugins/lifecycle/agents/**`.

**Two features that both edit a file under `skills/_shared/fragments/` conflict in up to 18 files** of
generated text nobody wrote. Resolve by merging the fragments and running `sync` again, never by hand.
See [`lifecycle.md`](lifecycle.md) § *Worktrees*.

## What "test-first" means here, because it means two things

The repo is mostly markdown. The seam is different per area, and pretending otherwise is how a ticket
ends up with a test that asserts prose is still present.

| Area | The seam | Test-first? |
|---|---|---|
| `plugins/lifecycle/skills/_shared/tools/*.mjs` | `skills.test.mjs`, `node:test` | **yes — real red-green.** This is the only unit-testable code here. |
| `plugins/lifecycle/skills/**/SKILL.md`, `agents/**` | `skills.mjs check` + the CI frontmatter and leak steps | **no unit test is possible.** The gate is the check, plus a reinstall run for a behaviour change. |
| `.claude-plugin/**`, `plugins/*/.claude-plugin/**` | the version-agreement CI step | no — the gate is the pair being bumped together |
| `README.md`, `CONTRIBUTING.md`, `ATTRIBUTION.md` | none | no |

**Never write a test whose only possible assertion is that some wording survived.** For a markdown
change, the honest evidence is the check output and, where behaviour moved, a reinstalled run.

## Coverage and scanners

**NOT CONFIGURED.** No coverage tool, no floor, no scanner, no quality gate. To fill this in, this repo
would need a coverage runner over `skills/_shared/tools/` — currently the only measurable code.

## Never `--no-verify`.
