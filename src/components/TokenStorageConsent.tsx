import React, { useState } from 'react';
import { Shield, Clock, Database, Trash2, AlertTriangle, Info } from 'lucide-react';
import { TokenStoragePreferences } from '../types/github';
import SecureTokenStorage from '../utils/tokenStorage';

interface TokenStorageConsentProps {
  onPreferencesChange: (preferences: TokenStoragePreferences) => void;
  initialPreferences?: Partial<TokenStoragePreferences>;
  showAsModal?: boolean;
  onClose?: () => void;
}

export const TokenStorageConsent: React.FC<TokenStorageConsentProps> = ({
  onPreferencesChange,
  initialPreferences = {},
  showAsModal = false,
  onClose,
}) => {
  const [preferences, setPreferences] = useState<TokenStoragePreferences>({
    rememberToken: initialPreferences.rememberToken ?? false,
    storageType: initialPreferences.storageType ?? 'sessionStorage',
    expiresInHours: initialPreferences.expiresInHours ?? 24,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handlePreferenceChange = (key: keyof TokenStoragePreferences, value: string | number | boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    onPreferencesChange(newPreferences);
  };

  const handleClearAllTokens = async () => {
    if (window.confirm('Are you sure you want to clear all stored tokens? You will need to re-enter your token.')) {
      await SecureTokenStorage.clearAllTokens();
      if (onClose) {
        onClose();
      }
    }
  };

  const isWebCryptoSupported = SecureTokenStorage.isSupported();

  const containerClass = showAsModal
    ? "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    : "";

  const contentClass = showAsModal
    ? "bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl"
    : "bg-slate-700/50 border border-slate-600 rounded-lg p-4";

  const Content = () => (
    <div className={contentClass}>
      <div className="flex items-center space-x-3 mb-4">
        <Shield className="w-6 h-6 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Token Storage Preferences</h3>
      </div>

      {/* Security Warning */}
      <div className="bg-amber-900/20 border border-amber-800 rounded-lg p-3 mb-4">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-300">
            <p className="font-medium mb-1">Security Notice</p>
            <p>
              Storing tokens in your browser has security risks. Only enable this on trusted devices.
              Your token will be encrypted, but client-side storage can be vulnerable to XSS attacks.
            </p>
          </div>
        </div>
      </div>

      {/* Web Crypto Support Check */}
      {!isWebCryptoSupported && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 mb-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-300">
              <p className="font-medium mb-1">Encryption Not Supported</p>
              <p>
                Your browser doesn't support Web Crypto API. Secure token storage is not available.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Remember Token Option */}
      <div className="space-y-4">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={preferences.rememberToken}
            onChange={(e) => handlePreferenceChange('rememberToken', e.target.checked)}
            disabled={!isWebCryptoSupported}
            className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50"
          />
          <span className="text-white font-medium">Remember my GitHub token</span>
        </label>

        {preferences.rememberToken && (
          <div className="ml-7 space-y-4">
            {/* Storage Type Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Storage Type
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="storageType"
                    value="sessionStorage"
                    checked={preferences.storageType === 'sessionStorage'}
                    onChange={(e) => handlePreferenceChange('storageType', e.target.value)}
                    className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 focus:ring-blue-500 focus:ring-2"
                  />
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-green-400" />
                    <span className="text-slate-300">Session only (cleared when browser closes)</span>
                  </div>
                </label>
                
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="storageType"
                    value="localStorage"
                    checked={preferences.storageType === 'localStorage'}
                    onChange={(e) => handlePreferenceChange('storageType', e.target.value)}
                    className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 focus:ring-blue-500 focus:ring-2"
                  />
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-300">Persistent (remember across sessions)</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Advanced Options */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center space-x-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Info className="w-4 h-4" />
                <span>Advanced Options</span>
              </button>

              {showAdvanced && (
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Token Expiration
                    </label>
                    <select
                      value={preferences.expiresInHours}
                      onChange={(e) => handlePreferenceChange('expiresInHours', parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={1}>1 hour</option>
                      <option value={8}>8 hours</option>
                      <option value={24}>24 hours (1 day)</option>
                      <option value={168}>7 days</option>
                      <option value={720}>30 days</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Clear Tokens Button */}
        <div className="pt-4 border-t border-slate-600">
          <button
            type="button"
            onClick={handleClearAllTokens}
            className="flex items-center space-x-2 text-red-400 hover:text-red-300 text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear all stored tokens</span>
          </button>
        </div>

        {/* Info Section */}
        <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-400">
              <p className="font-medium text-slate-300 mb-1">How it works:</p>
              <ul className="space-y-1">
                <li>• Your token is encrypted using AES-256-GCM</li>
                <li>• Encryption keys are derived from browser characteristics</li>
                <li>• Tokens automatically expire based on your settings</li>
                <li>• You can clear stored tokens at any time</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Actions */}
      {showAsModal && onClose && (
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );

  return showAsModal ? (
    <div className={containerClass}>
      <Content />
    </div>
  ) : (
    <Content />
  );
};

export default TokenStorageConsent;