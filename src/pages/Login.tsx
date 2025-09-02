import React from 'react';
import AuthLayout from '../components/AuthLayout';
import LoginForm from '../components/LoginForm';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  return (
    <AuthLayout
      title="Bon retour !"
      subtitle="Connectez-vous pour accéder à vos coffres d'épargne et continuer votre parcours financier."
      currentPage="login"
    >
      <LoginForm onLogin={onLogin} />
    </AuthLayout>
  );
}