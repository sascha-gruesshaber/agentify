# `.agents/` — how this repository works

These files describe this repository to AI coding assistants. The `lifecycle` plugin's skills read
them instead of guessing, so **they are authority**: a skill that disagrees with a line here reports
the disagreement once and follows the file.

They are also readable by a human in five minutes, which is the other reason they exist.

| File | Answers |
|---|---|
| [`lifecycle.md`](lifecycle.md) | which phases run, the review tiers, which reviewers and lenses, how many rounds |
| [`gates.md`](gates.md) | the commands that must pass, in order, and what "green" means here |
| [`tracker.md`](tracker.md) | where specs live, and what may be written to the board |
| [`forge.md`](forge.md) | the git host, the ship mode, and how a branch becomes a reviewed change |
| [`preview.md`](preview.md) | how to bring the app up, seed a scenario, screenshot a screen, and where designs live |
| [`docs.md`](docs.md) | where architecture truth lives, the glossary, what "docs are part of done" costs |
| [`naming.md`](naming.md) | branch, commit, directory and test-name grammar |
| [`working-agreement.md`](working-agreement.md) | hours, unattended work, the autonomy line, how to report, the walkthrough language |

## Rules for editing these

- **A command is written exactly as it must be typed.** A paraphrased gate is a broken gate.
- **`NOT CONFIGURED` is a real answer.** It means a skill must say so and take the safe reading, which
  is strictly better than a plausible invention.
- **Link, do not mirror.** Where a convention is already written down elsewhere in this repo, point at
  it. A copy drifts and nothing detects it.
- Written by `/onboard`. Re-run it to change an answer, or edit by hand — it will not overwrite a hand
  edit without asking.
