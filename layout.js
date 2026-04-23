const sitePages = {
  home: {
    nav: "book",
    title: "Book a taxi"
  },
  contact: {
    nav: "contact",
    title: "Contact us"
  },
  login: {
    nav: "login",
    title: "Log in"
  },
  signup: {
    nav: "signup",
    title: "Sign up"
  }
};

function getPageConfig() {
  const pageKey = document.body.dataset.page || "home";
  return sitePages[pageKey] || sitePages.home;
}

function navLink(label, href, isActive) {
  return `<a class="${isActive ? "is-active" : ""}" href="${href}">${label}</a>`;
}

function renderHeader() {
  const headerRoot = document.getElementById("site-header-root");
  if (!headerRoot) {
    return;
  }

  const page = getPageConfig();

  headerRoot.innerHTML = `
    <header class="site-header">
      <div class="site-header-inner">
        <a class="header-brand" href="index.html" aria-label="RouteWave home">
          <img class="header-logo" src="assets/dummy-logo.svg" alt="RouteWave logo">
          <span class="sr-only">RouteWave home</span>
        </a>

        <nav class="header-nav" aria-label="Primary navigation">
          ${navLink("Book a taxi", "index.html", page.nav === "book")}
          ${navLink("Contact us", "contact-us.html", page.nav === "contact")}
        </nav>

        <div class="header-auth">
          <a class="header-login ${page.nav === "login" ? "is-active" : ""}" href="login.html">Log in</a>
          <a class="header-signup ${page.nav === "signup" ? "is-active" : ""}" href="signup.html">Sign up</a>
        </div>
      </div>
    </header>
  `;
}

function renderFooter() {
  const footerRoot = document.getElementById("site-footer-root");
  if (!footerRoot) {
    return;
  }

  footerRoot.innerHTML = `
    <footer class="site-footer">
      <div class="site-footer-inner">
        <div class="footer-brand-block">
          <a class="footer-brand" href="index.html" aria-label="RouteWave home">
            <img class="header-logo footer-logo" src="assets/dummy-logo.svg" alt="RouteWave logo">
            <span class="footer-brand-copy">
              <strong>RouteWave</strong>
              <span>Modern taxi booking interface concept with a premium city-travel feel.</span>
            </span>
          </a>
        </div>

        <div class="footer-links">
          <div class="footer-column">
            <span class="footer-title">Booking</span>
            <a href="index.html">Book a taxi</a>
            <a href="signup.html">Create account</a>
          </div>

          <div class="footer-column">
            <span class="footer-title">Explore</span>
            <a href="index.html#download">App download</a>
            <a href="index.html#partners">Become a driver</a>
            <a href="contact-us.html">Business enquiries</a>
          </div>

          <div class="footer-column">
            <span class="footer-title">Support</span>
            <a href="contact-us.html">Contact us</a>
            <a href="login.html">Log in</a>
            <a href="index.html#partners">Current offers</a>
          </div>
        </div>
      </div>

      <div class="site-footer-bottom">
        <p>City journeys feel better when the booking experience stays simple, calm, and easy to trust.</p>
      </div>
    </footer>
  `;
}

renderHeader();
renderFooter();
