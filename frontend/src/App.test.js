import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the main navigation', () => {
  render(<App />);
  const navElement = screen.getByRole('navigation');
  expect(navElement).toBeInTheDocument();
});
