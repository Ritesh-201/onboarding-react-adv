import { useEffect, useRef } from 'react';

/**
 * Custom hook to measure component render performance
 * Only logs in development mode
 */
export const usePerformanceMonitor = (componentName: string) => {
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);

  useEffect(() => {
    if (import.meta.env.DEV) {
      renderStartTime.current = performance.now();
      renderCount.current += 1;
    }
  });

  useEffect(() => {
    if (import.meta.env.DEV) {
      const renderTime = performance.now() - renderStartTime.current;
      console.log(`${componentName} render #${renderCount.current} took ${renderTime.toFixed(2)}ms`);
    }
  });
};

/**
 * Custom hook to measure component mount and unmount performance
 */
export const useComponentLifecycle = (componentName: string) => {
  const mountTime = useRef<number>(0);

  useEffect(() => {
    if (import.meta.env.DEV) {
      mountTime.current = performance.now();
      console.log(`${componentName} mounted at ${mountTime.current.toFixed(2)}ms`);
    }

    return () => {
      if (import.meta.env.DEV) {
        const unmountTime = performance.now();
        const lifespan = unmountTime - mountTime.current;
        console.log(`${componentName} unmounted after ${lifespan.toFixed(2)}ms lifespan`);
      }
    };
  }, [componentName]);
};
