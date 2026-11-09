# `.agents/` — how this repository works

These files describe this repository to AI coding assistants. The `lifecycle` plugin's skills read
them instead of guessing, so **they are authority**: a skill that disagrees with a line here reports
the disagreement once and follows the file.

They are also readable by a human in five minutes, which is the other reason they exist.

| File | Answers |
|---|---|
| [`lifecycle.md`](lifecycle.md) | which phases run, that review tiers are off, which reviewers and lenses, how many rounds |
| [`gates.md`](gates.md) | the commands that must pass, in order, and what "green" means here |
| [`tracker.md`](tracker.md) | where specs live, and that nothing is written to any board |
| [`forge.md`](forge.md) | the git host, the ship mode (`review`), and how a branch becomes a reviewed change |
| [`preview.md`](preview.md) | that there is no UI to screenshot |
| [`docs.md`](docs.md) | where truth lives, that there is no glossary, what "docs are part of done" costs |
| [`naming.md`](naming.md) | branch, commit, directory and test-name grammar |
| [`working-agreement.md`](working-agreement.md) | hours, unattended work, the autonomy line, how to report, the walkthrough language |

## One thing that is specific to this repo

**This repository is the source of the `lifecycle` plugin, and the plugin these files configure is the
*installed* copy under `~/.claude/plugins/cache/agentify/lifecycle/<version>/`.** Editing anything under
`plugins/lifecycle/` does not change the behaviour of the session doing the editing. See
[`gates.md`](gates.md) § *Where a local run is weaker than CI* and
[`working-agreement.md`](working-agreement.md) § *Known traps*.

## Rules for editing these

- **A command is written exactly as it must be typed.** A paraphrased gate is a broken gate.
- **`NOT CONFIGURED` is a real answer.** It means a skill must say so and take the safe reading, which
  is strictly better than a plausible invention.
- **Link, do not mirror.** Where a convention is already written down elsewhere in this repo, point at
  it. A copy drifts and nothing detects it.
- Written by `/onboard` on 2026-08-14. Re-run it to change an answer, or edit by hand — it will not
  overwrite a hand edit without asking.
