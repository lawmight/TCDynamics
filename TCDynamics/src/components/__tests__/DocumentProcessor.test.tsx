import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import DocumentProcessor from '../DocumentProcessor'

describe('DocumentProcessor Component', () => {
  it('should render document upload interface', () => {
    render(<DocumentProcessor />)

    expect(screen.getByText(/Traitement de documents/i)).toBeInTheDocument()
    expect(
      screen.getByText(/Glissez-déposez vos fichiers/i)
    ).toBeInTheDocument()
  })

  it('should show supported file types', () => {
    render(<DocumentProcessor />)

    expect(screen.getByText(/PDF, JPG, PNG/i)).toBeInTheDocument()
  })

  it('should have file input', () => {
    render(<DocumentProcessor />)

    const fileInput = screen.getByTestId('file-input')
    expect(fileInput).toBeInTheDocument()
    expect(fileInput).toHaveAttribute('type', 'file')
    expect(fileInput).toHaveAttribute('accept', '.pdf,.jpg,.jpeg,.png')
  })

  it('should handle file selection', () => {
    render(<DocumentProcessor />)

    const fileInput = screen.getByTestId('file-input')
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })

    fireEvent.change(fileInput, { target: { files: [file] } })

    expect(screen.getByText('test.pdf')).toBeInTheDocument()
  })

  it('should show upload progress', async () => {
    render(<DocumentProcessor />)

    const fileInput = screen.getByTestId('file-input')
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })

    fireEvent.change(fileInput, { target: { files: [file] } })

    const processButton = screen.getByText(/Traiter le document/i)
    fireEvent.click(processButton)

    await waitFor(() => {
      expect(screen.getByText(/Traitement en cours/i)).toBeInTheDocument()
    })
  })

  it('should display processing results', async () => {
    render(<DocumentProcessor />)

    const fileInput = screen.getByTestId('file-input')
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })

    fireEvent.change(fileInput, { target: { files: [file] } })

    const processButton = screen.getByText(/Traiter le document/i)
    fireEvent.click(processButton)

    await waitFor(
      () => {
        expect(screen.getByText(/Résultats de l'analyse/i)).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })

  it('should show extracted data', async () => {
    render(<DocumentProcessor />)

    const fileInput = screen.getByTestId('file-input')
    const file = new File(['test'], 'invoice.pdf', { type: 'application/pdf' })

    fireEvent.change(fileInput, { target: { files: [file] } })

    const processButton = screen.getByText(/Traiter le document/i)
    fireEvent.click(processButton)

    await waitFor(
      () => {
        expect(screen.getByText(/Numéro de facture/i)).toBeInTheDocument()
        expect(screen.getByText(/INV-2024-001/i)).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })

  it('should handle file validation', () => {
    render(<DocumentProcessor />)

    const fileInput = screen.getByTestId('file-input')
    const invalidFile = new File(['test'], 'test.exe', {
      type: 'application/x-msdownload',
    })

    fireEvent.change(fileInput, { target: { files: [invalidFile] } })

    expect(
      screen.getByText(/Type de fichier non supporté/i)
    ).toBeInTheDocument()
  })

  it('should show file size validation', () => {
    render(<DocumentProcessor />)

    const fileInput = screen.getByTestId('file-input')
    // Create a large file (over 10MB)
    const largeFile = new File(
      [new ArrayBuffer(11 * 1024 * 1024)],
      'large.pdf',
      { type: 'application/pdf' }
    )

    fireEvent.change(fileInput, { target: { files: [largeFile] } })

    expect(screen.getByText(/Fichier trop volumineux/i)).toBeInTheDocument()
  })

  it('should allow multiple file uploads', () => {
    render(<DocumentProcessor />)

    const fileInput = screen.getByTestId('file-input')
    const files = [
      new File(['test1'], 'test1.pdf', { type: 'application/pdf' }),
      new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
    ]

    fireEvent.change(fileInput, { target: { files } })

    expect(screen.getByText('test1.pdf')).toBeInTheDocument()
    expect(screen.getByText('test2.jpg')).toBeInTheDocument()
  })

  it('should have accessibility features', () => {
    render(<DocumentProcessor />)

    const dropzone = screen.getByTestId('dropzone')
    expect(dropzone).toHaveAttribute('role', 'button')
    expect(dropzone).toHaveAttribute('aria-label')
  })

  it('should handle drag and drop', () => {
    render(<DocumentProcessor />)

    const dropzone = screen.getByTestId('dropzone')
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })

    fireEvent.dragOver(dropzone)
    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [file],
      },
    })

    expect(screen.getByText('test.pdf')).toBeInTheDocument()
  })

  it('should show confidence scores', async () => {
    render(<DocumentProcessor />)

    const fileInput = screen.getByTestId('file-input')
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })

    fireEvent.change(fileInput, { target: { files: [file] } })

    const processButton = screen.getByText(/Traiter le document/i)
    fireEvent.click(processButton)

    await waitFor(
      () => {
        expect(screen.getByText(/Confiance/i)).toBeInTheDocument()
        expect(screen.getByText(/95%/i)).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })
})
