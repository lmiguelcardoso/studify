'use client'

import type { Material } from '@/types'

interface VideoPlayerProps {
  material: Material
  url: string
}

function getEmbedUrl(url: string) {
  const youtube = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
  if (youtube?.[1]) return `https://www.youtube.com/embed/${youtube[1]}`

  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  if (vimeo?.[1]) return `https://player.vimeo.com/video/${vimeo[1]}`

  return url
}

export function VideoPlayer({ material, url }: VideoPlayerProps) {
  if (material.type === 'video_upload') {
    return <video src={url} controls className="w-full rounded-md border" />
  }

  return (
    <iframe
      src={getEmbedUrl(url)}
      className="aspect-video w-full rounded-md border"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      title={material.title}
    />
  )
}
