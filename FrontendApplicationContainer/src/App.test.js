import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login UI with heading and Sign In button', () => {
  // Render the App and verify that the login screen elements are present
  render(<App />);

  // Check for main heading of the app on the login page
  expect(
    screen.getByRole('heading', { name: /device remote management/i })
  ).toBeInTheDocument();

  // Check for the Sign In section heading
  expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();

  // Check for the primary Sign In button by role and accessible name
  expect(
    screen.getByRole('button', { name: /sign in/i })
  ).toBeInTheDocument();

  // Check that the email and password fields are rendered
  expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
});
