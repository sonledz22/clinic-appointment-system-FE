// ĐÃ MOCK: Tạm thời giả lập Keycloak để hiển thị giao diện không cần chạy Docker
const keycloak = {
  authenticated: true,
  login: () => {},
  logout: () => alert('Đăng xuất (Giao diện thử nghiệm)'),
  subject: 'mock-user-id-123',
  token: 'mock-token',
  tokenParsed: {
    name: 'Người dùng thử nghiệm',
    email: 'test@example.com'
  },
  realmAccess: {
    roles: ['user']
  },
  hasRealmRole: (_role: string) => true
};

export const initKeycloak = (onAuthenticatedCallback: () => void) => {
  // Gọi trực tiếp callback để chạy ứng dụng không cần server auth
  onAuthenticatedCallback();
};

export const doLogin = () => {};
export const doLogout = () => alert('Đăng xuất (Giao diện thử nghiệm)');
export const getToken = () => 'mock-token';
export const getRoles = () => ['user']; // Trả về role 'user' để hiển thị PatientPortal làm trang chủ mặc định
export const hasRole = (_role: string) => true; // Luôn cho phép truy cập mọi trang bảo mật khác (/doctor, /admin) khi vào trực tiếp link
export const getUserInfo = () => ({
  id: 'mock-user-id-123',
  email: 'test@example.com',
  name: 'Thành viên nhóm phát triển',
});

export default keycloak;
