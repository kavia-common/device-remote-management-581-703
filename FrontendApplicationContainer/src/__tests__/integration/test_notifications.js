import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ToastProvider } from '../../components/ToastProvider';
import useToast from '../../hooks/useToast';

// Test component that uses toast notifications
const NotificationTestComponent = () => {
  const { showToast } = useToast();

  return (
    <div>
      <button onClick={() => showToast('Success message', { type: 'success' })}>
        Show Success
      </button>
      <button onClick={() => showToast('Error message', { type: 'error' })}>
        Show Error
      </button>
      <button onClick={() => showToast('Warning message', { type: 'warning' })}>
        Show Warning
      </button>
      <button onClick={() => showToast('Info message', { type: 'info' })}>
        Show Info
      </button>
      <button onClick={() => showToast('Persistent message', { type: 'info', duration: 0 })}>
        Show Persistent
      </button>
      <button 
        onClick={() => {
          showToast('First message', { type: 'info' });
          showToast('Second message', { type: 'success' });
          showToast('Third message', { type: 'error' });
        }}
      >
        Show Multiple
      </button>
    </div>
  );
};

describe('Notifications Integration Tests', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  describe('Toast Display', () => {
    it('should display success toast notification', async () => {
      render(
        <ToastProvider>
          <NotificationTestComponent />
        </ToastProvider>
      );

      const button = screen.getByText('Show Success');
      
      act(() => {
        fireEvent.click(button);
      });

      await waitFor(() => {
        expect(screen.getByText('Success message')).toBeInTheDocument();
      });
      
      // Verify the toast type label is displayed (case-insensitive, within strong tag)
      const successLabel = screen.getByText((content, element) => {
        return element?.tagName === 'STRONG' && /^success$/i.test(content);
      });
      expect(successLabel).toBeInTheDocument();
    });

    it('should display error toast notification', async () => {
      render(
        <ToastProvider>
          <NotificationTestComponent />
        </ToastProvider>
      );

      const button = screen.getByText('Show Error');
      
      act(() => {
        fireEvent.click(button);
      });

      await waitFor(() => {
        expect(screen.getByText('Error message')).toBeInTheDocument();
      });
    });

    it('should display warning toast notification', async () => {
      render(
        <ToastProvider>
          <NotificationTestComponent />
        </ToastProvider>
      );

      const button = screen.getByText('Show Warning');
      
      act(() => {
        fireEvent.click(button);
      });

      await waitFor(() => {
        expect(screen.getByText('Warning message')).toBeInTheDocument();
      });
    });

    it('should display info toast notification', async () => {
      render(
        <ToastProvider>
          <NotificationTestComponent />
        </ToastProvider>
      );

      const button = screen.getByText('Show Info');
      
      act(() => {
        fireEvent.click(button);
      });

      await waitFor(() => {
        expect(screen.getByText('Info message')).toBeInTheDocument();
      });
    });
  });

  describe('Toast Auto-Dismiss', () => {
    it('should auto-dismiss toast after default duration', async () => {
      render(
        <ToastProvider>
          <NotificationTestComponent />
        </ToastProvider>
      );

      const button = screen.getByText('Show Success');
      
      act(() => {
        fireEvent.click(button);
      });

      await waitFor(() => {
        expect(screen.getByText('Success message')).toBeInTheDocument();
      });

      // Fast-forward time by 3000ms (default duration)
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(screen.queryByText('Success message')).not.toBeInTheDocument();
      });
    });

    it('should not auto-dismiss toast with duration 0', async () => {
      render(
        <ToastProvider>
          <NotificationTestComponent />
        </ToastProvider>
      );

      const button = screen.getByText('Show Persistent');
      
      act(() => {
        fireEvent.click(button);
      });

      await waitFor(() => {
        expect(screen.getByText('Persistent message')).toBeInTheDocument();
      });

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Should still be visible
      expect(screen.getByText('Persistent message')).toBeInTheDocument();
    });
  });

  describe('Toast Manual Dismiss', () => {
    it('should manually dismiss toast when close button is clicked', async () => {
      render(
        <ToastProvider>
          <NotificationTestComponent />
        </ToastProvider>
      );

      const button = screen.getByText('Show Success');
      
      act(() => {
        fireEvent.click(button);
      });

      await waitFor(() => {
        expect(screen.getByText('Success message')).toBeInTheDocument();
      });

      const dismissButton = screen.getByLabelText('Dismiss notification');
      
      act(() => {
        fireEvent.click(dismissButton);
      });

      await waitFor(() => {
        expect(screen.queryByText('Success message')).not.toBeInTheDocument();
      });
    });

    it('should dismiss specific toast from multiple toasts', async () => {
      render(
        <ToastProvider>
          <NotificationTestComponent />
        </ToastProvider>
      );

      const button = screen.getByText('Show Multiple');
      
      act(() => {
        fireEvent.click(button);
      });

      await waitFor(() => {
        expect(screen.getByText('First message')).toBeInTheDocument();
        expect(screen.getByText('Second message')).toBeInTheDocument();
        expect(screen.getByText('Third message')).toBeInTheDocument();
      });

      // Get all dismiss buttons
      const dismissButtons = screen.getAllByLabelText('Dismiss notification');
      
      // Dismiss the first toast
      act(() => {
        fireEvent.click(dismissButtons[0]);
      });

      await waitFor(() => {
        expect(screen.queryByText('First message')).not.toBeInTheDocument();
      });

      // Other toasts should still be visible
      expect(screen.getByText('Second message')).toBeInTheDocument();
      expect(screen.getByText('Third message')).toBeInTheDocument();
    });
  });

  describe('Multiple Toasts', () => {
    it('should display multiple toasts simultaneously', async () => {
      render(
        <ToastProvider>
          <NotificationTestComponent />
        </ToastProvider>
      );

      const button = screen.getByText('Show Multiple');
      
      act(() => {
        fireEvent.click(button);
      });

      await waitFor(() => {
        expect(screen.getByText('First message')).toBeInTheDocument();
        expect(screen.getByText('Second message')).toBeInTheDocument();
        expect(screen.getByText('Third message')).toBeInTheDocument();
      });
    });

    it('should respect maxToasts limit', async () => {
      render(
        <ToastProvider maxToasts={2}>
          <NotificationTestComponent />
        </ToastProvider>
      );

      const button = screen.getByText('Show Multiple');
      
      act(() => {
        fireEvent.click(button);
      });

      await waitFor(() => {
        expect(screen.getByText('Second message')).toBeInTheDocument();
        expect(screen.getByText('Third message')).toBeInTheDocument();
      });
      
      // Should only show last 2 toasts (due to maxToasts=2)
      expect(screen.queryByText('First message')).not.toBeInTheDocument();
    });

    it('should dismiss toasts in correct order with auto-dismiss', async () => {
      render(
        <ToastProvider>
          <NotificationTestComponent />
        </ToastProvider>
      );

      // Show first toast
      act(() => {
        fireEvent.click(screen.getByText('Show Success'));
      });
      
      await waitFor(() => {
        expect(screen.getByText('Success message')).toBeInTheDocument();
      });
      
      // Wait a bit
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Show second toast
      act(() => {
        fireEvent.click(screen.getByText('Show Error'));
      });

      await waitFor(() => {
        expect(screen.getByText('Error message')).toBeInTheDocument();
      });

      // Advance time to dismiss first toast (2000ms more = 3000ms total)
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.queryByText('Success message')).not.toBeInTheDocument();
      });

      // Second toast should still be visible
      expect(screen.getByText('Error message')).toBeInTheDocument();

      // Advance time to dismiss second toast
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.queryByText('Error message')).not.toBeInTheDocument();
      });
    });
  });

  describe('Toast Provider Behavior', () => {
    it('should render children correctly', () => {
      render(
        <ToastProvider>
          <div data-testid="child-component">Child Content</div>
        </ToastProvider>
      );

      expect(screen.getByTestId('child-component')).toBeInTheDocument();
      expect(screen.getByText('Child Content')).toBeInTheDocument();
    });

    it('should handle toasts container rendering', async () => {
      const { container } = render(
        <ToastProvider>
          <NotificationTestComponent />
        </ToastProvider>
      );

      // Show a toast to make container appear
      act(() => {
        fireEvent.click(screen.getByText('Show Success'));
      });

      await waitFor(() => {
        expect(screen.getByText('Success message')).toBeInTheDocument();
      });

      const toastContainer = container.querySelector('[aria-live="polite"]');
      expect(toastContainer).toBeInTheDocument();
      expect(toastContainer?.children.length).toBeGreaterThan(0);
    });

    it('should support renderInline prop', async () => {
      const { container } = render(
        <ToastProvider renderInline={false}>
          <NotificationTestComponent />
        </ToastProvider>
      );

      act(() => {
        fireEvent.click(screen.getByText('Show Success'));
      });

      // With renderInline=false, toasts should not be rendered in DOM
      await waitFor(() => {
        const toastContainer = container.querySelector('[aria-live="polite"]');
        expect(toastContainer).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', async () => {
      const { container } = render(
        <ToastProvider>
          <NotificationTestComponent />
        </ToastProvider>
      );

      act(() => {
        fireEvent.click(screen.getByText('Show Success'));
      });

      await waitFor(() => {
        const toastContainer = container.querySelector('[aria-live="polite"]');
        expect(toastContainer).toHaveAttribute('aria-live', 'polite');
        expect(toastContainer).toHaveAttribute('aria-atomic', 'true');
      });

      const toast = screen.getByRole('status');
      expect(toast).toBeInTheDocument();
    });

    it('should have accessible dismiss button', async () => {
      render(
        <ToastProvider>
          <NotificationTestComponent />
        </ToastProvider>
      );

      act(() => {
        fireEvent.click(screen.getByText('Show Success'));
      });

      await waitFor(() => {
        const dismissButton = screen.getByLabelText('Dismiss notification');
        expect(dismissButton).toBeInTheDocument();
        expect(dismissButton).toHaveAttribute('aria-label', 'Dismiss notification');
      });
    });
  });

  describe('Toast Return Value', () => {
    it('should return toast ID when showing toast', async () => {
      const TestComponent = () => {
        const { showToast } = useToast();
        const [toastId, setToastId] = React.useState(null);

        return (
          <div>
            <button onClick={() => setToastId(showToast('Test', { type: 'info' }))}>
              Show Toast
            </button>
            {toastId && <div data-testid="toast-id">{toastId}</div>}
          </div>
        );
      };

      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );

      act(() => {
        fireEvent.click(screen.getByText('Show Toast'));
      });

      await waitFor(() => {
        const toastIdElement = screen.getByTestId('toast-id');
        expect(toastIdElement).toBeInTheDocument();
        expect(toastIdElement.textContent).toMatch(/^\d+-[a-z0-9]{6}$/);
      });
    });
  });

  describe('Integration with Query Operations', () => {
    it('should show success toast after successful operation', async () => {
      const OperationComponent = () => {
        const { showToast } = useToast();

        const handleOperation = () => {
          // Simulate successful operation
          showToast('Operation completed successfully', { type: 'success' });
        };

        return <button onClick={handleOperation}>Execute Operation</button>;
      };

      render(
        <ToastProvider>
          <OperationComponent />
        </ToastProvider>
      );

      act(() => {
        fireEvent.click(screen.getByText('Execute Operation'));
      });

      await waitFor(() => {
        expect(screen.getByText('Operation completed successfully')).toBeInTheDocument();
      });
    });

    it('should show error toast after failed operation', async () => {
      const OperationComponent = () => {
        const { showToast } = useToast();

        const handleOperation = () => {
          // Simulate failed operation
          showToast('Operation failed: Network error', { type: 'error' });
        };

        return <button onClick={handleOperation}>Execute Operation</button>;
      };

      render(
        <ToastProvider>
          <OperationComponent />
        </ToastProvider>
      );

      act(() => {
        fireEvent.click(screen.getByText('Execute Operation'));
      });

      await waitFor(() => {
        expect(screen.getByText('Operation failed: Network error')).toBeInTheDocument();
      });
    });
  });
});
