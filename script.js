const FORM_ENDPOINT = "REPLACE_WITH_FORMSPARK_ENDPOINT";

const form = document.querySelector("#registration-form");
const submitButton = form.querySelector('button[type="submit"]');
const statusRegion = document.querySelector("#form-status");
const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");
const year = document.querySelector("#current-year");
const endpointIsConfigured = /^https:\/\/submit-form\.com\/[A-Za-z0-9_-]+\/?$/.test(FORM_ENDPOINT);

let isSubmitting = false;
let lastFocusedElement = null;

year.textContent = new Date().getFullYear().toString();

const fields = [
  { input: form.elements.name, message: "Enter your name." },
  { input: form.elements.company, message: "Enter your company." },
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

  isSubmitting = true;
  submitButton.disabled = true;
  submitButton.firstChild.textContent = "Registering… ";
  statusRegion.classList.remove("is-success");
  statusRegion.textContent = "";

  const payload = {
    name: form.elements.name.value.trim(),
    company: form.elements.company.value.trim(),
    email: form.elements.email.value.trim()
  };

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
  if (event.target.closest("a") && window.matchMedia("(max-width: 920px)").matches) {
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

window.matchMedia("(min-width: 921px)").addEventListener("change", (event) => {
  if (event.matches) {
    closeMenu({ restoreFocus: false });
  }
});
