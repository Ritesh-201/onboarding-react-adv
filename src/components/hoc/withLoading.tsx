import React, { useEffect } from 'react';
import type { ComponentType } from 'react';

interface LoadingProps {
  isLoading?: boolean;
}

// HOC for adding loading state
export const withLoading = <P extends object>(
  WrappedComponent: ComponentType<P>,
  loadingComponent?: React.ReactNode
) => {
  const WithLoadingComponent = (props: P & LoadingProps) => {
    const { isLoading, ...restProps } = props;

    if (isLoading) {
      return loadingComponent || (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          padding: '2rem',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #333',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p>Loading...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      );
    }

    return <WrappedComponent {...restProps as P} />;
  };

  WithLoadingComponent.displayName = `withLoading(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithLoadingComponent;
};

// HOC for adding authentication check
interface AuthProps {
  isAuthenticated?: boolean;
}

export const withAuth = <P extends object>(
  WrappedComponent: ComponentType<P>,
  unauthorizedComponent?: React.ReactNode
) => {
  const WithAuthComponent = (props: P & AuthProps) => {
    const { isAuthenticated = false, ...restProps } = props;

    if (!isAuthenticated) {
      return unauthorizedComponent || (
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center',
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '8px',
          color: '#856404'
        }}>
          <h3>Access Denied</h3>
          <p>You need to be authenticated to view this content.</p>
          <button style={{
            padding: '0.5rem 1rem',
            background: '#333',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Login
          </button>
        </div>
      );
    }

    return <WrappedComponent {...restProps as P} />;
  };

  WithAuthComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithAuthComponent;
};

// HOC for logging component lifecycle
export const withLogger = <P extends object>(
  WrappedComponent: ComponentType<P>,
  logLevel: 'info' | 'debug' = 'info'
) => {
  const WithLoggerComponent = (props: P) => {
    const componentName = WrappedComponent.displayName || WrappedComponent.name;

    useEffect(() => {
      if (logLevel === 'info' || logLevel === 'debug') {
        console.log(`[${componentName}] Component mounted`, props);
      }

      return () => {
        if (logLevel === 'debug') {
          console.log(`[${componentName}] Component unmounting`);
        }
      };
    }, []);

    useEffect(() => {
      if (logLevel === 'debug') {
        console.log(`[${componentName}] Props updated:`, props);
      }
    }, [props]);

    return <WrappedComponent {...props} />;
  };

  WithLoggerComponent.displayName = `withLogger(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithLoggerComponent;
};

// Compose multiple HOCs
export const compose = (...hocs: Array<(component: any) => any>) => (component: any) =>
  hocs.reduceRight((acc, hoc) => hoc(acc), component);

// Demo component to showcase HOCs
const SimpleComponent: React.FC<{ message: string }> = ({ message }) => (
  <div style={{ padding: '1rem', background: '#f0f0f0', borderRadius: '4px' }}>
    <h4>Enhanced Component</h4>
    <p>{message}</p>
  </div>
);

// Enhanced components using HOCs
export const LoadingComponent = withLoading(SimpleComponent);
export const AuthenticatedComponent = withAuth(SimpleComponent);
export const LoggedComponent = withLogger(SimpleComponent, 'debug');

// Composed component with multiple HOCs
export const SuperEnhancedComponent = compose(
  withLoading,
  withAuth,
  withLogger
)(SimpleComponent);
