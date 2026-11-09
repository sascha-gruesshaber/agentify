**Hand work over by path, and keep what a reviewer reads small.**

The session builds the plan itself; what leaves it is review. A reviewer starts with a fresh context and
only what the dispatch names, so the dispatch carries paths and a range, never the conversation.

- **Briefs by path.** The spec, the plan and the review catalogue are named, never pasted. Name the task
  or the lenses the reviewer works; never make it read a whole plan to find its slice.
- **Diffs by range.** A reviewer gets a pinned range (`<base>...<tip>`) and runs `git diff` itself. A
  task review's range is the task's own commit (`<sha>^...<sha>`), found in `git log`; a remembered base
  breaks after a new session merges the default branch in.
- **Reports come back as the agent's answer.** A read-only reviewer cannot write a file, so never name a
  report file in its dispatch. Ask for findings only — `clean` plus at most three lines when there are none.
- **Never tell a reviewer what you decided while building.** Its read is worth having because it did not
  see your reasoning; the plan and the spec are what it judges against.
