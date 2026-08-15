# Security Policy

## Reporting a Vulnerability

Report suspected vulnerabilities privately. **Do not open a public GitHub issue** for a security
report, and do not include a working exploit, live credentials, or cardholder data in the report.

- Preferred: [GitHub private vulnerability reporting](https://github.com/Laserfiche/lf-form-builder/security/advisories/new)
- Alternative: `security@laserfiche.com`

Please include the affected file or package, the version or commit, what an attacker gains, and the
minimum steps to observe the issue. We aim to acknowledge within three business days.

## Scope

This repository contains reference and example code for building custom Laserfiche Forms. It is not
an officially supported product, and its examples are not a certified payment application. Reports
about the code here are still welcome and are triaged on their merits.

Vulnerabilities in Laserfiche Cloud, Laserfiche Forms, or Laserfiche Process itself should go through
Laserfiche Support rather than this repository.

## Payment samples

The `Empower2026` example includes three payment-gateway integrations. Before adapting any of them,
read the PCI DSS section in
[docs/recipes/payment-gateways.md](docs/recipes/payment-gateways.md#pci-dss-scope-and-your-saq).
Two properties matter most and are easy to break by accident:

- **No script may be loaded into the payment page from a caller-supplied URL.** Gateway SDK URLs are
  fixed module constants validated against an origin allowlist
  (`packages/core/src/lib/utils/loadGatewayScript.ts`). The sandbox page is configured from its URL
  hash fragment, which an attacker controls in a crafted link; nothing from that fragment may reach a
  `<script src>`, an `eval`, or an `innerHTML` sink.
- **No merchant secret may be committed.** See the secrets section in
  [CONTRIBUTING.md](CONTRIBUTING.md#secrets-and-exported-process-assets). `npm run check:secrets`
  enforces this in CI.

## Credential exposure

If you find a live credential in this repository or its history, report it privately using the
channels above. Treat it as exposed and rotate it — history rewriting alone is not remediation,
because clones and forks retain the original objects.
