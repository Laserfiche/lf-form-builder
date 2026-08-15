#!/usr/bin/env node
/**
 * Fails the build when a gateway credential is about to be committed.
 *
 * Two passes:
 *   1. Exported Laserfiche Process assets (`.bri`). These are JSON exports of a
 *      configured web service — the export includes whatever the author typed
 *      into the request payload template and the connection's username, so a
 *      live API login and transaction key ride along invisibly.
 *   2. Every other tracked text file, for the well-known secret-key prefixes
 *      that are unambiguous when they appear in source.
 *
 * Publishable/client keys (Stripe `pk_`, Authorize.net client key, Braintree
 * tokenization key) are deliberately not flagged: they are public by design and
 * belong in the built bundle.
 *
 * Usage:
 *   node scripts/check-committed-secrets.mjs             # scan tracked files
 *   node scripts/check-committed-secrets.mjs <paths...>  # scan specific files
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import { extname } from 'node:path';

/** Values a scrubbed sample is expected to carry. Never a finding. */
const PLACEHOLDER = /^(REPLACE_ME|your_|<|\$\{|%\()/i;

/** Unambiguous secret-key shapes, safe to match anywhere in the tree. */
const SECRET_PATTERNS = [
  { label: 'Stripe secret key', re: /\bsk_(?:live|test)_[A-Za-z0-9]{16,}/ },
  { label: 'Stripe restricted key', re: /\brk_(?:live|test)_[A-Za-z0-9]{16,}/ },
  { label: 'Braintree private key', re: /\bbraintree[_-]?private[_-]?key\s*[:=]\s*["']?[a-f0-9]{32}/i },
  { label: 'Google API key', re: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { label: 'AWS access key id', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { label: 'Private key block', re: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
];

const SKIP_DIRS = /(^|\/)(node_modules|dist|lib|\.git|coverage)(\/|$)/;
const BINARY_EXT = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.webp', '.pdf', '.zip', '.woff', '.woff2', '.ttf',
]);

const findings = [];

const report = (file, detail) => findings.push({ file, detail });

const isPlaceholder = (value) => typeof value !== 'string' || value === '' || PLACEHOLDER.test(value);

/** Walks a parsed .bri looking for credentials the export carried along. */
const scanBri = (file, text) => {
  let doc;
  try {
    doc = JSON.parse(text);
  } catch {
    report(file, 'not valid JSON — cannot verify it carries no credentials');
    return;
  }

  for (const group of doc.BusinessRules ?? []) {
    for (const rule of group.RuleList ?? []) {
      const payload = rule.Template?.Payload;
      if (typeof payload !== 'string') continue;

      // Authorize.net's /xml/v1/request.api authenticates in the request body,
      // so the payload template is exactly where a live key ends up.
      for (const [, field, value] of payload.matchAll(
        /"(name|transactionKey|clientKey|signatureKey)"\s*:\s*"([^"]*)"/g,
      )) {
        if (!isPlaceholder(value)) {
          report(file, `rule "${rule.Name ?? '(unnamed)'}" payload contains a literal ${field}`);
        }
      }

      for (const pattern of SECRET_PATTERNS) {
        if (pattern.re.test(payload)) {
          report(file, `rule "${rule.Name ?? '(unnamed)'}" payload contains a ${pattern.label}`);
        }
      }
    }
  }

  for (const service of doc.LinkedObjects?.WebService ?? []) {
    const username = service.ConnectionInfo?.Username;
    if (!isPlaceholder(username)) {
      report(file, `web service "${service.Name ?? '(unnamed)'}" has a literal ConnectionInfo.Username`);
    }
    for (const header of Object.values(service.ConnectionInfo?.DefaultHeaders ?? {})) {
      if (header?.IsSecure && !isPlaceholder(header.Value)) {
        report(file, `web service "${service.Name ?? '(unnamed)'}" has a literal secure header "${header.Name}"`);
      }
    }
  }
};

const scanText = (file, text) => {
  for (const pattern of SECRET_PATTERNS) {
    const match = pattern.re.exec(text);
    if (match) report(file, `${pattern.label} (${match[0].slice(0, 12)}…)`);
  }
};

const listTrackedFiles = () =>
  execFileSync('git', ['ls-files'], { encoding: 'utf8' })
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

const files = (process.argv.slice(2).length ? process.argv.slice(2) : listTrackedFiles()).filter(
  (file) => !SKIP_DIRS.test(file) && !BINARY_EXT.has(extname(file).toLowerCase()),
);

for (const file of files) {
  let text;
  try {
    if (statSync(file).size > 2_000_000) continue;
    text = readFileSync(file, 'utf8');
  } catch {
    continue; // deleted, unreadable, or not a regular file
  }

  if (extname(file).toLowerCase() === '.bri') scanBri(file, text);
  else scanText(file, text);
}

if (findings.length) {
  console.error('Committed secrets detected:\n');
  for (const { file, detail } of findings) console.error(`  ${file}: ${detail}`);
  console.error(
    '\nRotate the exposed credential, then replace the value with a REPLACE_ME_* placeholder.',
  );
  console.error('Merchant secrets belong in the web service connection credential store, never in a committed file.');
  process.exit(1);
}

console.log(`No committed secrets found (${files.length} files scanned).`);
