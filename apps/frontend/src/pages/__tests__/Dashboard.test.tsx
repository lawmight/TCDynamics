import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import Dashboard from '../Dashboard'

const mockUseQuery = vi.fn()

vi.mock('@tanstack/react-query', () => ({
  useQuery: (options: unknown) => mockUseQuery(options),
}))

vi.mock('@/api/metrics', () => ({
  fetchMetricsOverview: vi.fn(),
}))

describe('Dashboard page', () => {
  const renderDashboard = () =>
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    )

  it('shows guidance when no project is configured', () => {
    localStorage.removeItem('rum.projectId:v1')
    mockUseQuery.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
    })

    renderDashboard()

    expect(
      screen.getByRole('heading', { name: /Aucun projet configuré/i })
    ).toBeInTheDocument()
  })

  it('renders metrics cards when data is available', () => {
    localStorage.setItem('rum.projectId:v1', 'project-123')
    mockUseQuery.mockReturnValue({
      data: {
        results: {
          LCP: { p75: 123.4 },
          INP: { p75: 230.2 },
          CLS: { p75: 0.12345 },
          FCP: { p75: 456.7 },
        },
      },
      isLoading: false,
      isError: false,
    })

    renderDashboard()

    expect(
      screen.getByRole('heading', { name: /Tableau de bord performance/i })
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/p75 LCP/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/p75 CLS/i)).toBeInTheDocument()
  })
})
