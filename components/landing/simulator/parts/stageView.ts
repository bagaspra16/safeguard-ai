import type { Camera, PerspectiveCamera } from 'three'

// Height of the hero text block on desktop (app/landing.module.css); the action stays below it
const TEXT_CLEARANCE = 520
// How far up the stage the top of the action (worker on the top deck) reaches
const ACTION_TOP = 0.63

function stageHeightFor(width: number, height: number) {
  // Mobile: the hero reserves a fixed strip below the text
  if (width < 768) return Math.min(height, 448)
  // Desktop: the hero fills the viewport, so the stage scales to the space left under the text
  const fit = (height - TEXT_CLEARANCE) / ACTION_TOP
  return Math.min(height, Math.max(300, Math.min(fit, 680)))
}

/**
 * Scenarios are framed for a "stage" strip at the bottom of the canvas. The rest
 * of the canvas extends the same view upward, behind the hero text.
 * Returns the aspect ratio of the stage.
 */
export function applyStageView(camera: Camera, width: number, height: number) {
  const stageHeight = stageHeightFor(width, height)
  const aspect = width / stageHeight
  const cam = camera as PerspectiveCamera
  const view = cam.view
  if (
    !view ||
    view.width !== width ||
    view.height !== height ||
    view.fullHeight !== stageHeight ||
    Math.abs(cam.aspect - aspect) > 1e-4
  ) {
    cam.setViewOffset(width, stageHeight, 0, stageHeight - height, width, height)
  }
  return aspect
}
