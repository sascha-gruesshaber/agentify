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
