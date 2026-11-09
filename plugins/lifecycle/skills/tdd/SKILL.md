---
name: tdd
description: The red-green loop, and what makes a test worth keeping — one test, one implementation, repeat, at seams that were agreed before any test was written. Use when building a feature or fixing a bug test-first, when someone says "red-green-refactor" or "write the test first", and by `/deliver` on every plan task. Keywords - tdd, test first, red green, write the test first, failing test, seam, tautological test, what should I test.
---

# Test-driven development

The red → green loop. This is the reference that makes the loop produce tests worth keeping.

<!-- shared:repo-config:start source=repo-config.md -->
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
<!-- shared:repo-config:end -->

## Ground yourself first

- **The glossary named in `.agents/docs.md`.** Test names and interface vocabulary use the project's
  words. A test named for a synonym the glossary rules out is a rename waiting to happen.
- **The accepted decisions and documented seams** for the area you touch. They are constraints, not
  suggestions.
- **`.agents/naming.md`** for the test-name grammar, and **`.agents/gates.md`** for the test levels, the
  test command and the coverage floor.

## Seams — where tests go

A **seam** is the public boundary you observe behaviour at without reaching inside. Tests live at seams,
never against internals.

**Test only at agreed seams.** They are named in [`plan.md`](../plan/SKILL.md) before any code is
written, and the plan task carries them. **Do not invent one mid-test.** A seam chosen while writing the
test is chosen to make that test easy, which is how a suite ends up pinned to the implementation it was
meant to be independent of.

No seam in your brief, or the one you were given cannot observe the behaviour? **Say so and stop** — that
is `architectural-ambiguity`, and it goes back to the plan. It is not yours to settle quietly.

## Which level

Take the **cheapest test level that can faithfully reproduce the failure mode.** The levels, their costs
and which ones this repo keeps rare are in `.agents/gates.md`. If stubbing at a cheap level would
trivialise the assertion, either promote the test or rename it to match what it actually proves.

## Rules of the loop

- **Red before green.** Write the failing test, watch it fail for the right reason, then write only
  enough code to pass it. **A test you never saw fail is a test you have not verified.**
- **One slice at a time.** One seam, one test, one minimal implementation per cycle. Never write all the
  tests and then all the code — bulk tests verify *imagined* behaviour and pin the shape of things
  rather than what a caller does.
- **Refactoring is not part of the loop.** It belongs to review.
- **Do not anticipate.** No speculative feature, no test for a case the task did not ask for.

## What a good test is

It verifies behaviour through a public interface, reads like a specification, and survives a refactor
because it does not care about internal structure.

- **Name it per `.agents/naming.md`.** Enforced in review.
- **Comment it per `.agents/naming.md`**, and nothing else. A test explaining itself in prose is a test
  whose name is wrong.
- **One logical assertion.** Several assertion calls proving one behaviour is fine; two behaviours is two
  tests.

## The three anti-patterns

- **Tautological** — the expected value is computed the way the code computes it, so it passes by
  construction and can never disagree with the implementation.

  ```ts
  // BAD — recomputes the implementation
  const expected = items.reduce((n, i) => n + i.price, 0)
  expect(total(items)).toBe(expected)

  // GOOD — an independent, known literal
  expect(total([{ price: 10 }, { price: 5 }])).toBe(15)
  ```

  **Never pin a constant to its own literal.** Cover the value through the behaviour that uses it.

- **Implementation-coupled** — mocks an internal collaborator, reaches a private member, or verifies
  through a side channel (querying the table instead of reading back through the API). The tell: it
  breaks on a refactor while behaviour is unchanged.

  ```ts
  // BAD — bypasses the interface to verify
  await createUser({ name: 'Alice' })
  const row = await db.users.findOne({ name: 'Alice' })

  // GOOD — verifies through the interface
  const created = await createUser({ name: 'Alice' })
  expect((await getUser(created.id)).name).toBe('Alice')
  ```

- **Horizontal slicing** — all the tests, then all the code. Work in vertical slices instead, each test a
  tracer bullet that responds to what the last cycle taught you.

## Mocking

**Mock at system boundaries only**: an external API, the clock, randomness, sometimes the file system.
Prefer a real dependency through the repo's test harness over mocking the database.

**Never mock your own types.** An internal collaborator you control is not a boundary, and mocking it is
how a test becomes implementation-coupled.

Two rules that make a boundary easy to substitute:

- **Inject the dependency**, never construct it inside the unit.
- **Prefer a purpose-named method per operation over one generic fetcher.** `getUser(id)` can be
  substituted with one shape; `send(endpoint, options)` forces conditional logic into the stub, which is
  a second implementation nobody reviews.

**Control time explicitly** through whatever abstraction the repo uses. Never read the system clock
directly in code under test.

## Cover what you add

The floor and the tool that measures it are in `.agents/gates.md`.

Working test-first covers the paths the task is about. **Then walk your own diff** for the code around
them — a guard clause, an error path, an extracted helper — and report any added line no test executes.
**You never reach the floor by widening an exclusion or by writing a test that passes by construction.**

## TDD exemptions

Work a test cannot precede: a generated client, pure configuration, documentation, a mechanical rename.
**Name every exemption you use in your report.** An unnamed exemption is indistinguishable from a skipped
test.

## Running the tests

Use the command in `.agents/gates.md`, not the framework's bare runner. Where the two differ, the
configured one usually adds coverage and the exclusions the quality gate uses — and it is the only
faithful preview of what CI will say.
