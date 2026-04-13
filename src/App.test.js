import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the quote-to-payment workflow title', () => {
  render(<App />);
  expect(screen.getByText(/quote-to-payment workflow/i)).toBeTruthy();
});
