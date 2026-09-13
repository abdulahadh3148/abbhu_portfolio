"use strict";

/*
 * PERSONAL LINK CONFIGURATION
 * Add full https:// URLs between the quotation marks.
 * Empty or invalid values keep the corresponding links hidden.
 */
const LINKS = {
  github: "https://github.com/abdulahadh3148",
  linkedin: "",     // TODO: Your LinkedIn profile URL
  drivingRepo: "https://github.com/abdulahadh3148/Eranga-Driving-School-Management-Platform",
  mosqueRepo: "https://github.com/abdulahadh3148/Jamiul-Azhar-Mosque",
  salonRepo: "https://github.com/abdulahadh3148/Sparkle-Salon"
};

/* Configure real external links. */

document.querySelectorAll("[data-link]").forEach((link) => {
  const value = LINKS[link.dataset.link]?.trim();

  if (!value) return;

  try {
    const url = new URL(value);

    if (url.protocol !== "https:" && url.protocol !== "http:") return;

    link.href = url.href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.hidden = false;
  } catch {
    // Invalid configuration stays hidden.
  }
});

/* Copyright year */

document.getElementById("year").textContent = new Date().getFullYear();

/* Mobile navigation */

const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.getElementById("main-nav");
const navigationLinks = [...navigation.querySelectorAll('a[href^="#"]')];
const mobileQuery = window.matchMedia("(max-width: 800px)");

function closeMenu(returnFocus = false) {
  navigation.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation menu");

  if (returnFocus) menuButton.focus();
}

function syncNavigation() {
  const menuHadFocus = document.activeElement === menuButton;

  closeMenu();
  menuButton.hidden = !mobileQuery.matches;

  if (!mobileQuery.matches && menuHadFocus) {
    navigationLinks[0].focus();
  }
}

document.documentElement.classList.add("nav-enhanced");
syncNavigation();

menuButton.addEventListener("click", () => {
  const willOpen = menuButton.getAttribute("aria-expanded") !== "true";

  navigation.classList.toggle("is-open", willOpen);
  menuButton.setAttribute("aria-expanded", String(willOpen));
  menuButton.setAttribute(
    "aria-label",
    willOpen ? "Close navigation menu" : "Open navigation menu"
  );
});

navigationLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (!mobileQuery.matches) return;

    closeMenu();

    // Move keyboard focus out of the navigation before it is hidden.
    const section = document.querySelector(link.getAttribute("href"));

    if (section) {
      section.setAttribute("tabindex", "-1");
      section.focus({ preventScroll: true });
      section.addEventListener(
        "blur",
        () => section.removeAttribute("tabindex"),
        { once: true }
      );
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    menuButton.getAttribute("aria-expanded") === "true"
  ) {
    closeMenu(true);
  }
});

document.addEventListener("click", (event) => {
  if (
    menuButton.getAttribute("aria-expanded") === "true" &&
    !header.contains(event.target)
  ) {
    closeMenu(navigation.contains(document.activeElement));
  }
});

header.addEventListener("focusout", () => {
  window.setTimeout(() => {
    if (!header.contains(document.activeElement)) closeMenu();
  }, 0);
});

mobileQuery.addEventListener("change", syncNavigation);

/* Highlight the current section, including when scrolling upward. */

const sections = [...document.querySelectorAll("main section[id]")];
let scrollQueued = false;

function updateActiveNavigation() {
  const activationLine = header.offsetHeight + 100;
  let currentId = sections[0].id;

  for (const section of sections) {
    if (section.getBoundingClientRect().top <= activationLine) {
      currentId = section.id;
    }
  }

  const atPageBottom =
    window.scrollY + window.innerHeight >=
    document.documentElement.scrollHeight - 4;

  if (atPageBottom) currentId = sections[sections.length - 1].id;

  navigationLinks.forEach((link) => {
    if (link.getAttribute("href") === `#${currentId}`) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  scrollQueued = false;
}

function queueNavigationUpdate() {
  if (scrollQueued) return;

  scrollQueued = true;
  window.requestAnimationFrame(updateActiveNavigation);
}

window.addEventListener("scroll", queueNavigationUpdate, { passive: true });
window.addEventListener("resize", queueNavigationUpdate);
window.addEventListener("load", updateActiveNavigation);
updateActiveNavigation();

/* Scroll reveal: progressive enhancement, with reduced-motion support. */

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const revealElements = [...document.querySelectorAll(".reveal")];
let revealObserver;

function showAllContent() {
  revealObserver?.disconnect();
  revealElements.forEach((element) => {
    element.classList.remove("is-pending");
  });
}

if ("IntersectionObserver" in window && !reducedMotion.matches) {
  revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.remove("is-pending");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0, rootMargin: "0px 0px -24px 0px" }
  );

  revealElements.forEach((element) => {
    // Leave content already on screen visible on initial load.
    if (element.getBoundingClientRect().top >= window.innerHeight) {
      element.classList.add("is-pending");
      revealObserver.observe(element);
    }
  });
}

reducedMotion.addEventListener("change", (event) => {
  if (event.matches) showAllContent();
});

/* Copy email: announce success only after a successful clipboard write. */

const copyButton = document.getElementById("copy-email");
const copyStatus = document.getElementById("copy-status");
const emailLink = document.getElementById("email-address");
const email = emailLink.textContent.trim();

copyButton.hidden = false;

function selectEmailForManualCopy() {
  const selection = window.getSelection();

  if (!selection) return;

  const range = document.createRange();
  range.selectNodeContents(emailLink);
  selection.removeAllRanges();
  selection.addRange(range);
}

copyButton.addEventListener("click", async () => {
  copyButton.disabled = true;
  copyStatus.textContent = "";

  try {
    if (!window.isSecureContext || !navigator.clipboard?.writeText) {
      throw new Error("Clipboard is unavailable.");
    }

    await navigator.clipboard.writeText(email);
    copyStatus.textContent = "Email address copied.";
  } catch {
    selectEmailForManualCopy();
    copyStatus.textContent =
      `Automatic copying is unavailable. Copy ${email} manually: ` +
      "press Ctrl+C / Command+C, or touch and hold the email address.";
  } finally {
    copyButton.disabled = false;
  }
});
