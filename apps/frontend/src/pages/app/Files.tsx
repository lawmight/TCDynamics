import { useEffect, useState } from 'react'

import { recordEvent } from '@/api/analytics'
import {
  listKnowledgeFiles,
  uploadKnowledgeFile,
  type KnowledgeFile,
} from '@/api/files'
import { CelebrationModal } from '@/components/app/CelebrationModal'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useMilestoneDetection } from '@/hooks/useMilestoneDetection'
import type { UserMilestoneState } from '@/utils/celebrations'
import CloudUpload from '~icons/lucide/cloud-upload'
import FileText from '~icons/lucide/file-text'
import RefreshCcw from '~icons/lucide/refresh-ccw'

const Files = () => {
  const [files, setFiles] = useState<KnowledgeFile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [hasUploadedFirst, setHasUploadedFirst] = useState(false)

  // Milestone detection for first document upload
  const userMilestoneState: UserMilestoneState = {
    onboardingCompleted: false,
    firstWorkflowCreatedAt: undefined,
    firstDocumentUploadedAt: hasUploadedFirst
      ? new Date().toISOString()
      : undefined,
    workflowCount: 0,
    teamMemberCount: 0,
    integrationCount: 0,
  }

  const { activeMilestone, dismissMilestone, handleCtaClick } =
    useMilestoneDetection({
      userState: userMilestoneState,
      disabled: isLoading,
    })

  const fetchFiles = async () => {
    setIsLoading(true)
    setMessage(null)
    try {
      const data = await listKnowledgeFiles()
      setFiles(data)
    } catch (error) {
      const text =
        error instanceof Error ? error.message : 'Failed to load files'
      setMessage(text)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void fetchFiles()
  }, [])

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () =>
        resolve((reader.result as string).split(',')[1] || '')
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    setMessage(null)
    try {
      const base64 = await toBase64(file)
      await uploadKnowledgeFile({
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        base64,
      })
      await recordEvent('file_upload', { name: file.name, size: file.size })
      await fetchFiles()
      setMessage('Upload complete and indexed with Vertex embeddings.')
      // Trigger first document milestone if this is the first upload
      if (files.length === 0) {
        setHasUploadedFirst(true)
      }
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Upload failed'
      setMessage(text)
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  return (
    <>
      {/* Milestone Celebration Modal */}
      {activeMilestone && (
        <CelebrationModal
          milestone={activeMilestone}
          onDismiss={dismissMilestone}
          onCtaClick={handleCtaClick}
        />
      )}

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">
            Files & Knowledge Base
          </p>
          <h1 className="text-2xl font-semibold">
            Upload documents for Vertex retrieval
          </h1>
          <p className="text-sm text-muted-foreground">
            Files are stored in MongoDB GridFS and embedded with Vertex AI for
            semantic search.
          </p>
        </div>

        <Card className="flex flex-col gap-4 border-border bg-card/80 p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/30">
                <CloudUpload className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Upload a document</p>
                <p className="text-xs text-muted-foreground">
                  PDF, TXT, DOCX supported. Max 10 MB while we stabilize the
                  pipeline.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => void fetchFiles()}
                disabled={isLoading}
              >
                <RefreshCcw className="mr-2 size-4" />
                Refresh
              </Button>
              <Button asChild disabled={uploading}>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.txt,.doc,.docx"
                    onChange={handleUpload}
                  />
                  {uploading ? 'Uploading…' : 'Choose file'}
                </label>
              </Button>
            </div>
          </div>
          {message ? (
            <p className="text-sm text-muted-foreground">{message}</p>
          ) : null}
        </Card>

        <Card className="border-border bg-card/70 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              <h2 className="text-lg font-semibold">Recent uploads</h2>
            </div>
            <span className="text-xs text-muted-foreground">
              {isLoading ? 'Loading…' : `${files.length} files`}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            {files.map(file => (
              <Card key={file.id} className="border-border/70 bg-muted/40 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB • {file.mimeType}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                    KB ready
                  </span>
                </div>
                {file.summary && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {file.summary}
                  </p>
                )}
              </Card>
            ))}

            {!isLoading && files.length === 0 && (
              <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                No files yet. Upload your first PDF or TXT to enable retrieval
                in chat.
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  )
}

export default Files
