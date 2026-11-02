const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");
const year = document.querySelector("#current-year");

let lastFocusedElement = null;

year.textContent = new Date().getFullYear().toString();

// Discourage basic address harvesting while preserving a standard email link.
const contactEmail = document.querySelector("#contact-email");
if (contactEmail) {
  const address = atob("amFzbWlqbi5iZWVrbWFuQGFzY2FjYWRlbWljcy5jb20=");
  contactEmail.href = `mailto:${address}`;
  contactEmail.textContent = address;
}

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
