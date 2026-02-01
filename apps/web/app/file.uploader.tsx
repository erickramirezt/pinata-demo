'use client'

import type React from 'react'

import { useState, useCallback } from 'react'
import { Upload, X, File, ImageIcon, FileText } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'
import pinataClient from '@/clients/pinata.client'
import { toast } from 'sonner'

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return ImageIcon
  if (type.includes('pdf') || type.includes('document')) return FileText
  return File
}

export function FileUploader() {
  const [files, setFiles] = useState<File[]>([])

  const [isDragOver, setIsDragOver] = useState(false)

  const uploadFiles = useCallback(async () => {
    if (!files.length) return

    try {
      // console.log(data)

      files.forEach(async (file) => {
        const urlResponse = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/presigned_url?groupId=27cff6e5-bc9c-4e87-bd6f-a364dadca36e`,
          {
            method: 'GET',
            headers: {
              // Handle your own server authorization here
            },
          },
        )
        const data = await urlResponse.json()

        await pinataClient.upload.public
          .file(file)
          .group('27cff6e5-bc9c-4e87-bd6f-a364dadca36e')
          .url(data.url)
      })

      toast.success('File uploaded successfully!')
    } catch (error) {
      toast.error(
        `Error: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }, [files])

  const preUpload = useCallback((file: File) => {
    setFiles((prev) => [...prev, file])
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const droppedFiles = Array.from(e.dataTransfer.files)
      droppedFiles.forEach(preUpload)
    },
    [preUpload],
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
      selectedFiles.forEach(preUpload)
    },
    [preUpload],
  )

  const removeFile = useCallback((name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name))
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
                  key={file.name}
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
                  </div>
                  <div className='flex items-center gap-2 shrink-0'>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8'
                      onClick={() => removeFile(file.name)}
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

      {/* Botón para subir archivos */}
      <Button
        variant='outline'
        size='sm'
        className='mt-2 bg-transparent place-self-end'
        onClick={() => uploadFiles()}
      >
        Subir archivos
      </Button>
    </div>
  )
}
