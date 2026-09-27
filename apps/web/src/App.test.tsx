import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Smoke Test', () => {
  it('renders the application title and landing page layout', () => {
    render(<App />);
    const titleElements = screen.getAllByText(/Release Management Platform/i);
    expect(titleElements.length).toBeGreaterThan(0);
    expect(screen.getByText(/Frontend is running/i)).toBeDefined();
  });
});
