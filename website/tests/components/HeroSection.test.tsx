import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeroSection } from '@/components/sections/HeroSection';

describe('HeroSection', () => {
  it('should render hero heading', () => {
    render(<HeroSection />);
    expect(screen.getByText(/jakoscia wody/i)).toBeInTheDocument();
  });

  it('should render description', () => {
    render(<HeroSection />);
    expect(screen.getByText(/Brunatna woda z kranu/i)).toBeInTheDocument();
  });

  it('should render CTA buttons', () => {
    render(<HeroSection />);
    expect(screen.getByText('Zglos problem')).toBeInTheDocument();
    expect(screen.getByText('Zobacz mape zgloszen')).toBeInTheDocument();
  });
});
