import React, { useState } from 'react';
import { Key, Github, AlertCircle, Eye, EyeOff, Shield, Trash2 } from 'lucide-react';
import { AuthConfigWithStorage, TokenStoragePreferences, StoredTokenInfo } from '../types/github';
import { TokenStorageConsent } from './TokenStorageConsent';
import SecureTokenStorage from '../utils/tokenStorage';

interface AuthFormProps {
  onAuth: (config: AuthConfigWithStorage) => void;
  error?: string;
  storedTokenInfo?: StoredTokenInfo;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onAuth, error, storedTokenInfo }) => {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [showStorageOptions, setShowStorageOptions] = useState(false);
  const [storagePreferences, setStoragePreferences] = useState<TokenStoragePreferences>({
    rememberToken: false,
    storageType: 'sessionStorage',
    expiresInHours: 24,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    
    setIsLoading(true);
    const config: AuthConfigWithStorage = {
      token: token.trim(),
      storagePreferences: storagePreferences.rememberToken ? storagePreferences : undefined,
    };
    onAuth(config);
    setIsLoading(false);
  };

  const handleClearStoredToken = async () => {
    if (storedTokenInfo?.storageType && window.confirm('Are you sure you want to clear your stored token?')) {
      await SecureTokenStorage.clearToken(storedTokenInfo.storageType);
      window.location.reload();
    }
  };

  const formatStorageType = (type?: string) => {
    switch (type) {
      case 'localStorage': return 'Persistent Storage';
      case 'sessionStorage': return 'Session Storage';
      case 'memory': return 'Memory Storage';
      default: return 'Unknown Storage';
    }
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center mb-8">
          <Github className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">GitHub Following Tracker</h1>
          <p className="text-slate-400">Enter your GitHub Personal Access Token to view your following list</p>
        </div>

        {/* Stored Token Info */}
        {storedTokenInfo?.hasStoredToken && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-800 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-2">
                <Shield className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-300">Stored Token Found</p>
                  <p className="text-xs text-green-400 mt-1">
                    {storedTokenInfo.maskedToken && `Token: ${storedTokenInfo.maskedToken}`}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Storage: {formatStorageType(storedTokenInfo.storageType)} • 
                    Stored: {formatDate(storedTokenInfo.storedAt)}
                    {storedTokenInfo.expiresAt && (
                      <> • Expires: {formatDate(storedTokenInfo.expiresAt)}</>
                    )}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearStoredToken}
                className="text-red-400 hover:text-red-300 transition-colors"
                title="Clear stored token"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-slate-300 mb-2">
              Personal Access Token
            </label>
            <div className="relative">
              <Key className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                id="token"
                type={showToken ? "text" : "password"}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full pl-10 pr-12 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Create a token at{' '}
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                GitHub Settings
              </a>
              {' '}with 'user' scope
            </p>
          </div>

          {/* Token Storage Options */}
          <div>
            <button
              type="button"
              onClick={() => setShowStorageOptions(!showStorageOptions)}
              className="flex items-center space-x-2 text-sm text-slate-300 hover:text-white transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span>Token Storage Options</span>
              <span className="text-xs text-slate-500">
                {storagePreferences.rememberToken ? '(Enabled)' : '(Disabled)'}
              </span>
            </button>
            
            {showStorageOptions && (
              <div className="mt-3">
                <TokenStorageConsent
                  onPreferencesChange={setStoragePreferences}
                  initialPreferences={storagePreferences}
                />
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-400 bg-red-900/20 border border-red-800 rounded-lg p-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!token.trim() || isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Github className="w-5 h-5" />
                <span>Connect to GitHub</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
          <h3 className="font-medium text-white mb-2">Setup Instructions:</h3>
          <ol className="text-sm text-slate-300 space-y-1 list-decimal list-inside">
            <li>Go to GitHub Settings → Developer settings → Personal access tokens</li>
            <li>Generate a new token (classic)</li>
            <li>Select the 'user' scope</li>
            <li>Copy the token and paste it above</li>
          </ol>
        </div>
      </div>
    </div>
  );
};