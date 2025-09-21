import React, { useState, useEffect } from 'react';
import { AuthForm } from './components/AuthForm';
import { Dashboard } from './components/Dashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ErrorFallback } from './components/ErrorFallback';
import { AuthConfigWithStorage, TokenStoragePreferences, StoredTokenInfo } from './types/github';
import SecureTokenStorage, { TokenUtils } from './utils/tokenStorage';
import { useSkipLinks, useScreenReader } from './hooks/useAccessibility';

function App() {
  const [authConfig, setAuthConfig] = useState<AuthConfigWithStorage | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoadingStoredToken, setIsLoadingStoredToken] = useState(true);
  const [storedTokenInfo, setStoredTokenInfo] = useState<StoredTokenInfo>({ hasStoredToken: false });
  
  const { skipToMain } = useSkipLinks();
  const { announce } = useScreenReader();

  // Check for stored tokens on app load
  useEffect(() => {
    const loadStoredToken = async () => {
      try {
        setIsLoadingStoredToken(true);
        
        // Check all storage types for existing tokens
        const storageTypes: TokenStoragePreferences['storageType'][] = ['localStorage', 'sessionStorage', 'memory'];
        
        for (const storageType of storageTypes) {
          if (SecureTokenStorage.hasStoredToken(storageType)) {
            const token = await SecureTokenStorage.retrieveToken(storageType);
            const metadata = SecureTokenStorage.getTokenMetadata(storageType);
            
            if (token && metadata) {
              // Validate token format
              if (!TokenUtils.isValidTokenFormat(token)) {
                console.warn('Invalid token format found in storage, clearing...');
                await SecureTokenStorage.clearToken(storageType);
                continue;
              }

              // Test token validity with GitHub API
              const isValid = await validateTokenWithAPI(token);
              if (isValid) {
                const config: AuthConfigWithStorage = {
                  token,
                  storagePreferences: {
                    rememberToken: true,
                    storageType,
                    expiresInHours: 24,
                  },
                };
                
                setAuthConfig(config);
                setStoredTokenInfo({
                  hasStoredToken: true,
                  storageType,
                  storedAt: metadata.timestamp,
                  expiresAt: metadata.expiresAt,
                  maskedToken: TokenUtils.maskToken(token),
                });
                break;
              } else {
                console.warn('Invalid token found in storage, clearing...');
                await SecureTokenStorage.clearToken(storageType);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading stored token:', error);
        setAuthError('Failed to load stored token. Please sign in again.');
      } finally {
        setIsLoadingStoredToken(false);
      }
    };

    loadStoredToken();
  }, []);

  const validateTokenWithAPI = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  const handleAuth = async (config: AuthConfigWithStorage) => {
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

      // Store token if user requested it
      if (config.storagePreferences?.rememberToken && SecureTokenStorage.isSupported()) {
        try {
          await SecureTokenStorage.storeToken(
            config.token,
            {
              storageType: config.storagePreferences.storageType,
              rememberToken: config.storagePreferences.rememberToken,
            },
            config.storagePreferences.expiresInHours
          );
          
          setStoredTokenInfo({
            hasStoredToken: true,
            storageType: config.storagePreferences.storageType,
            storedAt: Date.now(),
            expiresAt: Date.now() + (config.storagePreferences.expiresInHours * 60 * 60 * 1000),
            maskedToken: TokenUtils.maskToken(config.token),
          });
        } catch (storageError) {
          console.error('Failed to store token:', storageError);
          // Continue with login even if storage fails
        }
      }

      setAuthConfig(config);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Authentication failed');
    }
  };

  const handleLogout = async () => {
    // Clear all stored tokens
    try {
      await SecureTokenStorage.clearAllTokens();
    } catch (error) {
      console.error('Failed to clear stored tokens:', error);
    }
    
    setAuthConfig(null);
    setAuthError(null);
    setStoredTokenInfo({ hasStoredToken: false });
  };

  const handleAppError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('App-level error:', error, errorInfo);
    // In production, send to monitoring service
  };

  // Show loading state while checking for stored tokens
  if (isLoadingStoredToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center" role="status" aria-live="polite">
          <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" aria-hidden="true" />
          <p className="text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Skip Links */}
      <div className="sr-only">
        <a 
          href="#main-content" 
          className="absolute top-0 left-0 bg-blue-600 text-white px-4 py-2 z-50 focus:not-sr-only focus:relative"
          onClick={(e) => {
            e.preventDefault();
            skipToMain();
          }}
        >
          Skip to main content
        </a>
      </div>

      <ErrorBoundary 
        fallback={ErrorFallback}
        onError={handleAppError}
      >
        {!authConfig ? (
          <ErrorBoundary 
            fallback={ErrorFallback}
            onError={(error) => console.error('Auth error:', error)}
          >
            <main id="main-content" role="main" aria-label="Authentication">
              <AuthForm 
                onAuth={handleAuth} 
                error={authError || undefined}
                storedTokenInfo={storedTokenInfo}
              />
            </main>
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
    </>
  );
}

export default App;