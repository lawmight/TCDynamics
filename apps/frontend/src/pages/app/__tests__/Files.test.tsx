import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import Files from '../Files'

vi.mock('@/api/files', () => ({
  listKnowledgeFiles: vi.fn().mockResolvedValue([
    {
      id: '1',
      name: 'doc.pdf',
      path: 'uploads/doc.pdf',
      size: 1024,
      mimeType: 'application/pdf',
      summary: 'Sample summary',
    },
  ]),
  uploadKnowledgeFile: vi.fn(),
}))

vi.mock('@/api/analytics', () => ({
  recordEvent: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { email: 'tester@example.com' }, loading: false }),
}))

describe('Files page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists uploaded knowledge files', async () => {
    render(<Files />)

    expect(await screen.findByText(/doc.pdf/)).toBeInTheDocument()
    expect(screen.getByText(/Indexed/)).toBeInTheDocument()
  })
})
