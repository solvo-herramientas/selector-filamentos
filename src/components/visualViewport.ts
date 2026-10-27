export function visualViewportBottomOffset(layoutHeight: number, viewportHeight: number | null, offsetTop = 0): number {
  if (!Number.isFinite(layoutHeight) || viewportHeight === null || !Number.isFinite(viewportHeight) || !Number.isFinite(offsetTop)) return 0;
  return Math.max(0, layoutHeight - (viewportHeight + offsetTop));
}
