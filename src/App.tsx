import React, { useState } from 'react';
import { AuthForm } from './components/AuthForm';
import { Dashboard } from './components/Dashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ErrorFallback } from './components/ErrorFallback';
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

  const handleAppError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('App-level error:', error, errorInfo);
    // In production, send to monitoring service
  };

  return (
    <ErrorBoundary 
      fallback={ErrorFallback}
      onError={handleAppError}
    >
      {!authConfig ? (
        <ErrorBoundary 
          fallback={ErrorFallback}
          onError={(error) => console.error('Auth error:', error)}
        >
          <AuthForm onAuth={handleAuth} error={authError || undefined} />
        </ErrorBoundary>
      ) : (
        <ErrorBoundary 
          fallback={ErrorFallback}
          onError={(error) => console.error('Dashboard error:', error)}
        >
          <Dashboard config={authConfig} onLogout={handleLogout} />
        </ErrorBoundary>
      )}
    </ErrorBoundary>
  );
}

export default App;