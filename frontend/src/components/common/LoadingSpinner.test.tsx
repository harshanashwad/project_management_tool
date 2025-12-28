import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('renders without crashing', () => {
    render(<LoadingSpinner />);
    const spinner = document.querySelector('svg.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('displays text when provided', () => {
    render(<LoadingSpinner text="Loading data..." />);
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('does not display text when not provided', () => {
    render(<LoadingSpinner />);
    const text = screen.queryByText(/loading/i);
    expect(text).not.toBeInTheDocument();
  });

  it('applies correct size class for small spinner', () => {
    render(<LoadingSpinner size="sm" />);
    const spinner = document.querySelector('svg');
    expect(spinner?.getAttribute('class')).toContain('h-4');
  });

  it('applies correct size class for large spinner', () => {
    render(<LoadingSpinner size="lg" />);
    const spinner = document.querySelector('svg');
    expect(spinner?.getAttribute('class')).toContain('h-12');
  });

  it('renders fullPage overlay when fullPage is true', () => {
    const { container } = render(<LoadingSpinner fullPage />);
    const overlay = container.querySelector('.fixed.inset-0');
    expect(overlay).toBeInTheDocument();
  });

  it('does not render fullPage overlay by default', () => {
    const { container } = render(<LoadingSpinner />);
    const overlay = container.querySelector('.fixed.inset-0');
    expect(overlay).not.toBeInTheDocument();
  });
});
