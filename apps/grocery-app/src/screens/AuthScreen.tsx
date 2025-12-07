import React, { useState } from 'react';
import { LoginScreen } from './LoginScreen';
import { RegisterScreen } from './RegisterScreen';

export const AuthScreen: React.FC = () => {
    const [showLogin, setShowLogin] = useState(true);

    return showLogin ? (
        <LoginScreen onNavigateToRegister={() => setShowLogin(false)} />
    ) : (
        <RegisterScreen onNavigateToLogin={() => setShowLogin(true)} />
    );
};
