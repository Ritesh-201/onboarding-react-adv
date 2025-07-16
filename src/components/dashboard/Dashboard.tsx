import React, { useState, useCallback, useMemo, memo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';
import Modal from '../common/Modal/Modal';
import InfiniteScroll from '../common/InfiniteScroll/InfiniteScroll';
import Accordion from '../common/Accordion/Accordion';
import AutoComplete from '../common/AutoComplete/AutoComplete';
import './Dashboard.css';

interface ComponentInfo {
  id: string;
  title: string;
  description: string;
  pattern: string;
}

const Dashboard: React.FC = memo(() => {
  usePerformanceMonitor('Dashboard');
  
  const { theme, toggleTheme } = useTheme();
  const [activeComponent, setActiveComponent] = useState<string | null>(null);

  const components: ComponentInfo[] = useMemo(() => [
    {
      id: 'modal',
      title: 'Modal Component',
      description: 'Reusable modal with portal and focus management',
      pattern: 'Portal Pattern'
    },
    {
      id: 'infinite-scroll',
      title: 'Infinite Scroll',
      description: 'Implement infinite scrolling functionality',
      pattern: 'Performance Optimization'
    },
    {
      id: 'accordion',
      title: 'Accordion',
      description: 'Collapsible content sections',
      pattern: 'Compound Components'
    },
    {
      id: 'autocomplete',
      title: 'AutoComplete',
      description: 'Search with suggestions',
      pattern: 'Controlled Components'
    }
  ], []);

  const handleComponentSelect = useCallback((componentId: string) => {
    setActiveComponent(componentId);
  }, []);

  const handleBackToDashboard = useCallback(() => {
    setActiveComponent(null);
  }, []);

  const renderActiveComponent = useCallback(() => {
    switch (activeComponent) {
      case 'modal':
        return <Modal />;
      case 'infinite-scroll':
        return <InfiniteScroll />;
      case 'accordion':
        return <Accordion />;
      case 'autocomplete':
        return <AutoComplete />;
      default:
        return null;
    }
  }, [activeComponent]);

  const activeComponentInfo = useMemo(() => 
    components.find(c => c.id === activeComponent), 
    [components, activeComponent]
  );

  return (
    <div className={`dashboard ${theme}`}>
      <header className="dashboard-header">
        <div className="container">
          <h1 className="dashboard-title">React Advanced Patterns Dashboard</h1>
          <p className="dashboard-subtitle">
            Showcasing React concepts, hooks, and advanced patterns
          </p>
          <button 
            className="btn btn-outline" 
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            Toggle Theme: {theme}
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="container">
          {!activeComponent ? (
            <div className="components-grid">
              <h2 className="section-title">Choose a Component to Explore</h2>
              <div className="grid grid-2" role="grid">
                {components.map((component) => (
                  <div
                    key={component.id}
                    className="component-card"
                    onClick={() => handleComponentSelect(component.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleComponentSelect(component.id);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Explore ${component.title} component`}
                  >
                    <h3 className="component-title">{component.title}</h3>
                    <p className="component-description">{component.description}</p>
                    <span className="component-pattern">Pattern: {component.pattern}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="component-demo">
              <div className="demo-header">
                <h2 className="demo-title">
                  {activeComponentInfo?.title}
                </h2>
                <button 
                  className="btn btn-outline"
                  onClick={handleBackToDashboard}
                  aria-label="Return to dashboard"
                >
                  ← Back to Dashboard
                </button>
              </div>
              <div className="demo-content">
                {renderActiveComponent()}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
});

export default Dashboard;