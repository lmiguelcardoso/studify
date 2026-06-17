'use client'

import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface PdfViewerProps {
  url: string
}

export function PdfViewer({ url }: PdfViewerProps) {
  const common = useTranslations('common')
  const [pageNumber, setPageNumber] = useState(1)
  const [numPages, setNumPages] = useState(0)

  return (
    <div className="space-y-3">
      <div className="overflow-auto rounded-md border bg-background p-3">
        <Document file={url} onLoadSuccess={({ numPages: pages }) => setNumPages(pages)}>
          <Page pageNumber={pageNumber} width={720} />
        </Document>
      </div>
      <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>
          {pageNumber} / {numPages || 1}
        </span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPageNumber((page) => Math.max(1, page - 1))}
            disabled={pageNumber <= 1}
          >
            {common('back')}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPageNumber((page) => Math.min(numPages || 1, page + 1))}
            disabled={pageNumber >= (numPages || 1)}
          >
            {common('next')}
          </Button>
        </div>
      </div>
    </div>
  )
}
