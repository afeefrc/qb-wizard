import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  authenticateExaminer,
  setupPasswordAuth as setupPasswordAuthExaminer,
  setupTOTPAuth as setupTOTPAuthExaminer,
  completeTOTPSetup as completeTOTPSetupExaminer,
} from '../models/examiners';

interface User {
  id: string;
  name: string;
  role: string;
  examinerEmpId: number;
  authMethod: 'password' | 'totp' | 'none';
  isFirstLogin: boolean;
  passwordResetRequired?: boolean;
  totpResetRequired?: boolean;
}

interface AuthResponse {
  success: boolean;
  message: string;
  examiner?: any;
  isFirstLogin?: boolean;
  requiresPasswordReset?: boolean;
  requiresTOTPReset?: boolean;
  totpSecret?: string;
  backupCodes?: string[];
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (
    examinerEmpId: number,
    credentials: { password?: string; totpToken?: string },
  ) => Promise<AuthResponse>;
  logout: () => void;
  setupAuth: (
    examinerEmpId: number,
    setup: {
      password?: string;
      setupTOTP?: boolean;
      authMethod: 'password' | 'totp';
      totpSecret?: string;
    },
  ) => Promise<AuthResponse>;
  isAuthenticated: boolean;
  setupPasswordAuth: (
    examinerEmpId: number,
    password: string,
  ) => Promise<AuthResponse>;
  setupTOTPAuth: (examinerEmpId: number) => Promise<AuthResponse>;
  completeTOTPSetup: (
    examinerEmpId: number,
    totpSecret: string,
  ) => Promise<AuthResponse>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// eslint-disable-next-line react/function-component-definition
export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (
    examinerEmpId: number,
    credentials: { password?: string; totpToken?: string },
  ): Promise<AuthResponse> => {
    try {
      const authResult = await authenticateExaminer(examinerEmpId, credentials);
      console.log('Auth result:', authResult); // Debug log

      if (authResult.success) {
        // Set user state only on successful authentication
        setUser({
          id: authResult.examiner.id,
          name: authResult.examiner.examinerName,
          role: authResult.examiner.role || 'examiner',
          examinerEmpId: authResult.examiner.examinerEmpId,
          authMethod: authResult.examiner.authMethod,
          isFirstLogin: authResult.examiner.isFirstLogin,
          passwordResetRequired: authResult.examiner.passwordResetRequired,
          totpResetRequired: authResult.examiner.totpResetRequired,
        });
      }

      // Always return the full result, even if authentication failed
      return authResult;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || 'Login failed',
        examiner: null,
        isFirstLogin: false,
      };
    }
  };

  const logout = () => {
    setUser(null);
  };

  const setupAuth = async (
    examinerEmpId: number,
    setup: {
      password?: string;
      setupTOTP?: boolean;
      authMethod: 'password' | 'totp';
      totpSecret?: string;
    },
  ) => {
    try {
      if (setup.authMethod === 'password' && setup.password) {
        return await setupPasswordAuthExaminer(examinerEmpId, setup.password);
      } else if (setup.authMethod === 'totp') {
        if (setup.totpSecret) {
          // Complete TOTP setup with existing secret
          return await completeTOTPSetupExaminer(
            examinerEmpId,
            setup.totpSecret,
          );
        } else {
          // Initial TOTP setup to get secret and backup codes
          return await setupTOTPAuthExaminer(examinerEmpId);
        }
      }
      return {
        success: false,
        message: 'Invalid authentication method or missing data',
      };
    } catch (error) {
      console.error('Setup auth error:', error);
      return {
        success: false,
        message: error.message || 'Failed to setup authentication',
      };
    }
  };

  const setupPasswordAuth = async (examinerEmpId: number, password: string) => {
    try {
      return await setupPasswordAuthExaminer(examinerEmpId, password);
    } catch (error) {
      console.error('Password setup error:', error);
      return {
        success: false,
        message: error.message || 'Failed to setup password',
      };
    }
  };

  const setupTOTPAuth = async (examinerEmpId: number) => {
    try {
      return await setupTOTPAuthExaminer(examinerEmpId);
    } catch (error) {
      console.error('TOTP setup error:', error);
      return {
        success: false,
        message: error.message || 'Failed to setup TOTP',
      };
    }
  };

  const completeTOTPSetup = async (
    examinerEmpId: number,
    totpSecret: string,
  ) => {
    try {
      return await completeTOTPSetupExaminer(examinerEmpId, totpSecret);
    } catch (error) {
      console.error('TOTP completion error:', error);
      return {
        success: false,
        message: error.message || 'Failed to complete TOTP setup',
      };
    }
  };

  const value = {
    user,
    setUser,
    login,
    logout,
    setupAuth,
    isAuthenticated: !!user,
    setupPasswordAuth,
    setupTOTPAuth,
    completeTOTPSetup,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
