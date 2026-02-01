'use client'

import pinataClient from '@/clients/pinata.client'
import { useState } from 'react'
import { FileUploadDialog } from './file.upload.dialog'

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState('')
  const [link, setLink] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      console.log(e.target.files)

      setFile(e.target.files[0] ?? null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    try {
      setUploadStatus('Getting upload URL...')
      const urlResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/presigned_url`,
        {
          method: 'GET',
          headers: {
            // Handle your own server authorization here
          },
        },
      )
      const data = await urlResponse.json()

      setUploadStatus('Uploading file...')

      const upload = await pinataClient.upload.public.file(file).url(data.url)

      console.log(upload)

      if (upload.cid) {
        setUploadStatus('File uploaded successfully!')
        const ipfsLink = await pinataClient.gateways.public.convert(upload.cid)
        setLink(ipfsLink)
      } else {
        setUploadStatus('Upload failed')
      }
    } catch (error) {
      setUploadStatus(
        `Error: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  return (
    // <>
    //   <h1>Vite + React + Pinata</h1>
    //   <div className='card'>
    //     <input type='file' onChange={handleFileChange} />
    //     <br />
    //     <button onClick={handleUpload} disabled={!file}>
    //       Upload to Pinata
    //     </button>
    //     <br />
    //     {uploadStatus && <p>{uploadStatus}</p>}
    //     <br />
    //     {link && (
    //       <a href={`${link}?filename=${file?.name}`} download={file?.name}>
    //         Download File {file?.name}
    //       </a>
    //     )}
    //   </div>
    //   <br />
    //   <p className='read-the-docs'>
    //     Click on the Vite and React logos to learn more
    //   </p>
    // </>
    <main className='min-h-screen bg-background flex items-center justify-center'>
      <FileUploadDialog />
    </main>
  )
}
