# Hollandse Avond at ISPOR 2026

A small, static registration website for Asc Academics. The site is designed for GitHub Pages and has no build step or runtime dependencies.

## Update the event details

Edit the three event-detail values in `index.html`. The current values are:

- Date: `Monday 9 November`
- Time: `TBD`
- Location: `TBD`

## Configure Formspark

Create the form in Formspark, then replace this value at the top of `script.js`:

```js
const FORM_ENDPOINT = "REPLACE_WITH_FORMSPARK_ENDPOINT";
```

Use the complete Formspark endpoint, for example `https://submit-form.com/FORM_ID`. Do not commit private credentials. Until a valid endpoint is configured, the site prevents submission and displays a configuration message.

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
