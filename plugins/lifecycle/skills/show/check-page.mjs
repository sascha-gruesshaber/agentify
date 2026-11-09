#!/usr/bin/env node

// The /show verification step: note buttons wired, copy enabled by a note, a walkthrough under 2 MB.
// `node check-page.mjs <page.html>` exits 1 and names the failure otherwise.

import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

// A walkthrough is committed with its screenshots inside, so the repository grows by every byte of it.
export const WALKTHROUGH_LIMIT_BYTES = 2 * 1024 * 1024

// The plugin ships no node_modules, so jsdom comes from the repo the page is checked in, when it has one.
function loadJsdom(from) {
  try {
    return createRequire(join(from, 'package.json'))('jsdom')
  } catch {
    return null
  }
}

function staticCheck(html) {
  const blocks = (html.match(/\sdata-note[\s>=]/g) ?? []).length
  if (blocks === 0) return 'no [data-note] block on the page'
  if (!/<script>[\s\S]*querySelectorAll\("\[data-note\]"\)[\s\S]*<\/script>/.test(html)) {
    return 'the notes script is missing: copy it from page-template.html'
  }
  if (!/id="copyBtn"/.test(html)) return 'the tray is missing its copy button'
  return null
}

async function domCheck(html, JSDOM) {
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true })
  await new Promise((resolve) => setTimeout(resolve, 50))
  const d = dom.window.document
  const blocks = d.querySelectorAll('[data-note]').length
  const buttons = d.querySelectorAll('.noteBtn').length
  if (blocks === 0) return 'no [data-note] block on the page'
  if (blocks !== buttons) return `${blocks} [data-note] blocks but ${buttons} note buttons: a block's wiring threw`
  const box = d.querySelector('.noteBox textarea')
  box.value = 'probe'
  box.dispatchEvent(new dom.window.Event('input'))
  if (d.getElementById('copyBtn')?.disabled !== false) return 'the copy button stays disabled after a note is typed'
  dom.window.close()
  return null
}

/** Returns `{ failure, mode }`: `failure` is null when the page passes; `mode` says which check ran. */
export async function checkPage(html, { from = process.cwd() } = {}) {
  const isWalkthrough = /<html[\s>]/i.test(html)
  const bytes = Buffer.byteLength(html, 'utf8')
  if (isWalkthrough && bytes > WALKTHROUGH_LIMIT_BYTES) {
    const mb = (bytes / 1024 / 1024).toFixed(1)
    return { failure: `the walkthrough is ${mb} MB, over the 2 MB limit: take fewer or smaller screenshots`, mode: 'size' }
  }
  const jsdom = loadJsdom(from)
  if (!jsdom) return { failure: staticCheck(html), mode: 'static' }
  // A page-template.html page is a fragment the viewer wraps; a walkthrough is a whole document.
  const doc = isWalkthrough ? html : `<!doctype html><html><head></head><body>${html}</body></html>`
  return { failure: await domCheck(doc, jsdom.JSDOM), mode: 'dom' }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const file = process.argv[2]
  if (!file) {
    process.stdout.write('usage: check-page.mjs <page.html>\n')
    process.exitCode = 1
  } else {
    const { failure, mode } = await checkPage(readFileSync(file, 'utf8'))
    const note = mode === 'static' ? ' (static check: jsdom is not installed in this repo, so the wiring did not run)' : ''
    process.stdout.write(failure ? `check-page: ${failure}\n` : `check-page: ${file} ok${note}\n`)
    process.exitCode = failure ? 1 : 0
  }
}
