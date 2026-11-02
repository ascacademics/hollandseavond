# Hollandse Avond at ISPOR Europe 2026

A small, static event website for Asc Academics. The site is designed for GitHub Pages and has no build step or runtime dependencies.

## Update the event details

Edit the three event-detail values in `index.html`. The current values are:

- Date: `Monday 9 November`
- Time: `19:00`
- Location: `Luftburg Kolarik in Prater, Prater 128, 1020 Wien, Austria`

## Registration status

Registration closed on 2 November 2026. The page displays a closure notice and retains the event details for registered guests. The registration form, submission code, and Turnstile widget have been removed; the Content Security Policy blocks form submissions, connections, and frames.

The repository does not manage the external Formspark account or its previously collected registrations. See `SECURITY_CONFIGURATION.md` for hosting controls and the historical registration configuration.

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

The site no longer collects or submits registration details. It stores no registration details in browser storage, sets no cookies, and includes no analytics or advertising trackers.

## Security headers

The document contains a restrictive Content Security Policy and a no-referrer policy. GitHub Pages does not provide repository-level configuration for response headers. The following host-level controls therefore remain unavailable while GitHub Pages is used:

- `Strict-Transport-Security: max-age=31536000; includeSubDomains` only after confirming that every affected subdomain supports HTTPS
- `X-Content-Type-Options: nosniff`
- `Content-Security-Policy` including `frame-ancestors 'none'`
- `Permissions-Policy: camera=(), geolocation=(), microphone=()`

This is an accepted hosting limitation for the event-registration page. Do not collect passwords, payment information, identity documents, health information, or other sensitive data through this site.
