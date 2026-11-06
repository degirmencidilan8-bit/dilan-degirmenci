// Whether the homepage's opening sequence is playing, and word when it is
// over — so heavy work (the tunnel's 3D scene, its pictures going up to the
// graphics card) waits until it is, rather than stalling the sequence.
//
// The openings (CardOpening, TwoLooks) mark the stylesheet that holds the
// start of their sequence with data-intro, and take it off when they end.

export const INTRO_DONE = "db:intro-done";

export function introPlaying() {
  return typeof document !== "undefined" && document.querySelector("style[data-intro]") !== null;
}

// Whether this page has been put together in the browser once already. The
// opening's parse-time script is only of use in the page as the server
// sent it; rendered again on the client (coming back to the homepage from
// another page) it would never run, and React says so in the console.
let hydrated = false;
export function pageHydrated() {
  return hydrated;
}
export function markHydrated() {
  hydrated = true;
}

// The homepage tunnel's 3D scene is up (its WebGL context made). The
// opening waits for it before it starts to move, since making it holds the
// page for a moment (see BrandTunnel).
export const TUNNEL_UP = "db:tunnel-up";
let tunnelUp = false;
export function isTunnelUp() {
  return tunnelUp;
}
export function markTunnelUp() {
  tunnelUp = true;
  window.dispatchEvent(new Event(TUNNEL_UP));
}

/** The sequence is over: take its start off the page and say so. */
export function endIntro(start: Element) {
  start.remove();
  window.dispatchEvent(new Event(INTRO_DONE));
}
