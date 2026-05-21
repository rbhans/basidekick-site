/**
 * Manhattan pipe router.
 *
 * Given two world points + their anchor directions, produce a 3-segment
 * orthogonal path (vertical → horizontal → vertical, or horizontal → vertical
 * → horizontal). Lane gutters provide a natural place to route horizontal
 * runs without crossing lanes.
 *
 *   from = { x, y, dir }    dir in "N"|"S"|"E"|"W" (the direction the anchor
 *                            "points" — i.e. where the line leaves the body)
 *   to   = same shape
 *   midY = optional preferred Y coord for the horizontal leg (e.g. gutter)
 *   midX = optional preferred X coord for the vertical leg
 *
 * Returns a list of points to feed straight into <Pipe points={...} />.
 */

export type AnchorDirection = "N" | "S" | "E" | "W" | "C";

export interface AnchorPoint {
  x: number;
  y: number;
  dir: AnchorDirection;
}

interface RouteOptions {
  /** Y coord used by the horizontal leg when the route is vertical-first. */
  midY?: number;
  /** X coord used by the vertical leg when the route is horizontal-first. */
  midX?: number;
  /** Stub length — how far the line extends from each endpoint before turning. */
  stub?: number;
}

const STUB_DEFAULT = 12;

/**
 * Compute a 2-5 point poly-line between two anchor points.
 *
 * Routing rules:
 *  - If both anchors face the same primary axis (both N/S, both E/W), use a
 *    3-segment S/Z route through the gutter at midY (vertical case) or midX
 *    (horizontal case).
 *  - If anchors face opposite axes (one N/S, one E/W), use an L route.
 *  - If the points are already aligned along one axis and pointing the right
 *    way, just emit two points (a straight line).
 */
export function routePipe(
  from: AnchorPoint,
  to: AnchorPoint,
  opts: RouteOptions = {},
): Array<[number, number]> {
  const stub = opts.stub ?? STUB_DEFAULT;

  const fromVertical = from.dir === "N" || from.dir === "S";
  const toVertical = to.dir === "N" || to.dir === "S";

  // Straight line if already aligned and pointing toward each other.
  if (fromVertical && toVertical && from.x === to.x) {
    return [
      [from.x, from.y],
      [to.x, to.y],
    ];
  }
  if (!fromVertical && !toVertical && from.y === to.y) {
    return [
      [from.x, from.y],
      [to.x, to.y],
    ];
  }

  // Three-segment Z route through a gutter Y.
  if (fromVertical && toVertical) {
    const fromStubY =
      from.dir === "N" ? from.y - stub : from.y + stub;
    const toStubY = to.dir === "N" ? to.y - stub : to.y + stub;
    const midY =
      opts.midY ?? (fromStubY + toStubY) / 2;
    return [
      [from.x, from.y],
      [from.x, midY],
      [to.x, midY],
      [to.x, to.y],
    ];
  }

  // Three-segment Z route through a gutter X.
  if (!fromVertical && !toVertical) {
    const fromStubX =
      from.dir === "W" ? from.x - stub : from.x + stub;
    const toStubX = to.dir === "W" ? to.x - stub : to.x + stub;
    const midX = opts.midX ?? (fromStubX + toStubX) / 2;
    return [
      [from.x, from.y],
      [midX, from.y],
      [midX, to.y],
      [to.x, to.y],
    ];
  }

  // Mixed axis: simple L route. Decide elbow based on which axis is "from".
  if (fromVertical) {
    // from is N/S; to is E/W. Elbow at (from.x, to.y).
    return [
      [from.x, from.y],
      [from.x, to.y],
      [to.x, to.y],
    ];
  }
  // from is E/W; to is N/S. Elbow at (to.x, from.y).
  return [
    [from.x, from.y],
    [to.x, from.y],
    [to.x, to.y],
  ];
}
