import React, { useState } from 'react';
import { AuthForm } from './components/AuthForm';
import { Dashboard } from './components/Dashboard';
import { AuthConfig } from './types/github';

function App() {
  const [authConfig, setAuthConfig] = useState<AuthConfig | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleAuth = async (config: AuthConfig) => {
    try {
      setAuthError(null);
      // Test the token by making a simple API call
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `Authentication failed: ${response.status} ${response.statusText}`,
        }));
        throw new Error(error.message || 'Invalid token');
      }

      setAuthConfig(config);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Authentication failed');
    }
  };

  const handleLogout = () => {
    setAuthConfig(null);
    setAuthError(null);
  };

  if (!authConfig) {
    return <AuthForm onAuth={handleAuth} error={authError || undefined} />;
  }

  return <Dashboard config={authConfig} onLogout={handleLogout} />;
}

export default App;