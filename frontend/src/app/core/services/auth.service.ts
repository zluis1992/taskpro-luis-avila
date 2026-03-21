import { LoginRequest, LoginResponse, RegisterRequest } from '../models/auth.model';
import { User } from '../models/user.model';
import { post } from './api.service';

const TOKEN_KEY = 'taskpro_token';
const USER_KEY = 'taskpro_user';

export const authService = {
  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await post<LoginResponse>('/auth/login', request);
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify({
        name: response.name,
        email: response.email,
        role: response.role,
      }));
    }
    return response;
  },

  async register(request: RegisterRequest): Promise<User> {
    return post<User>('/auth/register', request);
  },

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  getCurrentUser(): { name: string; email: string; role: string } | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
};
