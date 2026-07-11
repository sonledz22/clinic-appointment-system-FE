import axios from 'axios';
import keycloak, { getToken, isAuthenticated, waitForKeycloakReady } from '@/services/keycloak';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const axiosClient = axios.create({
	baseURL: API_BASE,
	headers: { 'Content-Type': 'application/json' },
});

axiosClient.interceptors.request.use(
	async (config) => {
		await waitForKeycloakReady();

		try {
			if (isAuthenticated() && keycloak && typeof keycloak.updateToken === 'function') {
				// Refresh token if it expires in less than 30 seconds
				await keycloak.updateToken(30);
			}
		} catch (error) {
			console.error('Failed to update Keycloak token:', error);
		}

		const token = getToken();
		if (token) {
			config.headers = config.headers ?? {};
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error)
);

export default axiosClient;
