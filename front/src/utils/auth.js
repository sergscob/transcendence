const ACCESS_TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";

export const getToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const setToken = (token) => localStorage.setItem(ACCESS_TOKEN_KEY, token);
export const setRefreshToken = (refreshToken) => localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

export const setTokens = ({ access, refresh }) => {
	if (access) setToken(access);
	if (refresh) setRefreshToken(refresh);
};

export const clearTokens = () => {
	localStorage.removeItem(ACCESS_TOKEN_KEY);
	localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const logout = clearTokens;