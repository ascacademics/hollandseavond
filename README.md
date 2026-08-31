# Hollandse Avond at ISPOR 2026

A small, static registration website for Asc Academics. The site is designed for GitHub Pages and has no build step or runtime dependencies.

## Update the event details

Edit the three event-detail values in `index.html`. The current values are:

- Date: `Monday 9 November`
- Time: `TBD`
- Location: `TBD`

## Configure Formspark

Create the form in Formspark, then replace the form action in `index.html`:

```html
<form id="registration-form" action="https://submit-form.com/FORM_ID" method="post" novalidate>
```

Use the complete Formspark endpoint. The JavaScript reads this action for AJAX submission, while the form uses the same action as a POST fallback so that registration details are not exposed in a URL if JavaScript is unavailable. Do not commit private credentials. Until a valid endpoint is configured, the site prevents AJAX submission.

The form includes Formspark's `_honeypot` field as a lightweight bot control. Keep Formspark's automatic spam filtering enabled. Turnstile is configured with its public site key and the `registration` action; AJAX submissions include the generated `cf-turnstile-response` token. Never add the Turnstile secret key to this repository.

See `SECURITY_CONFIGURATION.md` for the required Formspark, Turnstile, GitHub Pages, and repository-ruleset settings.

## Run locally

From the repository root:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000/`.

## GitHub Pages and custom domain

The repository must remain independent from `ascacademics.github.io` and every other Asc Academics repository.

Do not change the Pages custom-domain setting of `ascacademics.github.io`, and do not alter the existing `mta-sts.ascacademics.com` CNAME record. That hostname already depends on the existing Pages repository.

If Pages is not configured automatically, open the repository on GitHub and select:

1. **Settings**
2. **Pages**
3. **Deploy from a branch**
4. Branch: **main**
5. Folder: **/(root)**
6. Custom domain: **hollandseavond.ascacademics.com**
7. Enable **Enforce HTTPS** once the certificate is available

Wait until GitHub has accepted `hollandseavond.ascacademics.com` as the custom domain on this repository. Only then create the following separate DNS record with the Asc Academics DNS provider:

| Type | Host/name | Target |
| --- | --- | --- |
| CNAME | `hollandseavond` | `ascacademics.github.io` |

The `CNAME` file in this repository must continue to contain exactly `hollandseavond.ascacademics.com`.

## Privacy and tracking

The site stores no registration details in browser storage, sets no cookies, and includes no analytics or advertising trackers. Submitted values are sent only to the configured Formspark endpoint.

## Security headers

The document contains a restrictive Content Security Policy and a no-referrer policy. GitHub Pages does not provide repository-level configuration for response headers. The following host-level controls therefore remain unavailable while GitHub Pages is used:

- `Strict-Transport-Security: max-age=31536000; includeSubDomains` only after confirming that every affected subdomain supports HTTPS
- `X-Content-Type-Options: nosniff`
- `Content-Security-Policy` including `frame-ancestors 'none'`
- `Permissions-Policy: camera=(), geolocation=(), microphone=()`

This is an accepted hosting limitation for the event-registration page. Do not collect passwords, payment information, identity documents, health information, or other sensitive data through this site.
