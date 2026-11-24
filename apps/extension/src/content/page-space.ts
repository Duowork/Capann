/**
 * page-space.ts
 *
 * Annotations are stored in PAGE coordinates (CSS pixels from the document's
 * top-left), so they scroll with the page. The canvases stay viewport-sized and
 * `position: fixed` (see learn/canvas.md for why); scrolling is expressed as a
 * canvas transform instead of a bigger bitmap.
 *
 * Only window scrolling is tracked. Pages that scroll an inner element (many web
 * apps) keep the window at 0,0, so annotations there behave as before.
 *
 * SCREEN SPACE. Marks that scroll with the page are a Premium feature. Without
 * it, `setScrollWithPage(false)` pins the page's document to the viewport: the
 * scroll offset is treated as 0 everywhere here, so marks stay where they were
 * drawn while the page moves underneath. Which space a tab's document uses is
 * decided (and stored with it) by OverlayApp; everything that converts between
 * pointer, screen, and annotation coordinates goes through `pageScroll()`.
 *
 * IMAGE SPACE. While the screenshot editor is open, the same tools draw on a
 * frozen screenshot instead of the page. `setImageSpace` switches every
 * function here to the screenshot's own coordinates (CSS pixels from its
 * top-left), shown at `origin` on screen and scaled by `scale` to fit. Nothing
 * else in the drawing pipeline needs to know: pointer input, both canvases,
 * the composers, and comment placement all go through this module.
 */

import type { Point } from "../shared/types";

export interface ImageSpace {
  /** Screen position (viewport CSS px) of the image's top-left. */
  originX: number;
  originY: number;
  /** Screen pixels per image pixel. */
  scale: number;
  /** Image size in its own CSS px. */
  width: number;
  height: number;
}

let imageSpace: ImageSpace | null = null;
let scrollWithPage = true;

/** Switch drawing to a screenshot (or back to the page with null). */
export function setImageSpace(space: ImageSpace | null): void {
  imageSpace = space;
}

export function activeImageSpace(): ImageSpace | null {
  return imageSpace;
}

/**
 * Page space (true: marks scroll with the page, Premium) or screen space
 * (false: marks stay fixed on screen). Set by OverlayApp from the document.
 */
export function setScrollWithPage(on: boolean): void {
  scrollWithPage = on;
}

export function scrollsWithPage(): boolean {
  return scrollWithPage;
}

/**
 * The window scroll as annotation coordinates see it: the real scroll in page
 * space, 0,0 in screen space. Use this instead of `window.scrollX/Y` anywhere
 * that maps between annotations and the screen.
 */
export function pageScroll(): Point {
  return scrollWithPage ? { x: window.scrollX, y: window.scrollY } : { x: 0, y: 0 };
}

/** Screen pixels per annotation unit: 1 on the page, the fit scale on a screenshot. */
export function spaceScale(): number {
  return imageSpace?.scale ?? 1;
}

/** Pointer position (viewport CSS px) -> page (or image) coordinates. */
export function pagePoint(clientX: number, clientY: number): Point {
  if (imageSpace)
    return {
      x: (clientX - imageSpace.originX) / imageSpace.scale,
      y: (clientY - imageSpace.originY) / imageSpace.scale,
    };
  const scroll = pageScroll();
  return { x: clientX + scroll.x, y: clientY + scroll.y };
}

/** Page (or image) coordinates -> viewport CSS px. Inverse of `pagePoint`. */
export function screenPoint(point: Point): Point {
  if (imageSpace)
    return {
      x: imageSpace.originX + point.x * imageSpace.scale,
      y: imageSpace.originY + point.y * imageSpace.scale,
    };
  const scroll = pageScroll();
  return { x: point.x - scroll.x, y: point.y - scroll.y };
}

/**
 * Draw in page coordinates: HiDPI scale plus the current scroll offset. Every
 * canvas that renders annotations must use this, including PNG export.
 */
export function setPageTransform(ctx: CanvasRenderingContext2D): void {
  const dpr = window.devicePixelRatio || 1;
  if (imageSpace) {
    const s = dpr * imageSpace.scale;
    ctx.setTransform(s, 0, 0, s, imageSpace.originX * dpr, imageSpace.originY * dpr);
    return;
  }
  const scroll = pageScroll();
  ctx.setTransform(dpr, 0, 0, dpr, -scroll.x * dpr, -scroll.y * dpr);
}

/** Draw in viewport coordinates (laser, spotlight): HiDPI scale only. */
export function setScreenTransform(ctx: CanvasRenderingContext2D): void {
  const dpr = window.devicePixelRatio || 1;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

/** Clear the whole bitmap regardless of the current transform. */
export function clearCanvas(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore();
}
