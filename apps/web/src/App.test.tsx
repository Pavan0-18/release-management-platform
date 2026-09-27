import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Smoke Test', () => {
  it('renders the application title and releases layout', () => {
    render(<App />);
    const titleElements = screen.getAllByText(/Release Management Platform/i);
    expect(titleElements.length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Releases/i).length).toBeGreaterThan(0);
  });
});
