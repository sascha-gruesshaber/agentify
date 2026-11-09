# agentify

Two Claude Code plugins in one marketplace. Start at [`README.md`](README.md); the rules for changing
anything are in [`CONTRIBUTING.md`](CONTRIBUTING.md).

## How this repo works, for agents

`.agents/` describes this repository to the `lifecycle` plugin's skills — the gates, the naming grammar,
the review lenses, the effort budget, the working agreement. **It is authority.** Start at
[`.agents/README.md`](.agents/README.md).

**This repo is also the plugin those skills come from**, so two things bite here and nowhere else:

- **A change under `plugins/lifecycle/` does not affect this session.** Skills load from the installed
  copy. See [`CONTRIBUTING.md`](CONTRIBUTING.md) § *A change here does not affect the session that made
  it*.
- **Edit the fragment, never the injected copy.** `skills.mjs sync` writes into 18 tracked documents, so
  resolve a conflict in one by fixing the fragment and syncing again.
