const TOKEN_KEY = 'authToken';

// Guarda el token. Si persist es true, usa localStorage; si es false, usa sessionStorage.
export const setToken = (token, persist = false) => {
  if (persist) {
    localStorage.setItem(TOKEN_KEY, token);
    sessionStorage.removeItem(TOKEN_KEY);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(TOKEN_KEY);
  }
};

// Obtiene el token, buscando primero en sessionStorage y luego en localStorage.
export const getToken = () => {
  return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
};

// Elimina el token de ambos almacenamientos.
export const removeToken = () => {
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
};

const VALIDATION_TOKEN_KEY = 'validationToken';

export const setValidationToken = (token) => {
  localStorage.setItem(VALIDATION_TOKEN_KEY, token);
};

export const getValidationToken = () => {
  localStorage.getItem(VALIDATION_TOKEN_KEY);
};

export const removeValidationToken = () => {
  localStorage.removeItem(VALIDATION_TOKEN_KEY);
};