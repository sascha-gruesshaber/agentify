#!/usr/bin/env node

// The spec gate: a spec with a review tier is built only once its walkthrough was signed off, and only
// while the signed-off requirements, criteria and decisions are still the ones in the file.
//
//   spec-gate.mjs check <spec dir | spec.md>                exit 1 names what is missing
//   spec-gate.mjs sign  <spec dir | spec.md> --via walkthrough|chat
//
// Exit 2 is a usage or I/O error, never a verdict on the spec.

import { createHash } from 'node:crypto'
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const TIERS = ['light', 'medium', 'heavy']
const VIAS = ['walkthrough', 'chat']
const SIGNED_SECTIONS = ['Requirements', 'Acceptance criteria', 'Decisions']

const TIER_LINE = /^\*\*Review tier:\*\*[ \t]*(.*)$/m
const SIGNED_LINE = /^\*\*Signed off:\*\*[ \t]*(.*)$/m
const SIGNED_VALUE = /^(\d{4}-\d{2}-\d{2}) · (\S+) · ([0-9a-f]{12})$/
const RISK_LINE = /^\*\*Risk:\*\*[ \t]*(.*)$/m

const say = (line) => process.stdout.write(`${line}\n`)

// The header is everything above the first heading, so an example line further down never counts.
function splitHeader(text) {
  const at = (text ?? '').search(/^## /m)
  return at === -1 ? [text ?? '', ''] : [text.slice(0, at), text.slice(at)]
}

function section(text, heading) {
  const lines = text.split('\n')
  const start = lines.findIndex((line) => line.trim() === `## ${heading}`)
  if (start === -1) return ''
  const rest = lines.slice(start + 1)
  const end = rest.findIndex((line) => line.startsWith('## '))
  return (end === -1 ? rest : rest.slice(0, end)).join('\n')
}

/** sha256 over the signed sections, so wording outside them can change without a new sign-off. */
export function fingerprint(text) {
  const normal = (text ?? '').replace(/\r\n?/g, '\n')
  const signed = SIGNED_SECTIONS.map((heading) =>
    section(normal, heading)
      .split('\n')
      .map((line) => line.trimEnd())
      .join('\n')
      .trim(),
  ).join('\n\u0000\n')
  return createHash('sha256').update(signed).digest('hex').slice(0, 12)
}

/** The review tier and the sign-off from a spec's header, with a malformed line named per field. */
export function parseGate(text) {
  const [header] = splitHeader(text)
  // Only the first word is the tier, so "medium · <the clause that sets it>" from /frame still reads.
  const tier = TIER_LINE.exec(header)?.[1].trim().split(/\s+/)[0] ?? null
  const tierError =
    tier !== null && !TIERS.includes(tier) ? `**Review tier:** "${tier}" is not one of ${TIERS.join(', ')}` : null

  const signedRaw = SIGNED_LINE.exec(header)?.[1].trim() ?? null
  const m = signedRaw === null ? null : SIGNED_VALUE.exec(signedRaw)
  const signedOff = m && VIAS.includes(m[2]) ? { date: m[1], via: m[2], fingerprint: m[3] } : null
  const signedError =
    signedRaw !== null && !signedOff
      ? `**Signed off:** "${signedRaw}" is not "YYYY-MM-DD · walkthrough|chat · <12 hex>"`
      : null

  // A spec without a Risk line counts as risky, as /spec says.
  const risk = RISK_LINE.exec(header)?.[1].trim() ?? 'missing'
  return { tier, tierError, signedOff, signedError, risk }
}

/** Whether /plan and /deliver may start on this spec, and if not, the one line that says why. */
export function checkSpec(text) {
  const { tier, tierError, signedOff, signedError, risk } = parseGate(text)
  if (tier === null) return { ok: true, reason: 'no review tier: built as before' }
  if (tierError ?? signedError) return { ok: false, reason: tierError ?? signedError }
  if (risk !== 'none' && tier !== 'heavy') {
    return { ok: false, reason: `**Risk:** ${risk} makes the change heavy, but **Review tier:** is ${tier}` }
  }
  if (!signedOff)
    return { ok: false, reason: `review tier ${tier} with no sign-off: show the spec walkthrough, then sign it` }
  if (signedOff.fingerprint !== fingerprint(text)) {
    return { ok: false, reason: 'requirements, criteria or decisions changed since the sign-off' }
  }
  return { ok: true, reason: `signed off ${signedOff.date} via ${signedOff.via}` }
}

function sign(text, via) {
  const now = new Date()
  const date = [now.getFullYear(), now.getMonth() + 1, now.getDate()].map((n) => String(n).padStart(2, '0')).join('-')
  const line = `**Signed off:** ${date} · ${via} · ${fingerprint(text)}`
  const [header, body] = splitHeader(text)
  const signed = SIGNED_LINE.test(header)
    ? header.replace(SIGNED_LINE, line)
    : header.replace(TIER_LINE, (tierLine) => `${tierLine}\n${line}`)
  return { text: signed + body, date }
}

function flag(argv, name) {
  const at = argv.indexOf(`--${name}`)
  return at === -1 ? undefined : argv[at + 1]
}

export function run(argv) {
  const [command, target] = argv
  if (!['check', 'sign'].includes(command) || !target) {
    say('usage: spec-gate.mjs check <spec dir | spec.md> | sign <spec dir | spec.md> --via walkthrough|chat')
    return 2
  }
  const file = existsSync(target) && statSync(target).isFile() ? target : join(target, 'spec.md')
  if (!existsSync(file)) {
    say(`spec-gate: no spec at ${file}`)
    return 2
  }
  const dir = file.replace(/[\\/]?spec\.md$/, '') || '.'
  const text = readFileSync(file, 'utf8')

  if (command === 'check') {
    const { ok, reason } = checkSpec(text)
    if (ok) {
      say(`spec-gate: ${reason}`)
      return 0
    }
    say(`spec-gate: refused — ${reason}. The way back: /spec --revise ${dir}`)
    return 1
  }

  const via = flag(argv, 'via')
  const { tier, tierError } = parseGate(text)
  const refusal =
    (tier === null && 'the spec has no **Review tier:** line, so there is nothing to sign') ||
    tierError ||
    (!VIAS.includes(via) && 'pass --via walkthrough|chat')
  if (refusal) {
    say(`spec-gate: refused — ${refusal}`)
    return 1
  }
  const signed = sign(text, via)
  writeFileSync(file, signed.text)
  say(`spec-gate: signed off ${signed.date} via ${via}`)
  return 0
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    process.exitCode = run(process.argv.slice(2))
  } catch (error) {
    say(error.message)
    process.exitCode = 2
  }
}
