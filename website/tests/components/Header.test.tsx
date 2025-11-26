import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '@/components/layout/Header';

describe('Header', () => {
  it('should render logo', () => {
    render(<Header />);
    expect(screen.getByText('Cola z Kranu')).toBeInTheDocument();
  });

  it('should render navigation links', () => {
    render(<Header />);
    expect(screen.getByText('Zglos problem')).toBeInTheDocument();
    expect(screen.getByText('Mapa')).toBeInTheDocument();
    expect(screen.getByText('Statystyki')).toBeInTheDocument();
    expect(screen.getByText('O projekcie')).toBeInTheDocument();
  });

  it('should call scrollIntoView on click', () => {
    const scrollIntoViewMock = vi.fn();
    const getElementByIdMock = vi.fn(() => ({
      scrollIntoView: scrollIntoViewMock,
    }));
    vi.spyOn(document, 'getElementById').mockImplementation(getElementByIdMock as any);

    render(<Header />);
    const button = screen.getAllByText('Zglos problem')[0];
    fireEvent.click(button);

    expect(getElementByIdMock).toHaveBeenCalledWith('report');
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });
  });
});
