# Reading the spec cold — the four lenses

[`spec`](SKILL.md) spawns [`spec-reviewer`](../../agents/spec-reviewer.md) once per lens, all four in
one message. The agent definition holds what is invariant — the cold-read rule, the settled-alternatives
rule, the severities, the report shape. Your prompt carries only what changes per call:

> Spec: `<specs dir>/<dir>/spec.md` (written, not yet committed)
> Lens: `<name>`
> `<the lens body, verbatim from below>`

**Keep the design conversation out of it.** A reviewer told the answers cannot tell you which are
missing, and that is the whole product of this round.

## Choosing the model per call

There is no default tier. Two things decide it: how much judgement the lens needs, and how much the
spec puts at risk.

| Lens | Small spec | Spec with reach |
|---|---|---|
| **implementability** | opus | opus |
| **scope** | sonnet | opus |
| **testability** | sonnet | opus *when the testing section is thin or the seams are new* |
| **house rules** | sonnet | sonnet |

**Spec with reach** = any of: more than one service or deployable, new persisted state or a schema
change, a wire or message contract, a permission boundary, a new seam, or a decision record came out of
the grilling.

The reasoning, so the table can be adapted rather than obeyed:

- **implementability is always opus.** Simulating a fresh implementer across a whole document and
  finding where two honest readings diverge is open-ended reasoning. Every gap it misses becomes a
  decision an implementer makes alone at 200k context.
- **house rules is always sonnet.** Lookup and comparison against documents that state the rule
  outright. Precision matters; breadth of judgement does not.
- **scope and testability scale with the spec**, because their difficulty does. Judging whether Out of
  Scope is complete is easy for one service and hard across three.

When torn, take opus for that lens. Four reviewers on one markdown file is the cheapest step in the
lifecycle, and it sits upstream of the most expensive one.

---

## Lens catalogue

**implementability**
> Read this as the engineer who will build it: fresh context, weeks from now, no memory of the
> conversation — which is literally what happens next. Walk the Requirements and the Acceptance
> criteria and find every place you would have to **guess**: two honest readings that produce different
> code, a behaviour named but not specified, an entity whose lifecycle is implied and never stated, an
> error or empty path nobody decided, an interaction between two decisions the spec makes separately.
> For each, give the two candidate readings. Leave them unresolved — the missing decision is the
> finding.

**house rules**
> Check the spec against what this repo has already decided. Start from `.agents/docs.md`: the glossary
> it names is the vocabulary and **beats the spec's wording** — flag every term that conflicts with it
> or introduces a synonym it rules out. Then the repo rules and conventions that file points at:
> forbidden libraries and patterns, required layering, naming and typing rules, UI patterns. Then the
> architecture documents and decision records — a spec that routes around a documented seam or
> contradicts an accepted decision is a finding **with both sides quoted**. Finally, any claim the spec
> makes about how the system works today that those documents contradict.

**testability**
> `/plan` turns the named seams into each task's *where to write tests*, so vagueness here costs
> quality downstream. Against the testing rules in `.agents/gates.md` and
> `.agents/docs.md`, find: named seams that are not seams or do not exist; behaviour in the
> requirements with no seam named at all; a test level that cannot fail for the right reason, or one
> that could be cheaper; prior art cited that does not match. Then the coverage floor in
> `.agents/gates.md` — flag anything the spec implies building that cannot be covered as designed. Say
> which it is: a missing seam, or a slice that genuinely cannot be tested and should say so in the spec.

**scope**
> Two failure modes, and a spec can have either. **Under-drawn:** Out of Scope omits something the
> requirements plainly imply, so it surfaces mid-build as scope creep — name what is missing.
> **Over-built:** the spec carries flexibility nobody asked for — an abstraction with one implementer
> and no seam behind it, a configuration nobody sets, a hook for something the spec itself puts out of
> scope. For each, say what deleting it would cost. Then check the spec does its own job: are the
> rejected alternatives recorded with their reasons?

---

## Adding a lens

A repo with a recurring failure mode of its own should have a lens for it, named in
`.agents/lifecycle.md`. Write the body the way the four above are written: **what to look at, what
counts as a finding, and what to do when it is ambiguous.** A lens that only says "check the security"
returns prose.
