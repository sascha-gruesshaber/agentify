# `_shared` — one rule, one file, injected everywhere it applies

A rule that appears in two skills drifts. This directory holds each rule once, and a tool copies it
into every skill and agent that declares it.

## The mechanism

A document declares a fragment by carrying a **managed region**:

```markdown
<!-- shared:worktree:start source=worktree.md -->
**One feature, one working tree, one writer.** Two writers in one tree interleave edits and lose work.

Cut it from the main checkout, from the default branch:

```bash
git worktree add -b <branch> .claude/worktrees/<branch with / → +> <default-branch>
```

- The directory name replaces `/` with `+`. Git refuses a branch nested under an existing branch name.
- **Cut it before the first committed file exists.** A tree cut later leaves the spec dirtying the main
  checkout. Carry uncommitted work across rather than stranding it: `git diff > /tmp/carry.patch`,
  `git apply` in the new tree, then revert the original.
- **Already standing in a worktree on a feature branch** (one your harness made, or one an earlier phase
  cut)? Use it. Do not nest a second tree inside it.
- **Never remove a worktree you did not create.** Somebody else's half-finished work looks exactly like
  a stale directory.

**A tool may resolve your path against the wrong tree, and say nothing.** Anything running outside your
shell — an MCP server, a language server, a scanner — may resolve a relative path against the directory
it started in, and report on the *unmodified* file with no error.

- **Pass the absolute path** of the file in your tree.
- **Spot it by the line numbers.** If a reported range matches the file *before* your change, the tool
  read the other tree.

**Say the path once, in one line.** Everything after that happens there.
<!-- shared:worktree:end -->
```

Everything between the markers is generated. **Edit the fragment, never the region.**

```bash
node skills/_shared/tools/skills.mjs sync    # copy fragments into every declared region
node skills/_shared/tools/skills.mjs check   # fail if a region is stale or a manifest rule is broken
node --test "skills/_shared/tools/skills.test.mjs"
```

**Both run in this repo, at author time.** A consumer never runs them: the published plugin ships the
regions already filled in, so no run pays a lookup for a rule that never varies per repo. `check` is
this repo's CI gate.

It fails when:

1. a managed region does not match its fragment (somebody edited the copy);
2. a document is missing a fragment [`fragments.json`](fragments.json) says it **requires**;
3. a document carries a fragment `fragments.json` says it **forbids**;
4. a region names a `source=` file that does not exist;
5. a fragment exists that nothing declares — a rule nobody applies is a rule that is wrong without
   anybody finding out.

## The two classes of fragment

This is the line that lets one plugin serve many repos.

| Class | Resolved | Fragments |
|---|---|---|
| **law** — true in any repo | at author time, inlined into the shipped file | `worktree`, `evidence-before-claims`, `agent-report-contract`, `criterion-quality`, `edge-case-probe`, `no-prejudging`, `spec-shape`, `uncertainty-signal`, `model-choice`, `file-handoff`, `agent-names`, `budget`, `review-budget` |
| **shape** — true only in one repo | at run time, by reading `.agents/` in the consumer | `repo-config`, `gates`, `tracker-limits` |

A shape fragment carries **no commands**. It carries the instruction to read the file that has them,
and the rules that hold whatever those commands turn out to be. A concrete build invocation written
into a fragment is what made the previous version of this kit unusable anywhere else.

## Law here, rationale next door

A fragment states the **law**: what to do, in the fewest words that stay unambiguous. Every line here
is paid for on every turn of every long run, so the incident that produced a rule does not go in the
rule.

## Adding a fragment

1. Write `fragments/<name>.md`. No frontmatter, no `#` heading — it is injected into somebody else's
   document and must not fight its heading levels.
2. Decide whether it is **law** or **shape**. If it names a command, a path or a tool that a different
   repo would spell differently, it is shape: point at `.agents/` instead.
3. Add the `requires` entry to `fragments.json`.
4. Paste the empty marker pair into each document that needs it.
5. Run `sync`, then `check`.

## What does **not** belong here

- **Anything one repo's shape decides.** That is `.agents/` in the consumer.
- **Anything true of one skill only.** Write it in that skill.
