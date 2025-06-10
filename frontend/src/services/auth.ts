const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: 'ETUDIANT' | 'PROFESSEUR';
}

export interface AuthResponse {
  token: string;
  role: 'ETUDIANT' | 'PROFESSEUR';
}

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('Sending login request to:', `${API_URL}/auth/login`);
      console.log('Request data:', data);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Login failed:', errorData);
        throw new Error(errorData.detail || 'Login failed');
      }

      const responseData = await response.json();
      console.log('Login response data:', responseData);
      
      if (!responseData.token || !responseData.role) {
        console.error('Invalid response format:', responseData);
        throw new Error('Invalid response format from server');
      }

      // Store the token
      this.setToken(responseData.token);

      return responseData;
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        throw new Error(`Login failed: ${error.message}`);
      }
      throw new Error('Login failed: Network error');
    }
  },

  async register(data: RegisterRequest): Promise<void> {
    try {
      console.log('Sending register request to:', `${API_URL}/auth/signup`);
      console.log('Request data:', data);

      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Registration failed:', errorData);
        throw new Error(errorData.detail || 'Registration failed');
      }

      console.log('Registration successful');
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof Error) {
        throw new Error(`Registration failed: ${error.message}`);
      }
      throw new Error('Registration failed: Network error');
    }
  },

  setToken(token: string) {
    localStorage.setItem('token', token);
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  removeToken() {
    localStorage.removeItem('token');
  }
}; 