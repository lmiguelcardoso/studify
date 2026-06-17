'use client'

import { Eye, FileText, LinkIcon, Trash2, Video } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PdfViewer } from '@/components/materials/PdfViewer'
import { VideoPlayer } from '@/components/materials/VideoPlayer'
import { createClient } from '@/lib/supabase/client'
import type { Material } from '@/types'

interface MaterialCardProps {
  material: Material
  onDelete: () => void
}

function MaterialIcon({ type }: { type: Material['type'] }) {
  if (type === 'pdf') return <FileText className="h-5 w-5" aria-hidden="true" />
  if (type === 'video_link') return <LinkIcon className="h-5 w-5" aria-hidden="true" />
  return <Video className="h-5 w-5" aria-hidden="true" />
}

export function MaterialCard({ material, onDelete }: MaterialCardProps) {
  const t = useTranslations('materials')
  const [isViewing, setIsViewing] = useState(false)
  const [viewerUrl, setViewerUrl] = useState<string | null>(material.type === 'video_link' ? material.url : null)
  const [viewerError, setViewerError] = useState<string | null>(null)
  const [isLoadingUrl, setIsLoadingUrl] = useState(false)

  async function handleView() {
    const nextIsViewing = !isViewing
    setIsViewing(nextIsViewing)
    setViewerError(null)

    if (!nextIsViewing) return
    if (material.type === 'video_link' || viewerUrl) return

    if (!navigator.onLine) {
      setViewerError(t('requiresConnection'))
      return
    }

    if (!material.file_path) {
      setViewerError(t('missingFile'))
      return
    }

    setIsLoadingUrl(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.storage.from('materials').createSignedUrl(material.file_path, 3600)
      if (error) throw error
      setViewerUrl(data.signedUrl)
    } catch {
      setViewerError(t('viewerError'))
    } finally {
      setIsLoadingUrl(false)
    }
  }

  return (
    <Card className="rounded-md">
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="mt-1 rounded-md border bg-muted p-2 text-muted-foreground">
              <MaterialIcon type={material.type} />
            </span>
            <div className="min-w-0">
              <h3 className="truncate font-semibold">{material.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t(`type.${material.type}`)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleView}>
              <Eye className="h-4 w-4" aria-hidden="true" />
              {isViewing ? t('hide') : t('view')}
            </Button>
            <Button type="button" variant="destructive" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              {t('deleteMaterial')}
            </Button>
          </div>
        </div>

        {isViewing ? (
          <div className="rounded-md border bg-muted/40 p-3">
            {isLoadingUrl ? <p className="text-sm text-muted-foreground">{t('loadingViewer')}</p> : null}
            {viewerError ? <p className="text-sm text-muted-foreground">{viewerError}</p> : null}
            {viewerUrl && material.type === 'pdf' ? <PdfViewer url={viewerUrl} /> : null}
            {viewerUrl && material.type !== 'pdf' ? <VideoPlayer material={material} url={viewerUrl} /> : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
