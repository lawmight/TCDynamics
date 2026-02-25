import { useCallback, useEffect, useRef, useState } from 'react'

import { recordEvent } from '@/api/analytics'
import {
  listKnowledgeFiles,
  uploadKnowledgeFile,
  type KnowledgeFile,
} from '@/api/files'
import { CelebrationModal } from '@/components/app/CelebrationModal'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useMilestoneDetection } from '@/hooks/useMilestoneDetection'
import { cn } from '@/lib/utils'
import type { UserMilestoneState } from '@/utils/celebrations'
import CloudUpload from '~icons/lucide/cloud-upload'
import File from '~icons/lucide/file'
import FileText from '~icons/lucide/file-text'
import Image from '~icons/lucide/image'
import Loader2 from '~icons/lucide/loader-2'
import RefreshCcw from '~icons/lucide/refresh-ccw'
import SearchIcon from '~icons/lucide/search'
import Upload from '~icons/lucide/upload'

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return Image
  if (mimeType.includes('pdf') || mimeType.includes('text')) return FileText
  return File
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const Files = () => {
  const [files, setFiles] = useState<KnowledgeFile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<'success' | 'error'>(
    'success'
  )
  const [hasUploadedFirst, setHasUploadedFirst] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const fetchFiles = useCallback(async () => {
    setIsLoading(true)
    setMessage(null)
    try {
      const data = await listKnowledgeFiles()
      setFiles(data)
    } catch (error) {
      const text =
        error instanceof Error ? error.message : 'Failed to load files'
      setMessage(text)
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchFiles()
  }, [fetchFiles])

  const toBase64 = (file: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () =>
        resolve((reader.result as string).split(',')[1] || '')
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const processUpload = async (file: globalThis.File) => {
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
      setMessage(`"${file.name}" uploaded and indexed successfully.`)
      setMessageType('success')
      if (files.length === 0) setHasUploadedFirst(true)
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Upload failed'
      setMessage(text)
      setMessageType('error')
    } finally {
      setUploading(false)
    }
  }

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    await processUpload(file)
    event.target.value = ''
  }

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
    const file = event.dataTransfer.files[0]
    if (file) await processUpload(file)
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const filteredFiles = files.filter(
    file =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.mimeType.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      {activeMilestone && (
        <CelebrationModal
          milestone={activeMilestone}
          onDismiss={dismissMilestone}
          onCtaClick={handleCtaClick}
        />
      )}

      <div className="mx-auto w-full max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Knowledge Base</h1>
            <p className="text-muted-foreground text-sm">
              Upload [REDACTED] for AI-powered semantic search and retrieval.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void fetchFiles()}
              disabled={isLoading}
            >
              <RefreshCcw
                className={cn(
                  'mr-1.5 size-3.5',
                  isLoading && 'animate-spin'
                )}
              />
              Refresh
            </Button>
            <Button size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-1.5 size-3.5" />
              Upload
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.txt,.doc,.docx"
              onChange={e => void handleUpload(e)}
              aria-label="Upload a document"
            />
          </div>
        </div>

        {/* Drop zone */}
        <div
          className={cn(
            'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors',
            isDragOver
              ? 'border-primary bg-primary/5'
              : 'border-border bg-card/50',
            uploading && 'pointer-events-none opacity-60'
          )}
          onDrop={e => void handleDrop(e)}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {uploading ? (
            <Loader2 className="text-primary size-8 animate-spin" />
          ) : (
            <CloudUpload
              className={cn(
                'size-8',
                isDragOver ? 'text-primary' : 'text-muted-foreground'
              )}
            />
          )}
          <div className="text-center">
            <p className="text-sm font-medium">
              {uploading
                ? 'Uploading and indexing...'
                : 'Drag & drop a file here'}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              PDF, TXT, DOCX supported &middot; Max 10 MB
            </p>
          </div>
          {!uploading && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Browse files
            </Button>
          )}
        </div>

        {/* Status message */}
        {message && (
          <div
            className={cn(
              'rounded-lg px-4 py-2.5 text-sm',
              messageType === 'success'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-destructive/10 text-destructive'
            )}
          >
            {message}
          </div>
        )}

        {/* File list */}
        <Card className="border-border overflow-hidden">
          <div className="border-border flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <FileText className="text-muted-foreground size-4" />
              <h2 className="text-sm font-semibold">
                Documents{' '}
                <span className="text-muted-foreground font-normal">
                  ({files.length})
                </span>
              </h2>
            </div>
            {files.length > 0 && (
              <div className="relative">
                <SearchIcon className="text-muted-foreground absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2" />
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search files..."
                  className="h-8 w-48 pl-8 text-xs"
                />
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center gap-2 p-8">
              <Loader2 className="size-4 animate-spin" />
              <span className="text-muted-foreground text-sm">
                Loading files...
              </span>
            </div>
          ) : filteredFiles.length > 0 ? (
            <div className="divide-border divide-y">
              {filteredFiles.map(file => {
                const Icon = getFileIcon(file.mimeType)
                return (
                  <div
                    key={file.id}
                    className="hover:bg-muted/50 flex items-center gap-3 px-4 py-3 transition-colors"
                  >
                    <div className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-lg">
                      <Icon className="text-muted-foreground size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {file.name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {formatFileSize(file.size)} &middot; {file.mimeType}
                      </p>
                      {file.summary && (
                        <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">
                          {file.summary}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      Indexed
                    </span>
                  </div>
                )
              })}
            </div>
          ) : files.length > 0 && searchQuery ? (
            <div className="text-muted-foreground p-8 text-center text-sm">
              No files match &quot;{searchQuery}&quot;
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 p-12 text-center">
              <div className="bg-muted flex size-12 items-center justify-center rounded-2xl">
                <FileText className="text-muted-foreground size-6" />
              </div>
              <div>
                <p className="text-sm font-medium">No [REDACTED] yet</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Upload your first PDF or TXT to enable retrieval in chat.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-1.5 size-3.5" />
                Upload your first file
              </Button>
            </div>
          )}
        </Card>
      </div>
    </>
  )
}

export default Files
