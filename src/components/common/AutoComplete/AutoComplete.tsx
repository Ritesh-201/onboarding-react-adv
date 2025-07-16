import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useDebounce } from '../../../hooks/useDebounce';
import './AutoComplete.css';

interface Option {
  id: string;
  label: string;
  category?: string;
  description?: string;
}

interface AutoCompleteProps {
  options: Option[];
  onSelect: (option: Option) => void;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  renderOption?: (option: Option) => React.ReactNode;
  filterFunction?: (options: Option[], query: string) => Option[];
  minQueryLength?: number;
  maxResults?: number;
  debounceMs?: number;
  showDebounceIndicator?: boolean;
}

// Main AutoComplete Component
const AutoCompleteComponent: React.FC<AutoCompleteProps> = ({
  options,
  onSelect,
  placeholder = "Search...",
  value = "",
  onChange,
  renderOption,
  filterFunction,
  minQueryLength = 1,
  maxResults = 10,
  debounceMs = 300,
  showDebounceIndicator = false
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [isDebouncing, setIsDebouncing] = useState(false);
  
  const debouncedQuery = useDebounce(inputValue, debounceMs);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Track debouncing state
  useEffect(() => {
    if (inputValue !== debouncedQuery) {
      setIsDebouncing(true);
    } else {
      setIsDebouncing(false);
    }
  }, [inputValue, debouncedQuery]);

  // Enhanced default filter function with highlighting
  const defaultFilter = useCallback((opts: Option[], query: string): Option[] => {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase();
    const filtered = opts.filter(option => {
      const labelMatch = option.label.toLowerCase().includes(searchTerm);
      const categoryMatch = option.category?.toLowerCase().includes(searchTerm);
      const descriptionMatch = option.description?.toLowerCase().includes(searchTerm);
      return labelMatch || categoryMatch || descriptionMatch;
    });

    // Sort by relevance - exact matches first, then starts with, then contains
    return filtered.sort((a, b) => {
      const aLabel = a.label.toLowerCase();
      const bLabel = b.label.toLowerCase();
      
      if (aLabel === searchTerm) return -1;
      if (bLabel === searchTerm) return 1;
      if (aLabel.startsWith(searchTerm) && !bLabel.startsWith(searchTerm)) return -1;
      if (bLabel.startsWith(searchTerm) && !aLabel.startsWith(searchTerm)) return 1;
      
      return aLabel.localeCompare(bLabel);
    }).slice(0, maxResults);
  }, [maxResults]);

  // Filter options based on debounced query
  const filteredOptions = useMemo(() => {
    if (debouncedQuery.length < minQueryLength) return [];
    
    const filterFn = filterFunction || defaultFilter;
    return filterFn(options, debouncedQuery);
  }, [debouncedQuery, options, filterFunction, defaultFilter, minQueryLength]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
    setHighlightedIndex(-1);
    setSelectedOption(null);
    onChange?.(newValue);
  };

  // Handle option selection
  const handleOptionSelect = (option: Option) => {
    setInputValue(option.label);
    setSelectedOption(option);
    setIsOpen(false);
    setHighlightedIndex(-1);
    onSelect(option);
    onChange?.(option.label);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        return;
      }
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleOptionSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [highlightedIndex]);

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Highlight matching text in options
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <mark key={index} className="highlight">{part}</mark> : part
    );
  };

  return (
    <div className="autocomplete-container">
      <div className="autocomplete-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`autocomplete-input ${isDebouncing ? 'debouncing' : ''}`}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          autoComplete="off"
        />
        
        {showDebounceIndicator && isDebouncing && (
          <div className="debounce-indicator">
            <span className="debounce-spinner"></span>
            Searching...
          </div>
        )}
        
        {selectedOption && !isDebouncing && (
          <div className="autocomplete-status">
            ✓ Selected: {selectedOption.label}
          </div>
        )}
      </div>

      {isOpen && filteredOptions.length > 0 && !isDebouncing && (
        <ul
          ref={listRef}
          className="autocomplete-dropdown"
          role="listbox"
        >
          {filteredOptions.map((option, index) => (
            <li
              key={option.id}
              className={`autocomplete-option ${index === highlightedIndex ? 'highlighted' : ''}`}
              onClick={() => handleOptionSelect(option)}
              role="option"
              aria-selected={index === highlightedIndex}
            >
              {renderOption ? renderOption(option) : (
                <div className="option-content">
                  <div className="option-main">
                    <span className="option-label">
                      {highlightText(option.label, debouncedQuery)}
                    </span>
                    {option.category && (
                      <span className="option-category">
                        {highlightText(option.category, debouncedQuery)}
                      </span>
                    )}
                  </div>
                  {option.description && (
                    <div className="option-description">
                      {highlightText(option.description, debouncedQuery)}
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {isOpen && debouncedQuery.length >= minQueryLength && filteredOptions.length === 0 && !isDebouncing && (
        <div className="autocomplete-no-results">
          No results found for "{debouncedQuery}"
        </div>
      )}

      {isOpen && isDebouncing && showDebounceIndicator && (
        <div className="autocomplete-loading">
          <div className="loading-spinner"></div>
          Debouncing search...
        </div>
      )}
    </div>
  );
};

// Enhanced demo data with descriptions
const programmingLanguages: Option[] = [
  { id: '1', label: 'JavaScript', category: 'Programming Language', description: 'Dynamic programming language for web development' },
  { id: '2', label: 'TypeScript', category: 'Programming Language', description: 'JavaScript with static type definitions' },
  { id: '3', label: 'Python', category: 'Programming Language', description: 'High-level programming language for AI and web development' },
  { id: '4', label: 'Java', category: 'Programming Language', description: 'Object-oriented programming language for enterprise applications' },
  { id: '5', label: 'C++', category: 'Programming Language', description: 'Systems programming language with object-oriented features' },
  { id: '6', label: 'React', category: 'Frontend Framework', description: 'JavaScript library for building user interfaces' },
  { id: '7', label: 'Vue.js', category: 'Frontend Framework', description: 'Progressive JavaScript framework for building UIs' },
  { id: '8', label: 'Angular', category: 'Frontend Framework', description: 'Platform for building mobile and desktop web applications' },
  { id: '9', label: 'Node.js', category: 'Backend Runtime', description: 'JavaScript runtime built on Chrome V8 engine' },
  { id: '10', label: 'Express.js', category: 'Backend Framework', description: 'Fast, unopinionated web framework for Node.js' },
  { id: '11', label: 'MongoDB', category: 'Database', description: 'Document-oriented NoSQL database program' },
  { id: '12', label: 'PostgreSQL', category: 'Database', description: 'Open source relational database management system' },
  { id: '13', label: 'Redis', category: 'Database', description: 'In-memory data structure store and cache' },
  { id: '14', label: 'Docker', category: 'DevOps Tool', description: 'Platform for developing, shipping, and running applications' },
  { id: '15', label: 'Kubernetes', category: 'DevOps Tool', description: 'Container orchestration platform for automating deployment' },
  { id: '16', label: 'Next.js', category: 'Frontend Framework', description: 'React framework for production applications' },
  { id: '17', label: 'GraphQL', category: 'API Technology', description: 'Query language and runtime for APIs' },
  { id: '18', label: 'REST API', category: 'API Technology', description: 'Architectural style for distributed hypermedia systems' },
  { id: '19', label: 'Webpack', category: 'Build Tool', description: 'Static module bundler for JavaScript applications' },
  { id: '20', label: 'Vite', category: 'Build Tool', description: 'Fast build tool and development server' }
];

// Fast filter function for instant results
const instantFilter = (options: Option[], query: string): Option[] => {
  if (!query.trim()) return [];
  
  const searchTerm = query.toLowerCase();
  return options
    .filter(option => 
      option.label.toLowerCase().includes(searchTerm) ||
      option.category?.toLowerCase().includes(searchTerm)
    )
    .slice(0, 8);
};

// Slow filter function to simulate API calls
const slowFilter = (options: Option[], query: string): Option[] => {
  if (!query.trim()) return [];
  
  // Simulate processing time
  const start = Date.now();
  while (Date.now() - start < 100) {} // 100ms delay
  
  const searchTerm = query.toLowerCase();
  return options
    .filter(option => 
      option.label.toLowerCase().includes(searchTerm) ||
      option.category?.toLowerCase().includes(searchTerm) ||
      option.description?.toLowerCase().includes(searchTerm)
    )
    .sort((a, b) => a.label.localeCompare(b.label))
    .slice(0, 6);
};

// Main Demo Component
const AutoComplete: React.FC = () => {
  const [selectedTech, setSelectedTech] = useState<Option | null>(null);
  const [selectedInstant, setSelectedInstant] = useState<Option | null>(null);
  const [selectedDebounced, setSelectedDebounced] = useState<Option | null>(null);

  return (
    <div className="autocomplete-demo">
      <div className="demo-header">
        <h3>AutoComplete Component</h3>
        <p>Demonstrates debouncing, filtering performance, and advanced input handling:</p>
      </div>

      <div className="pattern-explanation">
        <h4>React Patterns & Performance Techniques:</h4>
        <div className="patterns-grid">
          <div className="pattern-item">
            <strong>Debounced Search:</strong>
            <p>useDebounce hook prevents excessive API calls and filtering operations</p>
          </div>
          <div className="pattern-item">
            <strong>Instant Filtering:</strong>
            <p>Fast client-side filtering for immediate feedback</p>
          </div>
          <div className="pattern-item">
            <strong>Text Highlighting:</strong>
            <p>Visual feedback showing matched search terms</p>
          </div>
          <div className="pattern-item">
            <strong>useMemo Optimization:</strong>
            <p>Memoized filtering to prevent unnecessary recalculations</p>
          </div>
          <div className="pattern-item">
            <strong>Keyboard Navigation:</strong>
            <p>Full accessibility with arrow keys, enter, and escape</p>
          </div>
          <div className="pattern-item">
            <strong>Loading States:</strong>
            <p>Visual indicators for debouncing and search states</p>
          </div>
        </div>
      </div>

      <div className="demo-examples">
        <div className="example-section">
          <h4>1. Instant Filtering (No Debounce)</h4>
          <p>Immediate results as you type - good for small datasets:</p>
          <AutoCompleteComponent
            options={programmingLanguages}
            onSelect={setSelectedInstant}
            placeholder="Type to search instantly..."
            debounceMs={0}
            filterFunction={instantFilter}
            maxResults={8}
          />
          {selectedInstant && (
            <div className="selection-display">
              ✓ Selected: <strong>{selectedInstant.label}</strong>
            </div>
          )}
        </div>

        <div className="example-section">
          <h4>2. Debounced Search (300ms delay)</h4>
          <p>Waits 300ms after you stop typing - optimized for performance:</p>
          <AutoCompleteComponent
            options={programmingLanguages}
            onSelect={setSelectedDebounced}
            placeholder="Type and pause to see debouncing..."
            debounceMs={300}
            showDebounceIndicator={true}
            maxResults={6}
          />
          {selectedDebounced && (
            <div className="selection-display">
              ✓ Selected: <strong>{selectedDebounced.label}</strong>
            </div>
          )}
        </div>

        <div className="example-section">
          <h4>3. Heavy Processing with Debouncing</h4>
          <p>Simulates slow API calls - shows importance of debouncing:</p>
          <AutoCompleteComponent
            options={programmingLanguages}
            onSelect={setSelectedTech}
            placeholder="Simulates slow API calls..."
            debounceMs={500}
            filterFunction={slowFilter}
            showDebounceIndicator={true}
            minQueryLength={2}
          />
          {selectedTech && (
            <div className="selection-display">
              ✓ Selected: <strong>{selectedTech.label}</strong> - {selectedTech.description}
            </div>
          )}
        </div>

        <div className="comparison-section">
          <h4>Performance Comparison:</h4>
          <div className="comparison-grid">
            <div className="comparison-item">
              <h5>Without Debouncing:</h5>
              <ul>
                <li>• Filters on every keystroke</li>
                <li>• Can cause performance issues</li>
                <li>• Good for small, local datasets</li>
                <li>• Immediate visual feedback</li>
              </ul>
            </div>
            <div className="comparison-item">
              <h5>With Debouncing (300ms):</h5>
              <ul>
                <li>• Waits until user stops typing</li>
                <li>• Reduces API calls by ~80%</li>
                <li>• Essential for remote data</li>
                <li>• Better battery life on mobile</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="features-list">
          <h4>Features Demonstrated:</h4>
          <ul>
            <li>✓ Debounced vs instant search comparison</li>
            <li>✓ Text highlighting for matched terms</li>
            <li>✓ Loading and debouncing indicators</li>
            <li>✓ Keyboard navigation with visual feedback</li>
            <li>✓ Performance optimization with useMemo</li>
            <li>✓ Relevance-based sorting (exact → starts with → contains)</li>
            <li>✓ Multi-field search (label, category, description)</li>
            <li>✓ Accessibility support (ARIA attributes)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AutoComplete;