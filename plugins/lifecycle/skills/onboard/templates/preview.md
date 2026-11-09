# Preview — seeing a screen before and after a change

`/deliver` photographs every screen a plan task changes: "before" on the default branch, "after" once the
task is built. A fresh reviewer reads the images against the design reference, and the review walkthrough
shows them to the person who signs off. **This file is how that happens here.**

<If this repo has no UI, replace everything below with one line: `NOT CONFIGURED — no user interface.`
Every screens step is then skipped, said once per run.>

## Bring it up, and down

```bash
<the command that starts the app, or the part of it a screen needs>     # prints: <what "ready" looks like>
<the command that stops what that command started — and only that>
```

- **Ready means:** <a URL answering, a health check, a log line>.
- **Several worktrees at once:** <one stack per tree on its own port | one shared stack — never start a second>.

## Seed a scenario

A **scenario** is the state a screen needs: the records, the user, the permissions.

```bash
<the command that resets the data and applies a named scenario>
```

- **Scenarios live in:** `<path>`. A plan task that needs data no scenario has adds it in the same change.
- **Sign-in:** <how the screenshot tool signs in — a test user, a token, no auth locally>.

## Take the screenshots

```bash
<the command that screenshots named screens into a directory>
```

- **Screens are named as:** <routes, story ids, page names>.
- **Fixed for every image:** <width> px wide, <language>, <time zone>, <light | dark> theme, signed in as <role>.
- **Output:** <the image format and a manifest, if the tool writes one>. A walkthrough embeds the images,
  so keep them small enough that the page stays under 2 MB.

## The review command

The one command a reviewer runs in the review branch's tree to see the change with real data:

```bash
<the command: start, seed the scenario, print a link per changed screen>
```

## Where the design reference lives

- **Reference:** <a design-system package, a component catalogue, a design tool link, an existing page
  to copy>. A plan task's `Reference:` names an entry here.
- **Known deviations:** <where the product knowingly differs from the reference — a reviewer does not
  report these>.

## Known traps

- <e.g. the first screenshot run downloads a browser; the app follows the user's profile language, not
  the browser's>
