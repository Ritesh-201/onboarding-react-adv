import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  modalType?: 'simple' | 'form' | 'confirmation' | 'sidebar';
}

const ModalPortal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, modalType = 'simple' }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the modal
      setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.focus();
        }
      }, 0);

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll
      document.body.style.overflow = 'unset';
      
      // Restore focus to the previously focused element
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleTabKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isSidebar = modalType === 'sidebar';

  const modalContent = (
    <div className={`modal-overlay ${isSidebar ? 'modal-overlay-sidebar' : ''}`} onClick={onClose}>
      <div
        className={`modal-content ${isSidebar ? 'modal-content-sidebar' : ''}`}
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        <div className="modal-header">
          {title && <h2 id="modal-title" className="modal-title">{title}</h2>}
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// Main Modal Demo Component
const Modal: React.FC = memo(() => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'simple' | 'form' | 'confirmation' | 'sidebar'>('simple');

  const openModal = useCallback((type: 'simple' | 'form' | 'confirmation' | 'sidebar') => {
    setModalType(type);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const renderModalContent = useCallback(() => {
    switch (modalType) {
      case 'simple':
        return (
          <div>
            <p>This is a simple modal demonstrating:</p>
            <ul className="modal-features">
              <li>✓ Portal rendering (renders outside component tree)</li>
              <li>✓ Focus management (traps focus within modal)</li>
              <li>✓ Keyboard navigation (Escape to close, Tab cycling)</li>
              <li>✓ Accessibility (ARIA attributes, focus restoration)</li>
              <li>✓ Click outside to close</li>
            </ul>
          </div>
        );
      case 'form':
        return (
          <form className="modal-form" onSubmit={(e) => { e.preventDefault(); closeModal(); }}>
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input type="text" id="name" name="name" autoFocus />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input type="email" id="email" name="email" />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Submit</button>
              <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
            </div>
          </form>
        );
      case 'confirmation':
        return (
          <div className="confirmation-modal">
            <p>Are you sure you want to delete this item?</p>
            <div className="confirmation-actions">
              <button className="btn btn-primary" onClick={closeModal}>Yes, Delete</button>
              <button className="btn btn-outline" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        );
      case 'sidebar':
        return (
          <div className="sidebar-modal-content">
            <p>This is the sidebar modal</p>
          </div>
        );
      default:
        return null;
    }
  }, [modalType, closeModal]);

  return (
    <div className="modal-demo">
      <div className="demo-section">
        <h3>Modal Component Features</h3>
        <p>This modal demonstrates advanced React patterns and best practices:</p>
        
        <div className="demo-controls">
          <button className="btn btn-primary" onClick={() => openModal('simple')}>
            Simple Modal
          </button>
          <button className="btn btn-outline" onClick={() => openModal('form')}>
            Form Modal
          </button>
          <button className="btn btn-outline" onClick={() => openModal('confirmation')}>
            Confirmation Modal
          </button>
          <button className="btn btn-outline" onClick={() => openModal('sidebar')}>
            Sidebar Modal
          </button>
        </div>

        <div className="pattern-explanation">
          <h4>React Patterns Demonstrated:</h4>
          <div className="patterns-grid">
            <div className="pattern-item">
              <strong>Portal Pattern:</strong>
              <p>Using ReactDOM.createPortal to render modal outside component hierarchy</p>
            </div>
            <div className="pattern-item">
              <strong>Focus Management:</strong>
              <p>Proper focus trapping and restoration for accessibility</p>
            </div>
            <div className="pattern-item">
              <strong>Event Handling:</strong>
              <p>Keyboard events (Escape, Tab), click outside detection</p>
            </div>
            <div className="pattern-item">
              <strong>useEffect Cleanup:</strong>
              <p>Proper cleanup of event listeners and body styles</p>
            </div>
          </div>
        </div>
      </div>

      <ModalPortal
        isOpen={isModalOpen}
        onClose={closeModal}
        modalType={modalType}
        title={modalType === 'simple' ? 'Simple Modal' : 
               modalType === 'form' ? 'Form Modal' : 
               modalType === 'confirmation' ? 'Confirm Action' :
               modalType === 'sidebar' ? 'Sidebar Navigation' : ''}
      >
        {renderModalContent()}
      </ModalPortal>
    </div>
  );
});

export default Modal;
