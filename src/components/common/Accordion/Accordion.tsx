import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import './Accordion.css';

// Accordion Context
interface AccordionContextType {
  openItems: Set<string>;
  toggleItem: (id: string) => void;
  allowMultiple: boolean;
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined);

const useAccordion = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion components must be used within an Accordion');
  }
  return context;
};

// Accordion Root Component
interface AccordionProps {
  children: ReactNode;
  allowMultiple?: boolean;
  defaultOpen?: string[];
}

const AccordionRoot: React.FC<AccordionProps> = ({ 
  children, 
  allowMultiple = false, 
  defaultOpen = [] 
}) => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(defaultOpen));

  const toggleItem = useCallback((id: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        if (!allowMultiple) {
          newSet.clear();
        }
        newSet.add(id);
      }
      
      return newSet;
    });
  }, [allowMultiple]);

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem, allowMultiple }}>
      <div className="accordion">
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

// Accordion Item Component
interface AccordionItemProps {
  children: ReactNode;
  id: string;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ children, id }) => {
  const { openItems } = useAccordion();
  const isOpen = openItems.has(id);

  return (
    <div className={`accordion-item ${isOpen ? 'open' : ''}`}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { id, isOpen });
        }
        return child;
      })}
    </div>
  );
};

// Accordion Header Component
interface AccordionHeaderProps {
  children: ReactNode;
  id?: string;
  isOpen?: boolean;
}

const AccordionHeader: React.FC<AccordionHeaderProps> = ({ children, id, isOpen }) => {
  const { toggleItem } = useAccordion();

  if (!id) {
    throw new Error('AccordionHeader must be used within an AccordionItem');
  }

  return (
    <button
      className="accordion-header"
      onClick={() => toggleItem(id)}
      aria-expanded={isOpen}
      aria-controls={`accordion-content-${id}`}
    >
      <span className="accordion-header-text">{children}</span>
      <span className={`accordion-icon ${isOpen ? 'open' : ''}`}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 4l-4 4h8l-4-4z" />
        </svg>
      </span>
    </button>
  );
};

// Accordion Content Component
interface AccordionContentProps {
  children: ReactNode;
  id?: string;
  isOpen?: boolean;
}

const AccordionContent: React.FC<AccordionContentProps> = ({ children, id, isOpen }) => {
  if (!id) {
    throw new Error('AccordionContent must be used within an AccordionItem');
  }

  return (
    <div
      className={`accordion-content ${isOpen ? 'open' : ''}`}
      id={`accordion-content-${id}`}
      aria-hidden={!isOpen}
    >
      <div className="accordion-content-inner">
        {children}
      </div>
    </div>
  );
};

// Compound component assembly
const AccordionCompound = Object.assign(AccordionRoot, {
  Item: AccordionItem,
  Header: AccordionHeader,
  Content: AccordionContent,
});

// Main Demo Component
const Accordion: React.FC = () => {
  return (
    <div className="accordion-demo">
      <div className="demo-header">
        <h3>Accordion Component</h3>
        <p>Demonstrates the Compound Components pattern and advanced React patterns:</p>
      </div>

      <div className="pattern-explanation">
        <h4>React Patterns Demonstrated:</h4>
        <div className="patterns-grid">
          <div className="pattern-item">
            <strong>Compound Components:</strong>
            <p>Components that work together to form a cohesive UI element</p>
          </div>
          <div className="pattern-item">
            <strong>Context API:</strong>
            <p>Sharing state between compound components without prop drilling</p>
          </div>
          <div className="pattern-item">
            <strong>React.cloneElement:</strong>
            <p>Dynamically passing props to children components</p>
          </div>
          <div className="pattern-item">
            <strong>Custom Hooks:</strong>
            <p>useAccordion hook encapsulates context logic</p>
          </div>
          <div className="pattern-item">
            <strong>Accessibility:</strong>
            <p>Proper ARIA attributes and keyboard navigation</p>
          </div>
          <div className="pattern-item">
            <strong>Flexible API:</strong>
            <p>Support for single/multiple open items and default states</p>
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h4>Single Item Open (Default Behavior)</h4>
        <AccordionCompound defaultOpen={['item1']}>
          <AccordionCompound.Item id="item1">
            <AccordionCompound.Header>
              React Component Lifecycle
            </AccordionCompound.Header>
            <AccordionCompound.Content>
              <p>React components have three main phases in their lifecycle:</p>
              <ul>
                <li><strong>Mounting:</strong> When component is created and inserted into DOM</li>
                <li><strong>Updating:</strong> When component props or state changes</li>
                <li><strong>Unmounting:</strong> When component is removed from DOM</li>
              </ul>
              <p>Hooks like useEffect allow us to tap into these lifecycle events in functional components.</p>
            </AccordionCompound.Content>
          </AccordionCompound.Item>

          <AccordionCompound.Item id="item2">
            <AccordionCompound.Header>
              Higher-Order Components (HOCs)
            </AccordionCompound.Header>
            <AccordionCompound.Content>
              <p>HOCs are functions that take a component and return a new component with enhanced functionality:</p>
              <pre className="code-block">
{`const withLoading = (Component) => {
  return function WithLoadingComponent(props) {
    if (props.isLoading) {
      return <div>Loading...</div>;
    }
    return <Component {...props} />;
  };
};`}
              </pre>
              <p>Common use cases include authentication, logging, and data fetching.</p>
            </AccordionCompound.Content>
          </AccordionCompound.Item>

          <AccordionCompound.Item id="item3">
            <AccordionCompound.Header>
              Performance Optimization
            </AccordionCompound.Header>
            <AccordionCompound.Content>
              <p>Key performance optimization techniques in React:</p>
              <ul>
                <li><strong>React.memo:</strong> Prevents unnecessary re-renders of functional components</li>
                <li><strong>useMemo:</strong> Memoizes expensive calculations</li>
                <li><strong>useCallback:</strong> Memoizes function references</li>
                <li><strong>Code Splitting:</strong> Lazy loading with React.lazy and Suspense</li>
                <li><strong>Virtual DOM:</strong> Efficient reconciliation algorithm</li>
              </ul>
            </AccordionCompound.Content>
          </AccordionCompound.Item>
        </AccordionCompound>
      </div>

      <div className="demo-section">
        <h4>Multiple Items Open Allowed</h4>
        <AccordionCompound allowMultiple defaultOpen={['controls1', 'controls2']}>
          <AccordionCompound.Item id="controls1">
            <AccordionCompound.Header>
              Controlled vs Uncontrolled Components
            </AccordionCompound.Header>
            <AccordionCompound.Content>
              <p><strong>Controlled Components:</strong> Form elements whose value is controlled by React state</p>
              <p><strong>Uncontrolled Components:</strong> Form elements that maintain their own internal state</p>
              <div className="example-container">
                <p>This accordion is a controlled component - its state is managed by React!</p>
              </div>
            </AccordionCompound.Content>
          </AccordionCompound.Item>

          <AccordionCompound.Item id="controls2">
            <AccordionCompound.Header>
              Error Boundaries
            </AccordionCompound.Header>
            <AccordionCompound.Content>
              <p>Error boundaries catch JavaScript errors in component trees and display fallback UIs.</p>
              <p>They catch errors during:</p>
              <ul>
                <li>Rendering</li>
                <li>Lifecycle methods</li>
                <li>Constructors of the whole tree below them</li>
              </ul>
            </AccordionCompound.Content>
          </AccordionCompound.Item>

          <AccordionCompound.Item id="controls3">
            <AccordionCompound.Header>
              Render Props Pattern
            </AccordionCompound.Header>
            <AccordionCompound.Content>
              <p>A technique for sharing code between components using a prop whose value is a function.</p>
              <pre className="code-block">
{`<DataProvider render={data => (
  <h1>Hello {data.target}</h1>
)} />`}
              </pre>
            </AccordionCompound.Content>
          </AccordionCompound.Item>
        </AccordionCompound>
      </div>
    </div>
  );
};

export default Accordion;
