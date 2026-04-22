import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the document generator title', () => {
  render(<App />);
  expect(screen.getByText(/galene document generator/i)).toBeTruthy();
});
