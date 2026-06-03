/**
 * LogoIcon — Vidéo IOSNA animée
 * Utilise /iosna.mp4 (autoplay, loop, muted)
 * Pour le favicon (images uniquement) → SVG fallback
 */
export default function LogoIcon({ size = 44 }) {
  return (
    <video
      src="/iosna.mp4?v=3"
      autoPlay
      loop
      muted
      playsInline
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        borderRadius: '8px',
        display: 'block',
      }}
    />
  )
}
