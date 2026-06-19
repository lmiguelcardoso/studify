'use client'

import { Edit2, ExternalLink, FileText, Link, Trash2, Video } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Material, MaterialType } from '@/types'

interface MaterialCardProps {
  material: Material
  topicName?: string
  onEdit: (material: Material) => void
  onDelete: (material: Material) => void
}

const iconMap: Record<MaterialType, typeof FileText> = {
  pdf: FileText,
  video_link: Link,
  video_upload: Video,
}

const typeKeyMap: Record<MaterialType, string> = {
  pdf: 'materials.type.pdf',
  video_link: 'materials.type.video_link',
  video_upload: 'materials.type.video_upload',
}

export function MaterialCard({ material, topicName, onEdit, onDelete }: MaterialCardProps) {
  const t = useTranslations('materials')
  const common = useTranslations('common')
  const Icon = iconMap[material.type]

  return (
    <Card className="overflow-hidden rounded-md">
      <CardContent className="flex items-start gap-4 p-4">
        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="line-clamp-2 text-sm font-medium">{material.title}</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium">
              {t(typeKeyMap[material.type])}
            </span>
            {topicName ? (
              <span className="text-xs text-muted-foreground">&middot; {topicName}</span>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          {material.url ? (
            <Button type="button" size="icon" variant="ghost" asChild aria-label={t('view')}>
              <a href={material.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </Button>
          ) : null}
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => onEdit(material)}
            aria-label={common('edit')}
          >
            <Edit2 className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => onDelete(material)}
            aria-label={common('delete')}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
