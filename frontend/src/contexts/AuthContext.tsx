import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api, { User } from '@/lib/api';
import { toast } from 'sonner';


interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('token');
    if (token) {
      api.setToken(token);
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      const response = await api.getMe();
      if (response.success && response.data?.user) {
        setUser(response.data.user);
      } else {
        // Invalid response, clear token
        localStorage.removeItem('token');
        api.setToken(null);
        setUser(null);
      }
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Failed to load user');
      console.error('Failed to load user:', error);
      // Token is invalid or expired, clear it
      localStorage.removeItem('token');
      api.setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    // Don't set global loading state here, let the component handle its own loading
    try {
      const response = await api.login(email, password);

      if (response.success && response.data?.token && response.data?.user) {
        // Token is already set in api.login, but ensure it's set here too
        api.setToken(response.data.token);
        setUser(response.data.user);
        toast.success('Login successful!');
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      const err = error as Error;
      const errorMessage = err.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      setUser(null);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    // Don't set global loading state here, let the component handle its own loading
    try {
      const response = await api.register(name, email, password);

      if (response.success && response.data?.token && response.data?.user) {
        // Token is already set in api.register, but ensure it's set here too
        api.setToken(response.data.token);
        setUser(response.data.user);
        toast.success('Registration successful! Welcome to Thrifty Steps!');
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      const err = error as Error;
      const errorMessage = err.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      setUser(null);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    api.setToken(null);
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
