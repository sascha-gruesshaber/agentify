# agentify

Two Claude Code plugins, in one marketplace.

| Plugin | What it is |
|---|---|
| **`lifecycle`** | A committed-spec engineering lifecycle: fourteen callable skills and four sub-agents that take a ticket to a green branch, an open review or a watched one — as far as your repo allows. Reads how *your* repo works from `.agents/`. |
| **`plain-words`** | Report in controlled English. Small words, one idea per sentence, what you did / did it work / what now. Strips the AI tells from everything you write. |

## Install

```bash
/plugin marketplace add sascha-gruesshaber/agentify
/plugin install lifecycle@agentify
/plugin install plain-words@agentify
```

Then, in the repo you want to use it in:

```
/onboard
```

That is the setup ceremony. It reads your repository, asks only what it cannot read, proposes where
your way of working should change, and writes the nine files under `.agents/` that every other skill
reads — including how far an unattended run may go. Nothing works until it has run — and that is deliberate.

## The lifecycle

```
/frame ──▶ /grill ──▶ /spec ──▶ /plan ──▶ /plan-check ──▶ /deliver ──▶ /ship ──▶ /babysit
   │          │          │         │            │              │            │          │
 facts,    design    contract,  tasks,     a verdict      built in the   an open    comments,
 tier      settled   signed off scouted    on the plan    session, read  review     red builds,
                     on a page                            by fresh       (if your   conflicts
                                                          reviewers      repo says)
```

**`/deliver` builds in the session; fresh agents only review.** The session that runs it builds every
task itself, test-first, one commit per task, and checks each off in the plan. A fresh reviewer that never
saw its reasoning reads each risky task, a second one reads the screenshots of each UI task, and a few
reviewers — each with several lenses — read the whole diff at the end. The session triages and fixes.
Hand-overs to implementer agents cost more than the code did, and a review after every task did not
reduce what the end review found; that is why it is shaped this way.

**You read two pages, not every line.** With review tiers on, `/spec` shows a *spec walkthrough* you sign
off before anything is built — the sign-off is a fingerprint, so a later edit to the requirements
invalidates it — and `/deliver` ends with a *review walkthrough*: the decisions it took for you, and every
changed screen before and after.

Each one also runs alone. `/ship` and `/babysit` run only where `.agents/forge.md`'s **ship mode** says
so — `/onboard` recommends one from what it finds: a forge CLI with write access, branch protection, CI on
reviews. Four more are called from inside the loop: **`/tdd`** (the red-green loop),
**`/diagnose`** (a feedback loop before a theory), **`/resolve-conflicts`**, and **`/show`** — which puts
a flow, a decision round or a spec on a page whose every block the user can annotate, and reads their
notes back labelled.

## Or don't remember the chain at all

Every artefact the lifecycle writes is committed, and the spec's `Status:` header is a state machine — so
one skill can read where the work stands and run whatever comes next.

```
/lifecycle:advance          run the next phase, and keep going until a phase needs you
/lifecycle:advance --dry    say where you are and what is next. Run nothing.
/lifecycle:advance --once   run exactly one phase, then stop
```

Saying **"advance"** or **"what's next"** in a sentence does the same thing — no slash needed.

It **halts at every phase that needs a person** — `/onboard`, `/frame`, `/grill` and `/spec`'s sign-off —
and at a spec whose sign-off no longer matches, a `Not ready` verdict, a loop cap, or a state it does not
recognise. **A halt always
names the next command.**

It reads the state **off disk, never from the conversation**, so it gives the same answer in a fresh
session the next morning. On a repo it has never seen:

```
effort    none            (matched by: rule 4 — nothing found)
status    repo not set up
beside    .agents/ ✗   spec.md ✗   plan.md ✗
next      /lifecycle:onboard
halting   --dry mode, and /onboard needs a person anyway
```

> **Commands need the namespace; skills do not.** Verified on a real install:
>
> | | Bare | Namespaced |
> |---|---|---|
> | **commands** — `advance` | ✗ `Unknown command: /advance` | ✓ `/lifecycle:advance` |
> | **skills** — `frame`, `plan`, `deliver`, `workflow` | ✓ `/frame` | ✓ `/lifecycle:frame` |
> | **agents** — `code-scout` and the rest | risky, may hit a repo's own agent | ✓ `lifecycle:code-scout` |
>
> So the only thing that needs typing in full is `/lifecycle:advance`. Everything else takes the short
> form, and plain English works for all of it.

**How far `/deliver` runs is your repo's call.** Opening a review and watching it differ per host and per
team more than anything else in the flow, so `.agents/forge.md` records the commands and the ship mode,
and `/ship` and `/babysit` run nothing that file does not name.

### What each phase is for

| Skill | In | Out |
|---|---|---|
| `/advance` | whatever is on disk | the next phase, run |
| `/onboard` | a repo | `.agents/`, nine files |
| `/frame` | a ticket or a sentence | the facts, the size, the review tier, the questions worth asking |
| `/grill` | a rough idea | a settled design, glossary terms, decision records |
| `/spec` | a settled design | a committed contract, cold-read by four reviewers and signed off on a walkthrough |
| `/plan` | a contract | ordered tasks, after agents actually read the code |
| `/plan-check` | a plan | Ready / Ready with changes / Not ready, with every claim verified |
| `/deliver` | a Ready plan | a green branch, a record of every decision taken for you, and a review walkthrough |
| `/ship` | a built branch | an open review, its description built from the record |
| `/babysit` | an open review | comments answered, red builds fixed, conflicts resolved, your walkthrough answers written back |
| `/show` | anything worth seeing | a page the user annotates; their notes come back labelled |

## The idea

**The plugin ships law. Your repo keeps shape.**

*Law* is how to work well — grill until the frontier is empty, one writer per worktree, evidence
before claims, a spec states WHAT and a plan states HOW. It is true in any repository, so it ships
inlined in the skills.

*Shape* is what your repo happens to be — the build command, the tracker, the git host, where the
architecture docs live. It is true in exactly one repository, so it lives in `.agents/` and the skills
read it at run time.

That line is the whole design. It is enforced mechanically: see
[`plugins/lifecycle/skills/_shared/README.md`](plugins/lifecycle/skills/_shared/README.md).

## The nine files `/onboard` writes

| File | Answers |
|---|---|
| `lifecycle.md` | which phases run, the review tiers, which reviewers and lenses, how many rounds |
| `gates.md` | the commands that must pass, in order, and what "green" means |
| `tracker.md` | where specs live, and what may be written to the board |
| `forge.md` | the git host, the ship mode, and how a branch becomes a reviewed change |
| `preview.md` | how to bring the app up, seed a scenario, screenshot a screen, and where designs live |
| `docs.md` | where architecture truth lives, the glossary, what "docs are part of done" costs |
| `naming.md` | branch, commit, directory and test-name grammar |
| `working-agreement.md` | hours, unattended work, the autonomy line, how to report, the walkthrough language |
| `README.md` | one page saying the above is authority |

They are **committed**, so they are reviewable in a pull request and greppable by a human. Templates
are in [`plugins/lifecycle/skills/onboard/templates/`](plugins/lifecycle/skills/onboard/templates/).

## What it costs, and how you cap it

The lifecycle spends model time deliberately, at the points where a mistake is cheapest to fix:

- **four reviewers read every spec cold**, before anybody builds on it;
- **the plan is verified against the repository** — every `path:line` opened, every count checked, every
  "nothing else calls this" grepped;
- **every risky task gets a fresh reviewer** before the next task builds on it, and **every UI task a
  screenshot review** against your design reference;
- **the finished feature gets fresh reviewers** that never saw the session's reasoning.

The bet is that one wrong plan costs more than all of it. If your change is small, take the fast path
`/frame` will offer you.

**You set the price.** `.agents/lifecycle.md` § *Effort and budget* fixes, per role, the **model tier**
and a **soft output ceiling**, and records which calls deserve a high-effort session — `/onboard` asks you
for all of it. Four levers, in the order they actually move cost:

| Lever | Where | Why it matters |
|---|---|---|
| **how many agents** | the reviewer list | every agent pays a fixed start-up cost. By far the biggest lever. |
| **which tier** | per role | a cheap tier where the brief already contains the shape |
| **how much effort** | per role, where the harness passes it | otherwise it is your session's setting, not a per-call flag |
| **the output ceiling** | per role | how long a report may run |

The ceiling is **an instruction to the callee, not an enforced limit**, so it is written with a
consequence: a reviewer that cannot finish inside its budget must **say so and escalate, never return a
shallow pass that fits**. A truncated report reading as complete is the one outcome worse than an
expensive one, because the caller cannot tell and ships on it.

### Match it to the plan you are on

`/onboard` asks which subscription is paying, because it changes the right answer more than anything in
the repo does. Four ready-made profiles are in
[`plan-profiles.md`](plugins/lifecycle/skills/onboard/plan-profiles.md).

| Plan | Spec cold reads | Task / screens review | End review | Reviewer tier |
|---|---|---|---|---|
| **Pro** ~€20 | 1 — implementability | risky tasks only; screens on heavy | 2 reviewers | sonnet |
| **Max 5×** ~€100 | 4 | risky tasks; every UI task | 3 standing + triggered | opus |
| **Max 20×** ~€200 | 4, opus on two | as Max 5× | 3 standing + triggered | opus; the top tier on a diff you distrust |
| **API billing** | 4 | as Max 5× | as Max 5× | per-phase ceilings do the work |

Two things that are easy to get wrong:

- **The number of agents is the biggest lever**, not the tier. That is why `/deliver` builds in the
  session and groups lenses into a few reviewers.
- **Cut agents before you cut tier.** A cheaper reviewer that misses a defect is the most expensive review
  there is. The cut order is ranked by value per token, and it says **never** drop the implementability
  spec review or `plan-check`'s claims axis, whatever you are paying.

## Status

**v0.7.0 — early, and now partly proven.** All fourteen skills, four agents and the fragment gate are green.
`/onboard` has been run on a real foreign repo (this one) and re-run without changing a byte; a review
lens has been shown to catch a planted violation; `/lifecycle:advance` is verified on a real install.
[`CONTRIBUTING.md`](CONTRIBUTING.md) lists what has **not** been proved yet — chiefly that `/deliver`,
`/ship` and `/babysit` have not run end to end from this plugin, although the process they encode is the
one the source repo builds with today. Read it before relying on this for something that matters.

## Where it came from

The lifecycle grew inside one private .NET monorepo and was rewritten here to depend on nothing about
it. Ideas were borrowed from several public skill collections; **no code was.** See
[`ATTRIBUTION.md`](ATTRIBUTION.md).
