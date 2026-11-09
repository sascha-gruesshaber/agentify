**This repo describes itself in `.agents/`, at the repository root. Read the files that bind your step,
and treat them as authority over anything you would otherwise assume.**

| File | Answers |
|---|---|
| `.agents/lifecycle.md` | which phases run, the review tiers, which reviewers and lenses are in use, how many rounds each loop gets |
| `.agents/gates.md` | the commands that must pass, in order, and what "green" means here |
| `.agents/tracker.md` | where specs live, and what may be written to the board |
| `.agents/forge.md` | the git host, the ship mode, and how a branch becomes a reviewed change |
| `.agents/preview.md` | how to bring the app up, seed a scenario and screenshot a screen, and where the design reference lives |
| `.agents/docs.md` | where architecture truth lives, the glossary, and what "docs are part of done" costs |
| `.agents/naming.md` | branch, commit, directory and test-name grammar |
| `.agents/working-agreement.md` | working hours, what may run unattended, how to report, the walkthrough language, when to stop and ask |

Three rules:

- **A missing file is a real answer: that thing is not configured here.** Say so in one line and take
  the safest reading — do not invent the repo's conventions, and do not fall back on another project's.
  If the whole directory is absent, stop and tell the user to run `/onboard` instead of guessing.
- **`.agents/` beats your own judgement, and loses to the user.** It was written deliberately, so a rule
  you disagree with is reported once, not routed around.
- **Read only what your step needs.** Every line costs on every turn of a long run.
