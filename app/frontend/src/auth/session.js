const TOKEN_KEY = 'token';
const EMAIL_KEY = 'email';

// "Remember me" keeps the session in localStorage (survives browser restarts);
// otherwise it lives in sessionStorage and ends when the tab is closed.
export function saveSession(token, email, remember) {
  clearSession();
  const store = remember ? window.localStorage : window.sessionStorage;
  store.setItem(TOKEN_KEY, token);
  store.setItem(EMAIL_KEY, email);
}

export function clearSession() {
  [window.localStorage, window.sessionStorage].forEach((store) => {
    store.removeItem(TOKEN_KEY);
    store.removeItem(EMAIL_KEY);
  });
}

// Email of the signed-in user, or '' when nobody is signed in.
export function getSessionEmail() {
  try {
    return (
      window.localStorage.getItem(EMAIL_KEY) || window.sessionStorage.getItem(EMAIL_KEY) || ''
    );
  } catch {
    return ''; // storage blocked by the browser
  }
}
