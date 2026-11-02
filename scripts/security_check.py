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
        re.search(r"<(?:form|input|textarea|select)\b", html, re.IGNORECASE) is None,
        "The closed event page must not contain a form or registration fields.",
        failures,
    )
    require(
        re.search(r'<button\b[^>]*type="submit"', html, re.IGNORECASE) is None,
        "The closed event page must not contain a submit button.",
        failures,
    )
    require(
        re.search(r"<h[1-6]\b[^>]*>Registration closed</h[1-6]>", html) is not None,
        "A visible registration-closed heading is required.",
        failures,
    )
    for name in ("description", "og:description"):
        description = re.search(
            rf'<meta (?:name|property)="{name}" content="([^"]+)"', html
        )
        require(
            description is not None
            and "registration" in description.group(1).lower()
            and "closed" in description.group(1).lower(),
            f"The {name} metadata must state that registration is closed.",
            failures,
        )
    for integration in ("submit-form.com", "challenges.cloudflare.com", "registration-form"):
        require(
            integration not in html and integration not in javascript,
            f"The closed event page must not include the registration integration: {integration}",
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
            "connect-src 'none'",
            "form-action 'none'",
            "object-src 'none'",
            "script-src 'self'",
            "frame-src 'none'",
        ):
            require(directive in csp, f"CSP directive is missing: {directive}", failures)

    require(
        '<meta name="referrer" content="no-referrer">' in html,
        "The no-referrer policy is missing.",
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
