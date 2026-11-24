/**
 * player-dialog.tsx — session playback for the Links tab (Premium).
 *
 * "Play" on a link opens this modal with the recording in a plain HTML5
 * <video>, streamed from the link itself (the API serves byte ranges). A
 * native <dialog> opened with showModal() traps focus and closes on Esc; focus
 * goes back to the Play button afterwards.
 *
 * MediaRecorder writes WebM without a duration, so Chrome reports Infinity and
 * the seek bar can't work. `fixDuration` seeks far past the end once, which
 * makes Chrome find the real duration, then rewinds and starts playing. The
 * website's links page (`/view-my-links`) does the same.
 */

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, SyntheticEvent } from "react";
import { ArrowSquareOutIcon, XIcon } from "@phosphor-icons/react";
import type { ShareLink } from "../shared/types";

const dateFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

const ICON_BUTTON: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 30,
  height: 30,
  flex: "0 0 auto",
  borderRadius: 10,
  border: "1px solid var(--border-hairline)",
  background: "var(--surface-elevated)",
};

export function PlayerDialog({ link, onClose }: { link: ShareLink; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fixingRef = useRef(false);
  const [failed, setFailed] = useState(false);
  const titleId = `player-${link.id}`;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
      opener?.focus();
    };
  }, []);

  const start = (video: HTMLVideoElement) => void video.play().catch(() => undefined);

  const onMetadata = (event: SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    if (Number.isFinite(video.duration)) return start(video);
    fixingRef.current = true;
    video.currentTime = Number.MAX_SAFE_INTEGER;
  };
  const fixDuration = (event: SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    if (!fixingRef.current || !Number.isFinite(video.duration)) return;
    fixingRef.current = false;
    video.currentTime = 0;
    start(video);
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      // A click on the backdrop lands on the dialog element itself.
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
      style={{
        width: "min(100vw - 24px, 720px)",
        maxWidth: "none",
        padding: 12,
        borderRadius: 18,
        border: "1px solid var(--border-strong)",
        background: "var(--surface-base)",
        color: "var(--text-primary)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <h2 id={titleId} style={{ margin: 0, fontSize: 13, fontWeight: 500, flex: 1, minWidth: 0 }}>
          Recording from {dateFormat.format(new Date(link.uploadedAt))}
        </h2>
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open in a new tab"
          title="Open in a new tab"
          style={{ ...ICON_BUTTON, color: "var(--text-primary)" }}
        >
          <ArrowSquareOutIcon size={15} />
        </a>
        <button
          type="button"
          aria-label="Close"
          title="Close"
          autoFocus
          onClick={() => dialogRef.current?.close()}
          style={ICON_BUTTON}
        >
          <XIcon size={15} weight="bold" />
        </button>
      </div>
      {failed ? (
        <p role="alert" style={{ margin: "24px 8px", color: "var(--danger)", fontSize: 12 }}>
          This recording can't play here. Open it in a new tab instead.
        </p>
      ) : (
        <video
          src={link.url}
          controls
          playsInline
          preload="metadata"
          onLoadedMetadata={onMetadata}
          onDurationChange={fixDuration}
          onTimeUpdate={fixDuration}
          onError={() => setFailed(true)}
          style={{
            display: "block",
            width: "100%",
            maxHeight: "70vh",
            borderRadius: 12,
            background: "#000",
          }}
        />
      )}
    </dialog>
  );
}
