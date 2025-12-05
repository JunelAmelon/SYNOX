import React from 'react';
import AuthLayout from '../components/AuthLayout';
import SignupForm from '../components/SignupForm';

interface SignupProps {
  onLogin: () => void;
}

export default function Signup({ onLogin }: SignupProps) {
  return (
    <AuthLayout
      title="Rejoignez ARYWO"
      subtitle="Créez votre compte et commencez dès aujourd'hui à transformer vos habitudes financières."
      currentPage="signup"
    >
      <SignupForm onLogin={onLogin} />
    </AuthLayout>
  );
}