# lifecycle

A committed-spec engineering lifecycle for Claude Code. Fourteen callable skills, four sub-agents, one
driver.

```
/onboard                                    once per repo — writes .agents/
   │
/frame ──▶ /grill ──▶ /spec ──▶ /plan ──▶ /plan-check ──▶ /deliver ──▶ /ship ──▶ /babysit
   ╰──────────── /lifecycle:advance ─────────────────────────────────────────────╯
                   reads the state, runs what is next
```

`/ship` and `/babysit` run as far as `.agents/forge.md`'s ship mode says. Called from inside the loop:
`/tdd`, `/diagnose`, `/resolve-conflicts`, `/show`.

## Layout

```
commands/
└── advance.md            /lifecycle:advance — forwards to the workflow skill

skills/
├── _shared/              one rule, one file — see its README
│   ├── fragments/        16 rules: 13 law, 3 shape
│   ├── fragments.json    which document requires or forbids which
│   └── tools/            sync + check, and the spec gate; each with its tests
├── onboard/              the setup ceremony
│   └── templates/        the nine .agents/ files it writes
├── workflow/             the driver — state on disk to the next phase
├── frame/ grill/ spec/   design
├── plan/ plan-check/     planning
├── deliver/              builds in the session — prompts.md holds the review catalogue
├── ship/ babysit/        open the review, tend it — only what forge.md names
├── show/                 a page the user can annotate, and the walkthroughs; check-page.mjs verifies one
└── tdd/ diagnose/ resolve-conflicts/

agents/
├── code-scout            read-only investigator (no Bash, no Write — deliberately)
├── spec-reviewer         reads a spec cold, one lens
├── change-reviewer       reads a pinned range or a task's screenshots, the lenses it is given, read-only by tool grant
└── finding-fixer         applies review comments a person wrote, and nothing else
```

## What makes it portable

**No file here names a repository.** Where a repo-specific fact is needed, a skill reads it from
`.agents/` in the consuming repo — written once by `/onboard`.

Three fragments carry that seam: `repo-config` (where the files are and that they are authority),
`gates` (run the gate the way CI runs it, whatever it is), `tracker-limits` (read freely, write only as
configured). The other thirteen are law and ship inlined.

CI fails the build if a concrete build command appears in any skill or agent.

## `/lifecycle:advance`, and why it can exist at all

Every artefact the lifecycle writes is **committed**, and the spec's `Status:` header is a state machine.
So the answer to "what comes next" is already on disk, and `workflow` reads it: the status, whether
`## Open` is empty, whether the sign-off still matches, whether `plan.md` is current, the `Verdict:` line,
the `## Build` checklist, `git log`.

Nothing is inferred from the conversation, which is why it gives the same answer in a fresh session the
next morning.

It **halts at every phase that needs a person**, and a halt always names the next command. It never does
a phase's work itself — a router that starts planning is a second planner nobody reviews.

## Three design choices worth knowing

**No agent writes production code.** The session that runs `/deliver` builds every task and fixes every
finding; agents only scout and review. A reviewer is worth having because it did not see the session's
reasoning, and an implementer is not worth having because it pays to learn what the session already
knows. Nothing depends on a harness's thread or workflow tool: every review is a subagent the session
sends.

**How far a run goes is the repo's call.** Opening a review and watching it differ per host and per team
more than anything else in the flow. `.agents/forge.md` records the commands and the ship mode `/onboard`
recommended; `/ship` and `/babysit` run nothing it does not name.

**`/onboard` deliberately does not read `.agents/`.** It writes it. A skill that read its own output
would happily agree with a mistake it had just made — which is why `fragments.json` *forbids* it the
`repo-config` fragment the others require.
