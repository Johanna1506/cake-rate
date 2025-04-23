import { useCallback } from 'react';
import { useToast } from '@components/Toast';

interface ErrorResponse {
  message: string;
  code?: string;
  details?: any;
}

const ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'Identifiants de connexion invalides',
  'Email not confirmed': 'Email non confirmé',
  'Invalid email or password': 'Email ou mot de passe invalide',
  'User not found': 'Utilisateur non trouvé',
  'Network error': 'Erreur de connexion',
  'Too many requests': 'Trop de tentatives, veuillez réessayer plus tard',
};

export const useErrorHandler = () => {
  const { showToast } = useToast();

  const handleError = useCallback((error: unknown) => {
    let errorMessage = 'Une erreur est survenue';

    if (error instanceof Error) {
      errorMessage = ERROR_MESSAGES[error.message] || error.message;
    } else if (typeof error === 'string') {
      errorMessage = ERROR_MESSAGES[error] || error;
    } else if (typeof error === 'object' && error !== null) {
      const errorObj = error as ErrorResponse;
      errorMessage = ERROR_MESSAGES[errorObj.message] || errorObj.message || errorMessage;
    }

    showToast(errorMessage, 'error');
  }, [showToast]);

  const handleSuccess = useCallback((message: string) => {
    showToast(message, 'success');
  }, [showToast]);

  const handleWarning = useCallback((message: string) => {
    showToast(message, 'warning');
  }, [showToast]);

  const handleInfo = useCallback((message: string) => {
    showToast(message, 'info');
  }, [showToast]);

  return {
    handleError,
    handleSuccess,
    handleWarning,
    handleInfo,
  };
}; 