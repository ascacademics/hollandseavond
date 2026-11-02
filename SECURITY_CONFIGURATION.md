# Security configuration

The controls in this document require account or dashboard access and cannot be enforced by repository files alone.

## GitHub Pages

In **Repository settings → Pages**:

- keep the source set to `main` and `/(root)`;
- keep the custom domain set to `hollandseavond.ascacademics.com`;
- enable **Enforce HTTPS**; and
- do not change the Pages or DNS configuration of other Asc Academics sites.

GitHub Pages does not support repository-configured response headers. The meta Content Security Policy and no-referrer policy in `index.html` are therefore the available repository-level controls. Do not use this site to collect passwords, payment information, identity documents, health information, or other sensitive data.

## Historical registration configuration

Registration closed on 2 November 2026. The website no longer includes a registration form, submission code, or Turnstile widget. Its Content Security Policy blocks form submissions, connections, and frames. The external Formspark account and previously collected registrations are managed separately; this website change does not deactivate the external endpoint or delete existing data.

The Formspark and Turnstile notes below describe the pre-closure configuration. They are retained for reference and do not instruct a new registration launch.

### Formspark

In the form's **Settings → Spam protection**:

- keep **Automatic filter** on;
- leave custom spam words empty until observed spam supports specific terms; and
- keep the challenge disabled until the Turnstile frontend has been deployed and checked on the live hostname.

The standard `_honeypot` field was present in the HTML and AJAX payload. Confirm or remove any unconfirmed notification recipients before any future launch.

### Turnstile

The former frontend used Turnstile site key `0x4AAAAAAEjKUsDVsmkEpE3R` and action `registration`.

1. In Cloudflare, confirm that the existing widget is **Managed** and permits `hollandseavond.ascacademics.com`.
2. Deploy and verify that the widget loads on `https://hollandseavond.ascacademics.com/`.
3. Copy the widget secret directly from Cloudflare into Formspark's **Turnstile** spam-protection setup. Do not put it in chat, a command, a local file, or this repository.
4. Enable the Formspark Turnstile challenge only after the secret has been stored.
5. Make one genuine test registration and confirm that it arrives.
6. Attempt a second submission with an expired or missing widget response and confirm that Formspark rejects it.

The former Content Security Policy permitted the Cloudflare origins required for the widget. Formspark performed the server-side Siteverify call; GitHub Pages must never receive or expose the secret.

## Protect `main`

After the `Security checks` workflow has run successfully on GitHub:

1. Open **Repository settings → Rules → Rulesets**.
2. Create a new branch ruleset named `Protect main`.
3. Set enforcement to **Active** and target the default branch.
4. Enable **Restrict deletions**, **Block force pushes**, **Require a pull request before merging**, and **Require conversation resolution before merging**.
5. Require one approving review when an independent reviewer is available; otherwise start with zero approvals while still requiring a pull request.
6. Require the `Repository security check` status check.
7. Do not enable **Restrict updates** or required signed commits until the corresponding workflow has been tested.
8. Keep an administrator bypass available only for recovery.

Future changes should be made on a short-lived branch and merged through a pull request after the required check passes.
