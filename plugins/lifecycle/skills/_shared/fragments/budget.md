**How much a call is allowed to cost is configured, not improvised.** `.agents/lifecycle.md` § *Effort
and budget* sets, per role: the **model tier**, the **reasoning effort**, and a **soft output ceiling**.
Read it before dispatching. Pass the tier; pass the effort too where your harness's dispatch takes one,
and otherwise treat it as the effort this session should run at.

Four levers, in the order they actually move cost:

1. **How many agents** — every agent pays a fixed start-up cost, so grouping lenses into fewer reviewers
   is the largest lever by a distance.
2. **Which tier** — a cheap tier on a call whose shape is already written down.
3. **How much effort** — reasoning effort per call, independent of tier.
4. **The output ceiling** — how long a report may run.

**The ceiling is an instruction to the callee, not an enforced limit.** So it is written as a
consequence, and the consequence is never "skim":

> Stay under about `<n>` output tokens. **If the work does not fit, return `reviewer-uncertainty` and say
> what you did not reach — never a shallow pass inside the budget.**

A truncated report that reads as complete is the one outcome worse than an expensive one, because the
caller cannot tell the difference and ships on it.

Two rules that keep a budget honest:

- **Report what a phase cost** when the run is over: calls made, tier each ran on, and anything that hit
  its ceiling. A budget nobody measures is a preference.
- **A budget is a default, not a cap on judgement.** Where a call genuinely needs more — a diff far past
  what one reviewer can hold, a security lens over a permission change — take the higher tier and **say in
  one line that you did and why.** Silently overspending and silently underspending are the same defect.

**A budget is tight because of the subscription, not the repo**, so `.agents/lifecycle.md` records which
plan is paying and which profile was taken. When it says a lens was dropped for **cost** rather than
relevance, do not helpfully add it back.

If `.agents/lifecycle.md` sets no budget, say so once and use the defaults in this document's own model
table.
