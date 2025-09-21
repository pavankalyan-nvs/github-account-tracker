import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { ErrorFallbackProps } from './ErrorBoundary';

interface CustomErrorFallbackProps extends ErrorFallbackProps {
  title?: string;
  message?: string;
  showHomeButton?: boolean;
  isolate?: boolean;
}

export const ErrorFallback: React.FC<CustomErrorFallbackProps> = ({
  error,
  errorInfo,
  resetError,
  title = "Something went wrong",
  message,
  showHomeButton = false,
  isolate = false,
}) => {
  const getErrorMessage = () => {
    if (message) return message;
    
    if (error?.message.includes('Network')) {
      return "Please check your internet connection and try again.";
    }
    
    if (error?.message.includes('rate limit')) {
      return "GitHub API rate limit exceeded. Please wait a moment and try again.";
    }
    
    if (error?.message.includes('token') || error?.message.includes('401')) {
      return "Authentication failed. Please check your GitHub token and try again.";
    }
    
    return isolate 
      ? "This section encountered an error, but the rest of the app should work normally."
      : "An unexpected error occurred. Please try again or refresh the page.";
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const containerClass = isolate 
    ? "bg-red-900/10 border border-red-800 rounded-lg p-6 m-4"
    : "min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4";

  const contentClass = isolate 
    ? "text-center"
    : "bg-slate-800 border border-red-800 rounded-lg p-8 max-w-md w-full text-center";

  return (
    <div className={containerClass}>
      <div className={contentClass}>
        <div className="text-red-400 text-4xl mb-4">
          <AlertTriangle className="w-12 h-12 mx-auto" />
        </div>
        
        <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
        
        <p className="text-slate-300 mb-6">
          {getErrorMessage()}
        </p>
        
        <div className="space-y-3">
          <button
            onClick={resetError}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          
          {!isolate && (
            <button
              onClick={handleRefresh}
              className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Refresh Page
            </button>
          )}
          
          {showHomeButton && (
            <button
              onClick={handleGoHome}
              className="w-full px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>Go to Home</span>
            </button>
          )}
        </div>
        
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-6 text-left">
            <summary className="text-slate-400 cursor-pointer text-sm flex items-center space-x-2">
              <Bug className="w-4 h-4" />
              <span>Error Details (Development)</span>
            </summary>
            <div className="mt-3 space-y-2">
              <div>
                <p className="text-xs text-slate-400 mb-1">Error Message:</p>
                <pre className="text-xs text-red-300 bg-slate-900 p-2 rounded overflow-x-auto">
                  {error.message}
                </pre>
              </div>
              {error.stack && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Stack Trace:</p>
                  <pre className="text-xs text-red-300 bg-slate-900 p-2 rounded overflow-x-auto max-h-32">
                    {error.stack}
                  </pre>
                </div>
              )}
              {errorInfo?.componentStack && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Component Stack:</p>
                  <pre className="text-xs text-orange-300 bg-slate-900 p-2 rounded overflow-x-auto max-h-32">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
};

// Specialized fallback components for different contexts
export const APIErrorFallback: React.FC<ErrorFallbackProps> = (props) => (
  <ErrorFallback
    {...props}
    title="API Error"
    message="Failed to load data from GitHub. Please check your connection and try again."
    isolate={true}
  />
);

export const DashboardErrorFallback: React.FC<ErrorFallbackProps> = (props) => (
  <ErrorFallback
    {...props}
    title="Dashboard Error"
    message="The dashboard encountered an error. Your data is safe, please try refreshing."
    showHomeButton={true}
  />
);

export const ComponentErrorFallback: React.FC<ErrorFallbackProps> = (props) => (
  <ErrorFallback
    {...props}
    title="Component Error"
    message="This section failed to load. Other parts of the app should work normally."
    isolate={true}
  />
);