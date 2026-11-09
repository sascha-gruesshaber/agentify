---
name: show
description: Put something in front of the user as a page they can point at — a process flow, a set of options, a spec, a before-and-after, run progress — with every block annotatable so their notes come back labelled. Also builds the spec and review walkthroughs. Use when a picture would land better than prose, when a decision needs comparing side by side, or when someone says "show me", "draw it", "let me see it", "I want to comment on that". Keywords - show, show me, draw it, diagram, visualise, mockup, flow chart, options, side by side, let me see, annotate, comment on it, feedback page.
---

# Show (a thing → a page you can point at)

Turn something into a page, publish it, open it, and read the user's notes back.

**Decide per question, not per session.** The test is one line: **would they understand this better by
seeing it than by reading it?**

| Show it | Say it in chat |
|---|---|
| a process, a flow, a state machine | a yes/no question |
| four options that differ visually or structurally | two options that differ in one word |
| a spec or plan they are about to agree with | a fact they asked for |
| a comparison with more than two columns | a list of three bullets |
| progress of a long unattended run | a status line |

A question *about* a UI is not automatically a visual question. "What should the rule be?" is a chat
question. "Which of these three layouts?" is a page.

**Never make a page to look thorough.** A page nobody needed costs the user a click and costs you the
tokens to build it.

## Step 1 — Pick the shape

Five shapes cover almost everything. The skeleton and the classes for all of them are in
[`page-template.html`](page-template.html) — **start from it rather than rebuilding the annotation
machinery**, which has bitten this skill twice.

| Shape | For | Blocks |
|---|---|---|
| **flow board** | a process with phases, or several systems compared over the same phases | a grid of `.step` chips, one column per actor, one row per phase |
| **decision sheet** | open questions from a grilling round | one `.card` per question, two to four options, the recommendation marked |
| **document review** | a spec or plan they must agree with | one row per numbered requirement, each annotatable |
| **before and after** | a refactor, a data-model change, a layout change | two `.split` panels side by side |
| **walkthrough** | the spec walkthrough at the end of `/spec`, the review walkthrough at the end of `/deliver` | the sections of [`walkthrough-template.html`](walkthrough-template.html), overview first |

**Draw the gaps.** A dashed red box where a thing is missing says more than a paragraph about it.

### The walkthrough shape has its own rules

- **Start from `walkthrough-template.html`, a whole document** that opens in any browser. Its notes
  script is the same as `page-template.html`'s, so change both together.
- **Overview first, then one level deeper per section.** Cut every section the change does not need.
- **Pictures, lists and short sentences.** Never restate what a picture shows, never paraphrase the spec.
  The user reads this *instead of* the spec, so every extra sentence is one they skip.
- **In the language `.agents/working-agreement.md` names for walkthroughs**; English when it names none.
  Translate the template's headings and tray texts when the language differs.
- **Write it beside the spec, as `spec-walkthrough.html` or `review-walkthrough.html`.** Rewrite the same
  file each round, and commit it with the spec or before the review opens.
- **Screenshots go in as `data:` images** and the page stays under 2 MB; `check-page.mjs` refuses a
  heavier walkthrough. A review walkthrough names the review command from `.agents/preview.md`, and says
  which input was missing when a screen has no image.
- **A spec walkthrough shows every changed user flow as a UI mock** — a sketch on the page is enough.

## Step 2 — Build it

Write the file to the session scratchpad, **not into the repo** — except a walkthrough, which goes beside
its spec. If an `artifact-design` skill is
available, load it before writing — it calibrates how much design the page actually warrants.

**Every block the user might comment on carries two attributes:**

```html
<button class="step" data-note data-label="Ours / Plan">…</button>
<div class="card" data-note data-label="Q3 · naming">…</div>
<div class="panel" data-note data-label="After">…</div>
<tr data-note data-label="Requirement 3"><td class="n">3</td><td>…</td></tr>
```

`data-label` is what comes back in their paste, so make it the name **you** would use for that block in
conversation. `data-note` is what wires it up.

Three rules the template already obeys, learned the hard way:

- **Resolve the tray elements before the wiring loop.** Each block's initial refresh calls the tray; if
  the tray's handles are looked up further down the file, the first block throws and **every block after
  it is silently dead.**
- **Never call `confirm()`, `alert()` or `prompt()`.** The viewer sandbox blocks them, so the guard
  returns false and the handler does nothing at all. Use a two-tap button.
- **Key notes by `data-label`, not by index.** Then a note survives the page gaining a section.

**Verify it before you show it:** `node <skill dir>/check-page.mjs <file>`, where `<skill dir>` is this
skill's own directory. Where the repo has `jsdom` installed, it loads the page, checks that every
`[data-note]` block got its note button and that typing a note enables the copy button; otherwise it runs
a static check and says so. It exits 1 and names the failure. **A page whose annotation is broken is
worse than prose, because the user finds out only after writing.**

## Step 3 — Put it in front of them

**A walkthrough is shown, not published:** it is a committed file. Render it inline where your harness
can render HTML; otherwise open it in the machine's default browser, or name the file for them to open.

Every other shape: publish it where your harness can host a page, and **keep one link per topic** —
republish to the same place as the topic moves, never a new link per round; a second link means the
user is reading a stale copy. Where nothing can host it, open the file locally or name it.

Give the link or the path in chat as well. That is the fallback that always works, and **no display
surface is never a failure.**

## Step 4 — Say what is on it, then stop

Two or three lines: what the page shows, what you want from them, and the link. Then end the turn.

> The flow board is up — four systems over the same ten phases. The dashed red boxes are where we have
> nothing. Click any box to leave a note, then **Copy for Claude** at the bottom and paste it back.

**Do not paraphrase the page in chat.** If it needs a summary to be understood, redraw it.

## Step 5 — Read the notes back

Their paste arrives as one block, each line labelled with the block it came from:

```
- **Ours / Plan** — this is the bit I care about
- **Q3 · naming** — B, but call it a magazine
```

Treat each line as a live decision, exactly as if they had said it in a grilling round. Fold it in,
redeploy the same path, and say in one line what changed.

**A block with no note is not agreement.** Say what you are taking as settled and let them correct it.

## When a page stops being enough

The paste-back is the one seam here: **the published page cannot send anything anywhere**, because the
sandbox blocks every outbound request. If that starts to grate, the upgrade is a local companion server
that turns a click into a file this session reads on its next turn. **That is a deliberate future step,
not a gap to work around now.** Do not try to make the artifact phone home.
