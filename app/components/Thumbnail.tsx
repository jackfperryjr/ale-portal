export default function Thumbnail({ url, videoId }: { url: string; videoId: string | null }) {
  const isYouTube = videoId && (url.includes('youtube.com') || url.includes('youtu.be'))
  const isImage   = !isYouTube && /\.(jpe?g|png|gif|webp|avif)(\?|$)/i.test(url)

  if (isYouTube) {
    return (
      <div className="w-16 h-9 rounded overflow-hidden bg-ale-border flex-shrink-0">
        <img
          src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  if (isImage) {
    return (
      <div className="w-9 h-9 rounded overflow-hidden bg-ale-border flex-shrink-0">
        <img src={url} alt="" className="w-full h-full object-cover" />
      </div>
    )
  }

  try {
    const { hostname } = new URL(url)
    return (
      <div className="w-9 h-9 rounded bg-ale-border flex items-center justify-center flex-shrink-0">
        <img
          src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
          alt=""
          className="w-4 h-4 opacity-50"
        />
      </div>
    )
  } catch {
    return <div className="w-9 h-9 rounded bg-ale-border flex-shrink-0" />
  }
}
