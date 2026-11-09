**The session builds; agents review and scout.** A call names its model only where this table says so.
`.agents/lifecycle.md` § *Effort and budget* may lower a row for cost; it says so when it does.

| Call | Model |
|---|---|
| build a plan's tasks, and fix what review found | the session's own model — no agent writes production code |
| every `change-reviewer`: plan check, task review, screens review, each end-review reviewer | `opus` |
| the `implementability` spec lens | `opus` |
| the other spec lenses · scouting | `sonnet` |

- **The most expensive tier is allowed where one missed flaw would be expensive, and is never a
  default.** Name each such step in the plan with one line on why.
- **A `sonnet` agent blocked on execution gets one re-run on `opus`.** An `opus` agent that fails twice is
  re-scoped, or its question left to the end review.
- **Fewer agents beat thinner agents.** Every agent pays a fixed start-up cost before it reads a line —
  on the order of 15–20k tokens — so merging two lenses into one reviewer saves more than trimming a
  tool list or picking a cheaper tier.
