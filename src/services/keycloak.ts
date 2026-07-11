import Keycloak from 'keycloak-js';

// CHUYỂN THÀNH false ĐỂ KẾT NỐI KEYCLOAK THẬT
// (Yêu cầu chạy Keycloak Docker trước: cd infra/keycloak; docker compose up -d)
const USE_MOCK = false;

const mockKeycloak = {
  authenticated: true,
  login: () => { },
  logout: () => alert('Đăng xuất (Chế độ giả lập)'),
  subject: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // UUID bác sĩ
  token: 'mock-token',
  tokenParsed: {
    name: 'Dr. Nguyen Van A',
    email: 'dr.nva@clinic.com'
  },
  hasRealmRole: (_role: string) => true,
  updateToken: (minValidity?: number) => Promise.resolve(true)
};

let keycloakInstance: any = null;
let isInitialized = USE_MOCK;
let initializationPromise: Promise<boolean> | null = null;

if (!USE_MOCK) {
  keycloakInstance = new Keycloak({
    url: 'http://localhost:9080',
    realm: 'clinic-appointment',
    clientId: 'clinic-web'
  });
}

export const initKeycloak = (onAuthenticatedCallback: () => void) => {
  if (USE_MOCK) {
    isInitialized = true;
    onAuthenticatedCallback();
    return;
  }

  if (!initializationPromise) {
    initializationPromise = keycloakInstance.init({
      onLoad: 'login-required',
      checkLoginIframe: false,
    }).then((authenticated: boolean) => {
      isInitialized = true;
      if (authenticated) {
        onAuthenticatedCallback();
      } else {
        keycloakInstance.login();
      }
      return authenticated;
    }).catch((err: any) => {
      console.error('Lỗi khởi tạo Keycloak:', err);
      throw err;
    });
  } else {
    initializationPromise.then((authenticated: boolean) => {
      if (authenticated) {
        onAuthenticatedCallback();
      }
    }).catch((err: any) => {
      console.error('Lỗi khởi tạo Keycloak:', err);
    });
  }
};

export const waitForKeycloakReady = async () => {
  if (USE_MOCK) {
    return true;
  }
  if (initializationPromise) {
    return initializationPromise;
  }
  return false;
};

export const isKeycloakInitialized = () => isInitialized;

export const isAuthenticated = () => Boolean((USE_MOCK ? mockKeycloak : keycloakInstance)?.authenticated);

export const doLogin = () => {
  if (USE_MOCK) return;
  keycloakInstance.login();
};

export const doLogout = () => {
  if (USE_MOCK) {
    alert('Đăng xuất (Chế độ giả lập)');
    return;
  }
  keycloakInstance.logout({ redirectUri: window.location.origin });
};

export const getToken = () => {
  if (USE_MOCK) return 'mock-token';
  if (!isInitialized) return '';
  return keycloakInstance.token || '';
};

export const getRoles = () => {
  if (USE_MOCK) {
    // Trả về 'user' để hiển thị PatientPortal, hoặc 'DOCTOR' để hiển thị Dashboard bác sĩ
    return ['user'];
  }
  const rawRoles = keycloakInstance.realmAccess?.roles || [];
  return rawRoles.map((r: string) => {
    const upper = r.toUpperCase();
    if (upper === 'PATIENT') return 'user';
    return upper.toLowerCase();
  });
};

export const hasRole = (role: string) => {
  if (USE_MOCK) return true;
  const roles = getRoles();
  return roles.includes(role.toLowerCase());
};

export const getUserInfo = () => {
  if (USE_MOCK) {
    return {
      id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // UUID bác sĩ
      email: 'dr.nva@clinic.com',
      name: 'Dr. Nguyen Van A',
    };
  }
  if (!isInitialized) {
    return {
      id: '',
      email: '',
      name: '',
    };
  }
  return {
    id: keycloakInstance.subject || '',
    email: keycloakInstance.tokenParsed?.email || '',
    name: keycloakInstance.tokenParsed?.name || '',
  };
};

export default USE_MOCK ? mockKeycloak : keycloakInstance;
