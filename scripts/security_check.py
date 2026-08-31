from pathlib import Path
import re
import sys


ROOT = Path(__file__).resolve().parents[1]


def read(relative_path: str) -> str:
    return (ROOT / relative_path).read_text(encoding="utf-8")


def require(condition: bool, message: str, failures: list[str]) -> None:
    if not condition:
        failures.append(message)


def main() -> int:
    html = read("index.html")
    javascript = read("script.js")
    stylesheet = read("styles.css")
    failures: list[str] = []

    require(
        re.search(
            r'<form[^>]+action="https://submit-form\.com/[A-Za-z0-9_-]+"[^>]+method="post"',
            html,
        )
        is not None,
        "The registration form must have an HTTPS Formspark action and POST fallback.",
        failures,
    )
    require('name="_honeypot"' in html, "The Formspark honeypot field is missing.", failures)
    require(
        "_honeypot: form.elements._honeypot.value" in javascript,
        "The honeypot value is missing from the AJAX payload.",
        failures,
    )
    require(
        re.search(r"\.form-field--honeypot\s*\{[^}]*display:\s*none", stylesheet, re.DOTALL)
        is not None,
        "The honeypot field is not hidden.",
        failures,
    )

    csp_match = re.search(
        r'<meta http-equiv="Content-Security-Policy" content="([^"]+)"', html
    )
    require(csp_match is not None, "The Content Security Policy meta element is missing.", failures)
    if csp_match:
        csp = csp_match.group(1)
        for directive in (
            "default-src 'none'",
            "base-uri 'none'",
            "connect-src https://submit-form.com",
            "form-action https://submit-form.com",
            "object-src 'none'",
            "script-src 'self' https://challenges.cloudflare.com",
            "frame-src https://challenges.cloudflare.com",
        ):
            require(directive in csp, f"CSP directive is missing: {directive}", failures)

    require(
        '<meta name="referrer" content="no-referrer">' in html,
        "The no-referrer policy is missing.",
        failures,
    )
    require(
        "const FORM_ENDPOINT = form.action;" in javascript,
        "AJAX submission must use the form's configured endpoint.",
        failures,
    )
    require(
        re.search(r'const TURNSTILE_SITE_KEY = "0x[A-Za-z0-9_-]+";', javascript) is not None,
        "The Turnstile public site key is missing or invalid.",
        failures,
    )
    require(
        'action: "registration"' in javascript
        and 'payload["cf-turnstile-response"] = turnstileToken;' in javascript,
        "The Turnstile action or token submission support is missing.",
        failures,
    )
    require(
        read("CNAME").strip() == "hollandseavond.ascacademics.com",
        "CNAME must contain the approved GitHub Pages custom domain.",
        failures,
    )

    for relative_path, content in (
        ("index.html", html),
        ("script.js", javascript),
        ("styles.css", stylesheet),
    ):
        require("http://" not in content, f"Insecure URL found in {relative_path}.", failures)

    for dangerous_sink in (
        "innerHTML",
        "outerHTML",
        "insertAdjacentHTML",
        "document.write",
        "localStorage",
        "sessionStorage",
        "document.cookie",
        "eval(",
        "new Function",
    ):
        require(
            dangerous_sink not in javascript,
            f"Dangerous JavaScript sink found: {dangerous_sink}",
            failures,
        )

    if failures:
        for failure in failures:
            print(f"ERROR: {failure}", file=sys.stderr)
        return 1

    print("Security checks passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
