**A review pass is a fixed number of agents, and the number of passes is fixed too.** Rounds after the
first mostly return wording, not defects. `.agents/lifecycle.md` § *Reviewers* names the reviewers; the
shape below holds whatever they are.

| Phase | Agents | Passes |
|---|---|---|
| spec written | one `spec-reviewer` per lens, in one message | 1, and a second **only** if the first changed the design — then **one** agent over the changed sections |
| plan written | 1 `change-reviewer`, every axis in one checklist | 1, no repeat |
| risky task built | 1 `change-reviewer`, the *task review*, before the next task starts | 1 fix round, no re-review |
| UI task built | 1 `change-reviewer`, the *screens review*, on that task's images | 1 fix round, no re-review |
| last task built | the standing reviewers plus one per triggered conditional reviewer, in one message | 2 at most; the second needs a written reason and is scoped to the fix range and to the reviewers that found a `must` |

**A task gets its own review only when the plan marks it `Risky: yes`:** it touches what
`.agents/lifecycle.md` § *Reviewers* lists as risky — by default authentication, tenancy, permissions, a
migration or a wire contract. Every other task is read by the end review.

**One fix round per pass, by the session that wrote the code.** What it does not fix goes into the
implementation record as a deferral, with the reason — never into another review round.

**Never argue with a finding by sending another reviewer.** Settle it yourself, in the open.

**Spending more than this is the user's call, never a quiet one of yours.** Say what another pass would
look at and what it would cost, and let them ask.
