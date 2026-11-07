// Whether the homepage's opening sequence is playing, and word when it is
// over — so heavy work (the tunnel's 3D scene, its pictures going up to the
// graphics card) waits until it is, rather than stalling the sequence.
//
// The opening (CardOpening) marks the stylesheet that holds the start of
// its sequence with data-intro, and takes it off when it ends.

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

/** Explore Work, under the names, asks for the way down. Whatever follows
 * the opening may take it (the folio starts its run and cancels the event);
 * if nothing does, the button scrolls down itself. */
export const EXPLORE = "db:explore";

/** The sequence is over: take its start off the page and say so. */
export function endIntro(start: Element) {
  start.remove();
  window.dispatchEvent(new Event(INTRO_DONE));
}
