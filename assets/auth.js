(function () {
  const STORAGE_KEY = "__moby_app_auth";
  const OBFUSCATED_CODE = [120, 124, 122, 120, 126, 129];

  function decodeSecretCode() {
    return OBFUSCATED_CODE.map((value) => String.fromCharCode(value - 72)).join("");
  }

  function createAuthToken(secret) {
    return btoa(secret.split("").reverse().join(""));
  }

  function getStoredToken() {
    return localStorage.getItem(STORAGE_KEY);
  }

  function isAuthenticated() {
    return getStoredToken() === createAuthToken(decodeSecretCode());
  }

  function setAuthenticated() {
    localStorage.setItem(STORAGE_KEY, createAuthToken(decodeSecretCode()));
  }

  function clearAuthentication() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function loginWithCode(code) {
    if (code === decodeSecretCode()) {
      setAuthenticated();
      return true;
    }
    return false;
  }

  function requireAuthentication() {
    const pathname = window.location.pathname.replace(/\\/g, "/");
    const allowedPages = ["/id.html", "/", "/index.html", "/index.1.html"];

    if (allowedPages.some((page) => pathname.endsWith(page))) {
      return;
    }

    if (!isAuthenticated()) {
      clearAuthentication();
      const redirect = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = "id.html?redirect=" + redirect;
    }
  }

  window.MobyAuth = {
    loginWithCode,
    isAuthenticated,
    clearAuthentication,
    getSecretCode: decodeSecretCode,
  };

  requireAuthentication();
})();
