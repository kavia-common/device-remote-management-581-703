import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the router and other dependencies for testing
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  BrowserRouter: ({ children }) => <div data-testid="mock-router">{children}</div>,
}));

jest.mock('@tanstack/react-query', () => ({
  QueryClient: jest.fn(() => ({})),
  QueryClientProvider: ({ children }) => <div data-testid="mock-query-provider">{children}</div>,
  useQuery: () => ({ data: null, isLoading: false, error: null }),
  useMutation: () => ({ mutate: jest.fn(), isPending: false, isError: false }),
}));

jest.mock('react-redux', () => ({
  Provider: ({ children }) => <div data-testid="mock-redux-provider">{children}</div>,
  useSelector: () => ({ 
    isAuthenticated: false, 
    loading: false, 
    user: null, 
    token: null 
  }),
  useDispatch: () => jest.fn(),
}));

test('renders App component without crashing', () => {
  render(<App />);
  
  // Check that the main provider components are rendered
  expect(screen.getByTestId('mock-redux-provider')).toBeInTheDocument();
  expect(screen.getByTestId('mock-query-provider')).toBeInTheDocument();
  expect(screen.getByTestId('mock-router')).toBeInTheDocument();
});

test('App component structure is correct', () => {
  const { container } = render(<App />);
  
  // Ensure the app renders without throwing errors
  expect(container).toBeInTheDocument();
});
