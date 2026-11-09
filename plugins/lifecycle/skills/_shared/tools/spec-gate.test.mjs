import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

import { checkSpec, fingerprint, parseGate } from './spec-gate.mjs'

const TOOL = fileURLToPath(new URL('./spec-gate.mjs', import.meta.url))

const BODY = `**Scope:** A thing.

## Problem

It is missing.

## Requirements

1. It does the thing.

## Acceptance criteria

1. The thing is done.

## Decisions

- **Do it this way.** Rejected: the other way.

## Constraints

- A constraint.
`

const spec = ({ tier, risk = 'none', signed } = {}) =>
  [
    '**Date:** 2026-11-08',
    '**Status:** Specced',
    `**Risk:** ${risk}`,
    tier ? `**Review tier:** ${tier}` : null,
    signed ? `**Signed off:** ${signed}` : null,
    BODY,
  ]
    .filter((line) => line !== null)
    .join('\n')

const signedLine = (text, via = 'walkthrough') => `2026-11-08 · ${via} · ${fingerprint(text)}`

const signedSpec = (opts = {}) => spec({ ...opts, signed: signedLine(BODY) })

test('checkSpec passes a spec with no review tier', () => {
  const text = spec()

  const result = checkSpec(text)

  assert.equal(result.ok, true)
})

test('checkSpec refuses a tiered spec with no sign-off', () => {
  const text = spec({ tier: 'medium' })

  const result = checkSpec(text)

  assert.equal(result.ok, false)
  assert.match(result.reason, /no sign-off/)
})

test('checkSpec refuses a light spec with no sign-off', () => {
  const text = spec({ tier: 'light' })

  const result = checkSpec(text)

  assert.equal(result.ok, false)
})

test('checkSpec passes a tiered spec whose sign-off matches', () => {
  const text = signedSpec({ tier: 'heavy' })

  const result = checkSpec(text)

  assert.equal(result.ok, true)
})

test('checkSpec refuses an unknown tier', () => {
  const text = signedSpec({ tier: 'meduim' })

  const result = checkSpec(text)

  assert.equal(result.ok, false)
  assert.match(result.reason, /Review tier/)
})

test('checkSpec refuses a malformed sign-off line', () => {
  const text = spec({ tier: 'medium', signed: '2026-11-08 · walkthrough' })

  const result = checkSpec(text)

  assert.equal(result.ok, false)
  assert.match(result.reason, /Signed off/)
})

for (const [section, before, after] of [
  ['requirements', '1. It does the thing.', '1. It does a different thing.'],
  ['acceptance criteria', '1. The thing is done.', '1. The thing is half done.'],
  ['decisions', '- **Do it this way.**', '- **Do it that way.**'],
]) {
  test(`checkSpec refuses a spec whose ${section} changed after the sign-off`, () => {
    const text = signedSpec({ tier: 'medium' }).replace(before, after)

    const result = checkSpec(text)

    assert.equal(result.ok, false)
    assert.match(result.reason, /changed since the sign-off/)
  })
}

test('checkSpec passes when only scope and constraints changed after the sign-off', () => {
  const text = signedSpec({ tier: 'medium' })
    .replace('A thing.', 'A broader thing.')
    .replace('- A constraint.', '- Another constraint.')

  const result = checkSpec(text)

  assert.equal(result.ok, true)
})

test('checkSpec refuses a named risk below heavy', () => {
  const text = signedSpec({ tier: 'medium', risk: 'auth' })

  const result = checkSpec(text)

  assert.equal(result.ok, false)
  assert.match(result.reason, /heavy/)
})

test('parseGate reads the tier and the sign-off from the header', () => {
  const text = spec({ tier: 'light', signed: '2026-11-08 · chat · 0123456789ab' })

  const gate = parseGate(text)

  assert.deepEqual(
    { tier: gate.tier, signedOff: gate.signedOff },
    { tier: 'light', signedOff: { date: '2026-11-08', via: 'chat', fingerprint: '0123456789ab' } },
  )
})

test('fingerprint ignores trailing whitespace', () => {
  const text = spec({ tier: 'medium' })

  const reformatted = text.replace('1. It does the thing.', '1. It does the thing.   ').replace(/\n/g, '\r\n')

  assert.equal(fingerprint(reformatted), fingerprint(text))
})

function specDir(text) {
  const dir = mkdtempSync(join(tmpdir(), 'spec-gate-'))
  writeFileSync(join(dir, 'spec.md'), text)
  return dir
}

const cli = (...args) => {
  try {
    return { code: 0, out: execFileSync('node', [TOOL, ...args], { encoding: 'utf8' }) }
  } catch (error) {
    return { code: error.status, out: `${error.stdout}${error.stderr}` }
  }
}

test('check exits 1 on a refused spec', () => {
  const dir = specDir(spec({ tier: 'heavy' }))

  const { code, out } = cli('check', dir)

  assert.equal(code, 1)
  assert.match(out, /\/spec --revise/)
})

test('check passes a spec that sign just signed', () => {
  const dir = specDir(spec({ tier: 'medium' }))

  const signed = cli('sign', dir, '--via', 'walkthrough')
  const checked = cli('check', dir)

  assert.deepEqual([signed.code, checked.code], [0, 0])
  assert.match(
    readFileSync(join(dir, 'spec.md'), 'utf8'),
    /^\*\*Signed off:\*\* \d{4}-\d{2}-\d{2} · walkthrough · [0-9a-f]{12}$/m,
  )
})

test('sign replaces an earlier sign-off line', () => {
  const dir = specDir(spec({ tier: 'medium', signed: '2026-11-01 · chat · 000000000000' }))

  cli('sign', dir, '--via', 'walkthrough')

  const lines = readFileSync(join(dir, 'spec.md'), 'utf8').match(/^\*\*Signed off:\*\*.*$/gm)
  assert.equal(lines.length, 1)
  assert.match(lines[0], / · walkthrough · /)
})

test('sign refuses a spec with no review tier', () => {
  const dir = specDir(spec())

  const { code } = cli('sign', dir, '--via', 'chat')

  assert.equal(code, 1)
  assert.doesNotMatch(readFileSync(join(dir, 'spec.md'), 'utf8'), /Signed off/)
})

test('checkSpec treats a missing risk line as a risk', () => {
  const text = signedSpec({ tier: 'medium' }).replace('**Risk:** none\n', '')

  const result = checkSpec(text)

  assert.equal(result.ok, false)
  assert.match(result.reason, /missing makes the change heavy/)
})

test('checkSpec refuses a sign-off through an unknown channel', () => {
  const text = spec({ tier: 'medium', signed: `2026-11-08 · email · ${fingerprint(BODY)}` })

  const result = checkSpec(text)

  assert.equal(result.ok, false)
  assert.match(result.reason, /Signed off/)
})

test('parseGate ignores gate lines below the header', () => {
  const text = `${spec()}\n## Example\n\n**Review tier:** heavy\n`

  const result = checkSpec(text)

  assert.equal(result.reason, 'no review tier: built as before')
})

test('sign refuses without --via', () => {
  const dir = specDir(spec({ tier: 'medium' }))

  const { code, out } = cli('sign', dir)

  assert.equal(code, 1)
  assert.match(out, /--via/)
})

test('checkSpec passes a heavy spec with a named risk', () => {
  const result = checkSpec(signedSpec({ tier: 'heavy', risk: 'auth' }))

  assert.equal(result.ok, true)
})

test('parseGate reads the tier from a line that carries its reason', () => {
  const { tier, tierError } = parseGate(spec({ tier: 'medium · a new screen' }))

  assert.equal(tier, 'medium')
  assert.equal(tierError, null)
})

test('check accepts a path to spec.md as well as its directory', () => {
  const dir = specDir(spec())

  const { code } = cli('check', join(dir, 'spec.md'))

  assert.equal(code, 0)
})

test('check exits 2, not 1, when there is no spec to read', () => {
  const dir = mkdtempSync(join(tmpdir(), 'spec-gate-empty-'))

  const { code, out } = cli('check', dir)

  assert.equal(code, 2)
  assert.match(out, /no spec at/)
})

test('a usage error exits 2', () => {
  assert.equal(cli('check').code, 2)
})
