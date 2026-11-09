# Docs — where truth lives, and what "done" includes

## Read these before making a claim about the system

In this order.

| # | What | Where |
|---|---|---|
| 1 | **the glossary** — the shared vocabulary | **none** — see below |
| 2 | **repo rules for agents** | [`../CONTRIBUTING.md`](../CONTRIBUTING.md) — the one rule, the gate, the flag never to add, how to write a skill, versioning, commits. [`../CLAUDE.md`](../CLAUDE.md) is a pointer to it and to this directory, and deliberately holds no rules of its own. |
| 3 | **architecture** — how the design works | [`../README.md`](../README.md) § *The idea* (law ships in the skills, shape lives in `.agents/`) and [`../plugins/lifecycle/skills/_shared/README.md`](../plugins/lifecycle/skills/_shared/README.md) (the fragment mechanism that enforces it) |
| 4 | **code conventions**, in prose | [`../CONTRIBUTING.md`](../CONTRIBUTING.md) § *Writing a skill here*. There is no `.editorconfig`, no formatter and no linter — the conventions are entirely prose and review. |
| 5 | **decisions** — the ones that close off alternatives | [`../ATTRIBUTION.md`](../ATTRIBUTION.md) (ideas taken and ideas rejected, with reasons) and [`../CONTRIBUTING.md`](../CONTRIBUTING.md) § *What is not proved yet* |

### There is no glossary

**NOT CONFIGURED, honestly: no `CONTEXT.md`, no `GLOSSARY.md`, no domain-model document exists.**

The repo does use a handful of terms with sharp, non-obvious meanings — *law* vs *shape*, *fragment*,
*managed region*, *lens*, *reviewer*, *ship mode*, *gate*, *frozen ground* — but each is defined at its point of use, not
in one place. So:

- **A spec's wording is currently the authority**, because there is nothing above it to lose to.
- **When a spec or a grill session settles a term, define it where it is used and keep the wording
  identical everywhere.** Two words for one thing is the cheapest bug to fix now and the most expensive
  later, because it reaches skills, CI step names, commit subjects and the README all at once.
- To fill this in properly, this repo would need a `CONTEXT.md` collecting those eight terms. That is a
  real piece of work, not a blank to fill.

## Finding the document that owns a path

**There is no index and no `code:` frontmatter — nothing maps a path to its document automatically.** A
reviewer judges staleness by reading. The mapping is short enough to write down instead:

| Path | Owning document |
|---|---|
| `plugins/lifecycle/skills/**/SKILL.md`, `plugins/lifecycle/agents/**` | `CONTRIBUTING.md` § *Writing a skill here*; user-facing summary in `README.md` § *What each phase is for* and `plugins/lifecycle/README.md` |
| `plugins/lifecycle/skills/_shared/**` | `plugins/lifecycle/skills/_shared/README.md` |
| `plugins/lifecycle/skills/onboard/templates/**` | `README.md` § *The nine files `/onboard` writes* |
| `plugins/lifecycle/skills/onboard/plan-profiles.md` | `README.md` § *Match it to the plan you are on* |
| `.claude-plugin/marketplace.json`, `plugins/*/.claude-plugin/plugin.json` | `CONTRIBUTING.md` § *Versioning* |
| `.github/workflows/ci.yml` | `CONTRIBUTING.md` § *The gate*, and [`gates.md`](gates.md) |
| `plugins/plain-words/**` | `plugins/plain-words/README.md` |

## Docs are part of done

**When you change something under a path above, update its owning document in the same change.** Three
of them carry a specific cost:

1. **`README.md` has tables that mirror what ships** — the skill count, the phase list, the nine files,
   the plan-profile rows. **Adding or removing a skill, agent or profile row means editing the table in
   the same commit**, or the front page starts lying.
2. **`CONTRIBUTING.md` § *What is not proved yet* is a live list of the honest gaps.** When a change
   proves one of those lines, or breaks it, **edit that list in the same commit.** It is the most
   valuable paragraph in the repo and the easiest to leave stale.
3. **`ATTRIBUTION.md`** — only when an idea is taken from, or rejected against, an outside source.

Write **what is true now**, never a changelog. No "added in July", no review numbers, no
"previously this…". A ticket that touches a documented path carries its document in the acceptance
criteria, **by name**.

## Decision records

A decision earns its own record when **all three** hold: it is hard to reverse, it is surprising
without context, and it is the result of a real trade-off. Two of three is a line in the spec.

- **Where:** there is no `docs/decisions/`. **Record decisions in the spec** under its decisions
  section. Where the decision rejects an idea taken from an outside source, it also goes in
  `ATTRIBUTION.md`.
- **Numbering:** whoever writes the spec, within that spec. No repo-wide numbering exists.

## Frozen ground

**None.** No directory here is history that must not be edited or cited. Every file in the tree is
current, and `ATTRIBUTION.md` states there is *no merge and no upgrade path* from the sources this kit
came from — so there is nothing vendored to keep frozen.
