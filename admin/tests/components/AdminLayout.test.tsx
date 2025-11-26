import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';

describe('AdminLayout', () => {
  it('should render admin panel title', () => {
    render(
      <MemoryRouter>
        <AdminLayout />
      </MemoryRouter>
    );
    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    expect(screen.getByText('Cola z Kranu')).toBeInTheDocument();
  });

  it('should render navigation items', () => {
    render(
      <MemoryRouter>
        <AdminLayout />
      </MemoryRouter>
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Zgloszenia')).toBeInTheDocument();
    expect(screen.getByText('Statystyki')).toBeInTheDocument();
  });
});
