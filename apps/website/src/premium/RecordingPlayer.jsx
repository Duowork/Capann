import { useEffect, useRef, useState } from 'react'
import { ArrowSquareOut, X } from '@phosphor-icons/react'

// Session playback (Premium): "Play" on /view-my-links opens the recording in
// this modal, in a plain HTML5 <video> streamed from the link itself (the API
// serves byte ranges). A native <dialog> opened with showModal() traps focus
// and closes on Esc; focus goes back to the Play button afterwards.
//
// MediaRecorder writes WebM without a duration, so Chrome reports Infinity and
// the seek bar can't work. Seeking far past the end once makes the browser find
// the real duration; then it rewinds and plays. The extension's Links tab
// (apps/extension/src/sidepanel/player-dialog.tsx) does the same.

const ICON_BUTTON =
  'inline-flex items-center justify-center w-10 h-10 flex-none rounded-pill border border-border-hairline-strong text-text-primary transition-colors hover:bg-surface-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

export function RecordingPlayer({ item, title, onClose }) {
  const dialogRef = useRef(null)
  const fixingRef = useRef(false)
  const [failed, setFailed] = useState(false)
  const titleId = `player-${item.id}`

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return undefined
    const opener = document.activeElement
    dialog.showModal()
    return () => {
      if (dialog.open) dialog.close()
      opener?.focus?.()
    }
  }, [])

  const start = (video) => {
    video.play().catch(() => {})
  }

  function onMetadata(event) {
    const video = event.currentTarget
    if (Number.isFinite(video.duration)) return start(video)
    fixingRef.current = true
    video.currentTime = Number.MAX_SAFE_INTEGER
  }

  function fixDuration(event) {
    const video = event.currentTarget
    if (!fixingRef.current || !Number.isFinite(video.duration)) return
    fixingRef.current = false
    video.currentTime = 0
    start(video)
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      // A click on the backdrop lands on the dialog element itself.
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close()
      }}
      className="w-[min(100vw-24px,960px)] max-w-none max-h-[calc(100dvh-24px)] m-auto p-4 sm:p-5 rounded-panel bg-surface-base border border-border-hairline-strong text-text-primary shadow-[var(--shadow-float)] backdrop:bg-canvas/80 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 mb-4">
        <h2 id={titleId} className="flex-1 min-w-0 m-0 text-[15.5px] font-medium truncate">
          {title}
        </h2>
        <a href={item.url} target="_blank" rel="noopener noreferrer" aria-label="Open in a new tab" title="Open in a new tab" className={ICON_BUTTON}>
          <ArrowSquareOut size={17} weight="bold" aria-hidden="true" />
        </a>
        <button type="button" autoFocus aria-label="Close" title="Close" onClick={() => dialogRef.current?.close()} className={ICON_BUTTON}>
          <X size={17} weight="bold" aria-hidden="true" />
        </button>
      </div>
      {failed ? (
        <p role="alert" className="m-0 px-2 py-10 text-center text-[15px] text-error">
          This recording can’t play here. Open it in a new tab instead.
        </p>
      ) : (
        <video
          src={item.url}
          controls
          playsInline
          preload="metadata"
          onLoadedMetadata={onMetadata}
          onDurationChange={fixDuration}
          onTimeUpdate={fixDuration}
          onError={() => setFailed(true)}
          className="block w-full max-h-[72dvh] rounded-[18px] bg-canvas"
        />
      )}
    </dialog>
  )
}
