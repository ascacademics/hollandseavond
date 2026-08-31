const form = document.querySelector("#registration-form");
const FORM_ENDPOINT = form.action;
const TURNSTILE_SITE_KEY = "0x4AAAAAAEjKUsDVsmkEpE3R";
const TURNSTILE_SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const submitButton = form.querySelector('button[type="submit"]');
const statusRegion = document.querySelector("#form-status");
const turnstileContainer = document.querySelector("#turnstile-container");
const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");
const year = document.querySelector("#current-year");
const endpointIsConfigured = /^https:\/\/submit-form\.com\/[A-Za-z0-9_-]+\/?$/.test(FORM_ENDPOINT);
const turnstileIsConfigured = TURNSTILE_SITE_KEY.trim() !== "";

let isSubmitting = false;
let lastFocusedElement = null;
let turnstileToken = "";
let turnstileWidgetId = null;

year.textContent = new Date().getFullYear().toString();

const fields = [
  { input: form.elements.name, message: "Enter your full name." },
  { input: form.elements.company, message: "Enter your company or organisation." },
  { input: form.elements.email, message: "Enter a valid email address." }
];

function setFieldValidity(input, message = "") {
  const error = document.querySelector(`#${input.id}-error`);
  input.setAttribute("aria-invalid", message ? "true" : "false");
  input.setAttribute("aria-describedby", error.id);
  error.textContent = message;
}

function validateForm() {
  let firstInvalidField = null;

  fields.forEach(({ input, message }) => {
    const fieldMessage = input.validity.valid ? "" : message;
    setFieldValidity(input, fieldMessage);
    if (fieldMessage && !firstInvalidField) {
      firstInvalidField = input;
    }
  });

  if (firstInvalidField) {
    firstInvalidField.focus();
    return false;
  }

  return true;
}

fields.forEach(({ input, message }) => {
  input.addEventListener("blur", () => {
    setFieldValidity(input, input.validity.valid ? "" : message);
  });

  input.addEventListener("input", () => {
    if (input.getAttribute("aria-invalid") === "true" && input.validity.valid) {
      setFieldValidity(input);
    }
  });
});

function initialiseTurnstile() {
  if (!turnstileIsConfigured) {
    return;
  }

  turnstileContainer.hidden = false;

  const script = document.createElement("script");
  script.src = TURNSTILE_SCRIPT_URL;
  script.async = true;
  script.defer = true;

  script.addEventListener("load", () => {
    if (!window.turnstile) {
      statusRegion.textContent = "We could not load the bot protection check. Please try again.";
      return;
    }

    turnstileWidgetId = window.turnstile.render(turnstileContainer, {
      sitekey: TURNSTILE_SITE_KEY,
      action: "registration",
      theme: "light",
      size: "flexible",
      callback: (token) => {
        turnstileToken = token;
        statusRegion.textContent = "";
      },
      "expired-callback": () => {
        turnstileToken = "";
      },
      "error-callback": () => {
        turnstileToken = "";
        statusRegion.textContent = "We could not load the bot protection check. Please try again.";
      }
    });
  });

  script.addEventListener("error", () => {
    statusRegion.textContent = "We could not load the bot protection check. Please try again.";
  });

  document.head.append(script);
}

initialiseTurnstile();

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (isSubmitting || !validateForm()) {
    return;
  }

  if (!endpointIsConfigured) {
    statusRegion.classList.remove("is-success");
    statusRegion.textContent = "Registration is not yet configured. Please add the Formspark endpoint before accepting registrations.";
    return;
  }

  if (turnstileIsConfigured && !turnstileToken) {
    statusRegion.classList.remove("is-success");
    statusRegion.textContent = "Please complete the bot protection check.";
    return;
  }

  isSubmitting = true;
  submitButton.disabled = true;
  submitButton.firstChild.textContent = "Registering… ";
  statusRegion.classList.remove("is-success");
  statusRegion.textContent = "";

  const payload = {
    name: form.elements.name.value.trim(),
    company: form.elements.company.value.trim(),
    email: form.elements.email.value.trim(),
    _honeypot: form.elements._honeypot.value
  };

  if (turnstileIsConfigured) {
    payload["cf-turnstile-response"] = turnstileToken;
  }

  try {
    const response = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error("Registration request failed");
    }

    form.hidden = true;
    statusRegion.classList.add("is-success");
    statusRegion.textContent = "Thank you. Your registration has been received.";
    statusRegion.setAttribute("tabindex", "-1");
    statusRegion.focus();
  } catch {
    statusRegion.textContent = "We could not submit your registration. Please try again.";
    submitButton.disabled = false;
    submitButton.firstChild.textContent = "Register ";
    isSubmitting = false;

    if (turnstileIsConfigured && turnstileWidgetId !== null) {
      turnstileToken = "";
      window.turnstile.reset(turnstileWidgetId);
    }
  }
});

function closeMenu({ restoreFocus = true } = {}) {
  navigation.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open menu");
  document.body.classList.remove("menu-open");

  if (restoreFocus && lastFocusedElement) {
    lastFocusedElement.focus();
  }
}

function openMenu() {
  lastFocusedElement = document.activeElement;
  navigation.classList.add("is-open");
  menuToggle.setAttribute("aria-expanded", "true");
  menuToggle.setAttribute("aria-label", "Close menu");
  document.body.classList.add("menu-open");
  navigation.querySelector("a").focus();
}

menuToggle.addEventListener("click", () => {
  if (menuToggle.getAttribute("aria-expanded") === "true") {
    closeMenu();
  } else {
    openMenu();
  }
});

navigation.addEventListener("click", (event) => {
  if (event.target.closest("a") && window.matchMedia("(max-width: 1023px)").matches) {
    closeMenu({ restoreFocus: false });
  }
});

document.addEventListener("keydown", (event) => {
  if (menuToggle.getAttribute("aria-expanded") !== "true") {
    return;
  }

  if (event.key === "Escape") {
    closeMenu();
    return;
  }

  if (event.key === "Tab") {
    const focusable = [menuToggle, ...navigation.querySelectorAll("a")];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});

window.matchMedia("(min-width: 1024px)").addEventListener("change", (event) => {
  if (event.matches) {
    closeMenu({ restoreFocus: false });
  }
});
