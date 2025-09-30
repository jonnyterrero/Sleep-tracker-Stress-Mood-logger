import { apiService } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
}

class AuthService {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiService.post<LoginResponse>('/auth/login', {
      email,
      password,
    });

    if (response.success && response.data) {
      // Store tokens securely
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    }

    throw new Error(response.error || 'Login failed');
  }

  async register(userData: RegisterData): Promise<LoginResponse> {
    const response = await apiService.post<LoginResponse>('/auth/register', userData);

    if (response.success && response.data) {
      // Store tokens securely
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    }

    throw new Error(response.error || 'Registration failed');
  }

  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Clear local storage regardless of API call success
      await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'user']);
    }
  }

  async refreshToken(): Promise<{ token: string; user?: User }> {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiService.post<{ token: string; user?: User }>('/auth/refresh', {
      refreshToken,
    });

    if (response.success && response.data) {
      await AsyncStorage.setItem('authToken', response.data.token);
      
      if (response.data.user) {
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    }

    throw new Error(response.error || 'Token refresh failed');
  }

  async checkAuthStatus(): Promise<LoginResponse | null> {
    const token = await AsyncStorage.getItem('authToken');
    const userStr = await AsyncStorage.getItem('user');

    if (!token || !userStr) {
      return null;
    }

    try {
      const response = await apiService.get<{ user: User }>('/auth/me');
      
      if (response.success && response.data) {
        return {
          user: response.data.user,
          token,
          refreshToken: await AsyncStorage.getItem('refreshToken') || '',
        };
      }
    } catch (error) {
      // Token might be invalid, clear storage
      await this.logout();
    }

    return null;
  }

  async forgotPassword(email: string): Promise<void> {
    const response = await apiService.post('/auth/forgot-password', { email });

    if (!response.success) {
      throw new Error(response.error || 'Failed to send reset email');
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await apiService.post('/auth/reset-password', {
      token,
      password: newPassword,
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to reset password');
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await apiService.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to change password');
    }
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await apiService.put<User>('/auth/profile', userData);

    if (response.success && response.data) {
      await AsyncStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    }

    throw new Error(response.error || 'Failed to update profile');
  }

  async deleteAccount(): Promise<void> {
    const response = await apiService.delete('/auth/account');

    if (response.success) {
      await this.logout();
    } else {
      throw new Error(response.error || 'Failed to delete account');
    }
  }
}

export const authService = new AuthService();

