# Contributing to agentify

## The one rule

**Nothing in `plugins/lifecycle/` may name a specific repository.** Not a build command, not a tracker,
not a path, not a language, not a company. The moment one does, the plugin only works in the repo it
came from — which is the failure this whole thing exists to undo.

When you need a repo-specific fact, you have exactly two moves:

1. **Point at `.agents/`.** Say which file holds the answer and what rule holds whatever that answer
   turns out to be.
2. **Add a question to [`/onboard`](plugins/lifecycle/skills/onboard/SKILL.md)**, and a line to the
   matching template.

There is no third move.

## The gate

```bash
cd plugins/lifecycle
node skills/_shared/tools/skills.mjs sync     # after editing any fragment
node skills/_shared/tools/skills.mjs check    # must be clean
node --test "skills/_shared/tools/skills.test.mjs" "skills/_shared/tools/spec-gate.test.mjs" "skills/show/check-page.test.mjs"
```

**Edit the fragment, never the injected copy.** `check` fails on a drifted region, on a document missing
a fragment the manifest requires, on one carrying a fragment it forbids, and on a fragment nothing
declares. It runs in CI.

A quick way to catch a leak before `check` does:

```bash
grep -rniE 'dotnet|npm run|cargo|gradle|jira|azure|github\.com|sonar' plugins/lifecycle/skills plugins/lifecycle/agents \
  | grep -v templates/ | grep -v _shared/README
```

Every hit should be either an example clearly marked as one, or a sentence about how to *find* the real
answer. A hit that reads as an instruction is a bug.

## Never add `disable-model-invocation`

**This plugin exists because upstream skills carry that flag.** It makes a skill un-invokable by the
model, so a flow built on it stalls and asks the user to type the next command — which is exactly what
`/advance` and `/deliver` cannot survive, since their whole shape is skills calling skills.

CI fails the build if the string appears anywhere under `plugins/*/skills` or `plugins/*/commands`. If you
ever vendor a skill in from elsewhere, **strip the flag as part of vendoring it.**

## Writing a skill here

- **The frontmatter `description` is how the model decides to load it.** Write it for that: what it takes
  in, what it produces, and the phrasings a user actually types. The `Keywords -` tail is not decoration.
- **State the law, then the exception.** A rule with no stated cost gets routed around the first time it
  is inconvenient.
- **Say what happens next.** Every skill names the one that follows it, so a flow does not stall on a
  user who does not know the next command.
- **Every line is paid for on every turn of a long run.** Cut anything that does not change what the
  model does.
- **A rule that appears in two skills belongs in a fragment.** That is not a style preference; two copies
  drift and nothing detects it.

## A change here does not affect the session that made it

**Skills load from the installed copy**, at `~/.claude/plugins/cache/agentify/lifecycle/<version>/` —
not from your worktree. So editing a `SKILL.md` changes nothing about the session you are editing in, and
`skills.mjs check` passing proves the *files* are consistent, never that the *behaviour* you changed
works.

To actually see a behaviour change, bump both versions and reinstall:

```bash
/plugin marketplace update agentify
/plugin install lifecycle@agentify
```

**Say which of the two you did.** "CI is green" and "I watched the new behaviour run" are different
claims, and only the second is evidence for a behaviour change.

## Versioning

Each plugin carries its own `version` in `.claude-plugin/plugin.json` **and** in the marketplace's
`marketplace.json`. **Bump both in the same commit** — the cache is keyed on the marketplace's copy, so
a plugin whose manifest moved without its marketplace entry never reaches anybody.

## What is not proved yet

Read this before relying on the plugin for work that matters. Each line is a thing that is *designed*
but has not been *run*.

1. ~~Cross-skill calls across the plugin boundary.~~ **Proven** — `/onboard` chained to `/frame`, and
   the build skill resolves `/plan` and `/plan-check` by name.
2. ~~`/onboard` against a repo it did not come from.~~ **Proven** — run on this repo. It read the CI
   definition, mapped all eight steps to line numbers, wrote `NOT CONFIGURED` three times rather than
   inventing, and found two hazards nobody had written down.
3. ~~The lens catalogue is now generic.~~ **Proven** — the `repo standards` lens, given only
   `.agents/docs.md`, caught a planted duplicated rule with the rule quoted and the correct fix, and
   caught a real mirror-instead-of-link violation nobody had noticed.
4. ~~`/onboard` is safe to re-run.~~ **Proven** — a second run was byte-identical, refused to overwrite,
   and reported a stale count as a note rather than silently editing.
5. **A clean review still costs a judgement call.** The reviewers now return `clean` plus at most three
   lines of what they checked. The cap is an instruction, and nothing enforces it.
6. **`/deliver`, `/ship` and `/babysit` have not run end to end from this plugin.** The process they
   encode — the session builds, fresh agents review, walkthroughs before and after — is the one the
   source repo builds with today, but the generic wording, the ship-mode routing and the preview seam
   are new here, and so is the sign-off flow (`/spec`'s walkthrough → `spec-gate.mjs sign` → the gate
   refusing an edited spec in `/plan`, `/deliver` and `/advance`). `/deliver` is the largest skill and the
   first to prove.
7. **The `Effort` column in `.agents/lifecycle.md` only binds where the harness passes it.** Some
   subagent dispatches take an effort and some do not, and the plugin does not depend on either. Where
   it cannot be passed, the column says which calls deserve a high-effort *session*; the tier, the
   ceiling and the number of agents are the levers that always pass.
8. **`/onboard`'s ship-mode recommendation and preview detection are unexercised.** Re-running it on a
   repo with a UI and a forge CLI is what proves both.

## Adding a plugin to the marketplace

1. `plugins/<name>/.claude-plugin/plugin.json` — `name`, `version`, `description`, `metadata`.
2. An entry in `.claude-plugin/marketplace.json` with a matching `version` and `source: "./plugins/<name>"`.
3. A `README.md` in the plugin directory if it is not obvious from its skills.

## Commits

`<type>(<scope>): <imperative subject>` — scope is the plugin or the area (`lifecycle`, `onboard`,
`fragments`, `plain-words`, `docs`, `ci`). Body says *why*.
