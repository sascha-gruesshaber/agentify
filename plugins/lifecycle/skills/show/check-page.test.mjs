import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

import { checkPage, WALKTHROUGH_LIMIT_BYTES } from './check-page.mjs'

const TEMPLATE = readFileSync(join(import.meta.dirname, 'walkthrough-template.html'), 'utf8')
const PAGE = readFileSync(join(import.meta.dirname, 'page-template.html'), 'utf8')
// A directory with no package.json, so jsdom never resolves and the static check runs.
const NO_JSDOM = { from: tmpdir() }
// The plugin directory, where CI installs jsdom for the wiring tests.
const PLUGIN = { from: join(import.meta.dirname, '..', '..') }
const hasJsdom = (() => {
  try {
    createRequire(join(PLUGIN.from, 'package.json'))('jsdom')
    return true
  } catch {
    return false
  }
})()
const withBlock = (page) => page.replace('<div class="wrap">', '<div class="wrap"><div data-note data-label="Probe">probe</div>')
const copyNeverEnables = (page) => page.replace('copyBtn.disabled = n === 0;', 'copyBtn.disabled = true;')

test('checkPage passes the walkthrough template', async () => {
  assert.deepEqual(await checkPage(TEMPLATE, NO_JSDOM), { failure: null, mode: 'static' })
})

test('checkPage treats a page-template fragment as a fragment, not a walkthrough', async () => {
  const heavyFragment = withBlock(PAGE).replace('</style>', `</style><!-- ${'x'.repeat(WALKTHROUGH_LIMIT_BYTES)} -->`)
  assert.equal((await checkPage(heavyFragment, NO_JSDOM)).failure, null)
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

test('checkPage refuses a page whose tray has no copy button', async () => {
  const trayless = TEMPLATE.replace('id="copyBtn"', 'id="copyButton"')
  assert.match((await checkPage(trayless, NO_JSDOM)).failure, /copy button/)
})

test('checkPage runs the wiring in jsdom and passes both templates', { skip: !hasJsdom && 'jsdom not installed' }, async () => {
  assert.deepEqual(await checkPage(TEMPLATE, PLUGIN), { failure: null, mode: 'dom' })
  assert.deepEqual(await checkPage(withBlock(PAGE), PLUGIN), { failure: null, mode: 'dom' })
})

test('checkPage in jsdom refuses a copy button no note can enable', { skip: !hasJsdom && 'jsdom not installed' }, async () => {
  const broken = copyNeverEnables(TEMPLATE)
  assert.equal((await checkPage(broken, NO_JSDOM)).failure, null)
  assert.match((await checkPage(broken, PLUGIN)).failure, /copy button stays disabled/)
})
