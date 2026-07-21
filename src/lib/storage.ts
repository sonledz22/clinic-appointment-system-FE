const ACCESS_TOKEN_KEY = 'clinic.auth.accessToken';
const REFRESH_TOKEN_KEY = 'clinic.auth.refreshToken';

interface AuthTokens {
  accessToken?: string | null;
  refreshToken?: string | null;
}

const getStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
};

export const getAccessToken = () => getStorage()?.getItem(ACCESS_TOKEN_KEY) ?? null;

export const getRefreshToken = () => getStorage()?.getItem(REFRESH_TOKEN_KEY) ?? null;

export const setAuthTokens = ({ accessToken, refreshToken }: AuthTokens) => {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  if (accessToken) {
    storage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }

  if (refreshToken) {
    storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const clearAuthTokens = () => {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(ACCESS_TOKEN_KEY);
  storage.removeItem(REFRESH_TOKEN_KEY);
};

export const hasStoredAuthTokens = () => Boolean(getAccessToken() || getRefreshToken());