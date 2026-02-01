'use client'

import type React from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog'
import { Button } from '@workspace/ui/components/button'
import { Upload } from 'lucide-react'
import { FileUploader } from './file.uploader'

interface FileUploadDialogProps {
  trigger?: React.ReactNode
}

export function FileUploadDialog({ trigger }: FileUploadDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Upload className='w-4 h-4 mr-2' />
            Subir archivos
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='sm:max-w-2xl max-h-[85vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Subir archivos</DialogTitle>
          <DialogDescription>
            Arrastra tus archivos o haz clic para seleccionarlos
          </DialogDescription>
        </DialogHeader>
        <FileUploader />
      </DialogContent>
    </Dialog>
  )
}
