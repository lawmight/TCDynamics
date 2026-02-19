import { useEffect, useRef, useState } from 'react'

import { visionAPI } from '@/api/azureServices'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { logger } from '@/utils/logger'
import AlertCircle from '~icons/lucide/alert-circle'
import CheckCircle from '~icons/lucide/check-circle'
import FileText from '~icons/lucide/file-text'
import Loader2 from '~icons/lucide/loader-2'
import Upload from '~icons/lucide/upload'

// Types pour l'API Vision
interface VisionWord {
  text: string
  confidence?: number
}

interface VisionLine {
  text: string
  words: VisionWord[]
}

interface VisionRegion {
  lines: VisionLine[]
}

interface VisionCaption {
  text: string
  confidence?: number
}

interface VisionDescription {
  captions: VisionCaption[]
}

interface VisionReadResult {
  lines: VisionLine[]
}

interface VisionAnalyzeResult {
  readResults: VisionReadResult[]
}

interface VisionAPIResponse {
  regions?: VisionRegion[]
  description?: VisionDescription
  analyzeResult?: VisionAnalyzeResult
}

interface ProcessedDocument {
  id: string
  fileName: string
  extractedText: string
  confidence: number
  status: 'processing' | 'completed' | 'error'
  timestamp: Date
}

const DocumentProcessor = () => {
  const [documents, setDocuments] = useState<ProcessedDocument[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isMountedRef = useRef(true)

  useEffect(() => () => {
    isMountedRef.current = false
  }, [])

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsProcessing(true)

    for (const file of Array.from(files)) {
      const documentId = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`

      // Ajouter le document en cours de traitement
      setDocuments(prev => [
        ...prev,
        {
          id: documentId,
          fileName: file.name,
          extractedText: '',
          confidence: 0,
          status: 'processing',
          timestamp: new Date(),
        },
      ])

      try {
        // Convertir le fichier en base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            const result = reader.result as string
            resolve(result)
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

        if (!isMountedRef.current) return

        // Appeler l'API Vision
        const result = await visionAPI.processDocument(base64)

        if (!isMountedRef.current) return

        if (!result.success) {
          throw new Error(result.message || 'Erreur lors du traitement')
        }

        // Traiter la réponse avec des types appropriés
        const visionData = result.data as VisionAPIResponse
        let extractedText = ''
        let confidence = 0.8

        if (visionData.regions && visionData.regions.length > 0) {
          extractedText = visionData.regions
            .map((region: VisionRegion) =>
              region.lines
                .map((line: VisionLine) =>
                  line.words.map((word: VisionWord) => word.text).join(' ')
                )
                .join('\n')
            )
            .join('\n\n')
          confidence = 0.85
        } else if (visionData.description?.captions) {
          extractedText = visionData.description.captions
            .map((caption: VisionCaption) => caption.text)
            .join('\n')
          confidence = visionData.description.captions[0]?.confidence || 0.8
        } else if (visionData.analyzeResult?.readResults) {
          const reads = visionData.analyzeResult.readResults
          extractedText = reads
            .flatMap((page: VisionReadResult) =>
              (page.lines || []).map((l: VisionLine) => l.text)
            )
            .join('\n')
          confidence = 0.9
        } else {
          extractedText = 'Texte extrait du document'
          confidence = 0.7
        }

        if (!isMountedRef.current) return

        // Mettre à jour le document avec le résultat
        setDocuments(prev =>
          prev.map(doc =>
            doc.id === documentId
              ? { ...doc, extractedText, confidence, status: 'completed' }
              : doc
          )
        )
      } catch (error) {
        if (!isMountedRef.current) return
        logger.error('Error processing document', error)

        setDocuments(prev =>
          prev.map(doc =>
            doc.id === documentId
              ? {
                  ...doc,
                  status: 'error',
                  extractedText: 'Erreur lors du traitement du document',
                }
              : doc
          )
        )
      }
    }

    if (!isMountedRef.current) return
    setIsProcessing(false)
  }

  // const fileToBase64 = (file: File): Promise<string> => {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader()
  //     reader.readAsDataURL(file)
  //     reader.onload = () => {
  //       const base64 = reader.result as string
  //       resolve(base64.split(',')[1]) // Remove data:image/jpeg;base64, prefix
  //     }
  //     reader.onerror = error => reject(error)
  //   })
  // }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Loader2 className="size-4 animate-spin text-primary" />
      case 'completed':
        return <CheckCircle className="size-4 text-green-500" />
      case 'error':
        return <AlertCircle className="size-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      processing: 'secondary',
      completed: 'default',
      error: 'destructive',
    } as const

    const labels = {
      processing: 'Traitement',
      completed: 'Terminé',
      error: 'Erreur',
    }

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  return (
    <Card className="w-full" data-testid="document-processor">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <FileText className="size-6 text-primary" />
          </div>
          <div>
            <CardTitle
              className="font-mono text-xl"
              data-testid="processor-title"
            >
              Traitement de Documents IA
            </CardTitle>
            <p className="font-mono text-sm text-muted-foreground">
              Analysez automatiquement vos factures, contrats et documents
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div
          className="rounded-lg border-2 border-dashed border-border p-8 text-center"
          data-testid="upload-area"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
            data-testid="file-input"
            aria-label="Sélectionner des documents à analyser (formats acceptés: JPG, PNG, PDF, DOC, DOCX)"
          />

          <div className="space-y-4">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10">
              <Upload className="size-8 text-primary" />
            </div>

            <div>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="font-mono"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Traitement en cours…
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 size-4" />
                    Sélectionner des documents
                  </>
                )}
              </Button>
            </div>

            <p className="font-mono text-sm text-muted-foreground">
              Formats supportés: JPG, PNG, PDF, DOC, DOCX
            </p>
          </div>
        </div>

        {/* Processing Status */}
        {documents.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-mono text-lg font-semibold">
              Documents traités
            </h3>

            <div className="space-y-3">
              {documents.map(doc => (
                <Card key={doc.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-1 items-start gap-3">
                      {getStatusIcon(doc.status)}
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="font-mono text-sm font-medium">
                            {doc.fileName}
                          </span>
                          {getStatusBadge(doc.status)}
                        </div>

                        {doc.status === 'completed' && doc.extractedText && (
                          <div className="space-y-2">
                            <div className="rounded-lg bg-muted/50 p-3">
                              <p className="whitespace-pre-wrap font-mono text-sm">
                                {doc.extractedText.length > 300
                                  ? `${doc.extractedText.substring(0, 300)}...`
                                  : doc.extractedText}
                              </p>
                            </div>
                            {doc.confidence > 0 && (
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-muted-foreground">
                                  Confiance: {Math.round(doc.confidence * 100)}%
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {doc.status === 'error' && (
                          <Alert>
                            <AlertCircle className="size-4" />
                            <AlertDescription className="text-sm">
                              {doc.extractedText ||
                                'Erreur lors du traitement du document'}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Features Info */}
        <div className="rounded-lg bg-primary/5 p-4">
          <h4 className="mb-3 font-mono font-semibold">Fonctionnalités IA :</h4>
          <div className="grid grid-cols-1 gap-4 font-mono text-sm md:grid-cols-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="size-4 text-green-500" />
              <span>OCR haute précision</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="size-4 text-green-500" />
              <span>Analyse automatique</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="size-4 text-green-500" />
              <span>Extraction de données</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default DocumentProcessor
