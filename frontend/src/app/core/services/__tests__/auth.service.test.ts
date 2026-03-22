import { authService } from '@/app/core/services/auth.service';

const mockPost = jest.fn();
jest.mock('@/app/core/services/api.service', () => ({
  post: (...args: unknown[]) => mockPost(...args),
}));

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('login', () => {
    it('should save token and user to localStorage on success', async () => {
      const loginResponse = {
        token: 'jwt-token-123',
        name: 'Luis',
        email: 'luis@test.com',
        role: 'Admin',
        expiresAt: '2026-12-31',
      };
      mockPost.mockResolvedValue(loginResponse);

      const result = await authService.login({ email: 'luis@test.com', password: 'secret' });

      expect(result.token).toBe('jwt-token-123');
      expect(localStorage.getItem('taskpro_token')).toBe('jwt-token-123');
      const user = JSON.parse(localStorage.getItem('taskpro_user')!);
      expect(user.name).toBe('Luis');
      expect(user.email).toBe('luis@test.com');
    });

    it('should call POST /auth/login with credentials', async () => {
      mockPost.mockResolvedValue({ token: 't', name: 'n', email: 'e', role: 'r', expiresAt: '' });

      await authService.login({ email: 'test@test.com', password: 'pass' });

      expect(mockPost).toHaveBeenCalledWith('/auth/login', { email: 'test@test.com', password: 'pass' });
    });
  });

  describe('register', () => {
    it('should call POST /auth/register', async () => {
      const user = { id: 1, name: 'Luis', email: 'luis@test.com', role: 'Member', createdAt: '' };
      mockPost.mockResolvedValue(user);

      const result = await authService.register({ name: 'Luis', email: 'luis@test.com', password: 'pass' });

      expect(result.id).toBe(1);
      expect(mockPost).toHaveBeenCalledWith('/auth/register', { name: 'Luis', email: 'luis@test.com', password: 'pass' });
    });
  });

  describe('logout', () => {
    it('should clear token and user from localStorage', () => {
      localStorage.setItem('taskpro_token', 'token');
      localStorage.setItem('taskpro_user', '{}');

      authService.logout();

      expect(localStorage.getItem('taskpro_token')).toBeNull();
      expect(localStorage.getItem('taskpro_user')).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      localStorage.setItem('taskpro_token', 'token');
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should return false when no token', () => {
      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('should return parsed user from localStorage', () => {
      localStorage.setItem('taskpro_user', JSON.stringify({ name: 'Luis', email: 'l', role: 'Admin' }));
      const user = authService.getCurrentUser();
      expect(user?.name).toBe('Luis');
    });

    it('should return null when no user stored', () => {
      expect(authService.getCurrentUser()).toBeNull();
    });
  });
});
