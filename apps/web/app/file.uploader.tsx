'use client'

import type React from 'react'

import { useState, useCallback } from 'react'
import {
  Upload,
  X,
  File,
  ImageIcon,
  FileText,
  Music,
  Video,
} from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Progress } from '@workspace/ui/components/progress'
import { cn } from '@workspace/ui/lib/utils'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  progress: number
  status: 'uploading' | 'complete' | 'error'
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return ImageIcon
  if (type.startsWith('video/')) return Video
  if (type.startsWith('audio/')) return Music
  if (type.includes('pdf') || type.includes('document')) return FileText
  return File
}

export function FileUploader() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)

  const simulateUpload = useCallback((file: File) => {
    const newFile: UploadedFile = {
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: 'uploading',
    }

    setFiles((prev) => [...prev, newFile])

    // Simular progreso de subida
    const interval = setInterval(() => {
      setFiles((prev) =>
        prev.map((f) => {
          if (f.id === newFile.id) {
            const newProgress = Math.min(f.progress + Math.random() * 30, 100)
            return {
              ...f,
              progress: newProgress,
              status: newProgress >= 100 ? 'complete' : 'uploading',
            }
          }
          return f
        }),
      )
    }, 300)

    setTimeout(() => clearInterval(interval), 3000)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const droppedFiles = Array.from(e.dataTransfer.files)
      droppedFiles.forEach(simulateUpload)
    },
    [simulateUpload],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || [])
      selectedFiles.forEach(simulateUpload)
    },
    [simulateUpload],
  )

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }, [])

  return (
    <div className='w-full space-y-6'>
      {/* Zona de drop */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer',
          isDragOver
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
        )}
      >
        <input
          type='file'
          multiple
          onChange={handleFileSelect}
          className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
        />
        <div className='flex flex-col items-center gap-4'>
          <div
            className={cn(
              'p-4 rounded-full transition-colors',
              isDragOver ? 'bg-primary/10' : 'bg-muted',
            )}
          >
            <Upload
              className={cn(
                'w-8 h-8 transition-colors',
                isDragOver ? 'text-primary' : 'text-muted-foreground',
              )}
            />
          </div>
          <div className='space-y-2'>
            <p className='text-lg font-medium text-foreground'>
              {isDragOver
                ? 'Suelta los archivos aquí'
                : 'Arrastra y suelta tus archivos'}
            </p>
            <p className='text-sm text-muted-foreground'>
              o haz clic para seleccionar desde tu dispositivo
            </p>
          </div>
          <Button variant='outline' size='sm' className='mt-2 bg-transparent'>
            Seleccionar archivos
          </Button>
        </div>
      </div>

      {/* Lista de archivos */}
      {files.length > 0 && (
        <div className='space-y-3'>
          <h3 className='text-sm font-medium text-foreground'>
            Archivos ({files.length})
          </h3>
          <div className='space-y-2'>
            {files.map((file) => {
              const FileIcon = getFileIcon(file.type)
              return (
                <div
                  key={file.id}
                  className='flex items-center gap-3 p-3 bg-card border border-border rounded-lg'
                >
                  <div className='p-2 bg-muted rounded-lg shrink-0'>
                    <FileIcon className='w-5 h-5 text-muted-foreground' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-foreground truncate'>
                      {file.name}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {formatFileSize(file.size)}
                    </p>
                    {file.status === 'uploading' && (
                      <Progress value={file.progress} className='h-1 mt-2' />
                    )}
                  </div>
                  <div className='flex items-center gap-2 shrink-0'>
                    {file.status === 'complete' && (
                      <span className='text-xs text-green-600 font-medium'>
                        Completado
                      </span>
                    )}
                    {file.status === 'uploading' && (
                      <span className='text-xs text-muted-foreground'>
                        {Math.round(file.progress)}%
                      </span>
                    )}
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8'
                      onClick={() => removeFile(file.id)}
                    >
                      <X className='w-4 h-4' />
                      <span className='sr-only'>Eliminar archivo</span>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
