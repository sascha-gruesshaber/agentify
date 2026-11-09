import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

import { checkPage, WALKTHROUGH_LIMIT_BYTES } from './check-page.mjs'

const TEMPLATE = readFileSync(join(import.meta.dirname, 'walkthrough-template.html'), 'utf8')
const PAGE = readFileSync(join(import.meta.dirname, 'page-template.html'), 'utf8')
// A directory with no package.json, so jsdom never resolves and the static check runs.
const NO_JSDOM = { from: tmpdir() }

test('checkPage passes the walkthrough template', async () => {
  assert.deepEqual(await checkPage(TEMPLATE, NO_JSDOM), { failure: null, mode: 'static' })
})

test('checkPage refuses a walkthrough over two megabytes', async () => {
  const heavy = TEMPLATE.replace('</body>', `<!-- ${'x'.repeat(WALKTHROUGH_LIMIT_BYTES)} --></body>`)
  assert.match((await checkPage(heavy, NO_JSDOM)).failure, /over the 2 MB/)
})

test('checkPage refuses a page with no note block', async () => {
  const bare = TEMPLATE.replace(/\sdata-note(?=[\s>=])/g, '')
  assert.match((await checkPage(bare, NO_JSDOM)).failure, /no \[data-note\] block/)
})

test('checkPage refuses a page whose notes script was dropped', async () => {
  const scriptless = TEMPLATE.replace(/<script>[\s\S]*<\/script>/, '')
  assert.match((await checkPage(scriptless, NO_JSDOM)).failure, /notes script is missing/)
})

test('the walkthrough template names a missing input and the review command', () => {
  assert.match(TEMPLATE, /class="missing"/)
  assert.match(TEMPLATE, /review command from \.agents\/preview\.md/)
})
