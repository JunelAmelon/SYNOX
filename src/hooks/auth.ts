// Types et interfaces pour l'authentification
export interface UserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  [key: string]: unknown;
}

export interface AuthResult {
  user?: import('firebase/auth').User;
  success: boolean;
  requiresMFA?: boolean;
  resolver?: import('firebase/auth').MultiFactorResolver;
}

export interface SetupTwoFactorResult {
  success: boolean;
  verificationId?: string;
}
