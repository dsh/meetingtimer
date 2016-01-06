const padLeft = require('lodash/string/padLeft');

/**
 * Compute time elapsed
 *
 * @param startTime Expressed in seconds since epoch.
 * @param now "Now" expressed in milliseconds since epoch.
 * @returns {number}
 */
export default function timeElapsed(startTime, now) {
  if (typeof now === "undefined") {
    now = new Date().getTime();
  }
  // if start time is in the future, timeElapsed is 0
  return Math.max(0, (now/1000) - startTime);
}


export function timeElapsedString(seconds) {
  const h = Math.floor(seconds / (60*60) );
  const secondsLessHours = seconds - h * 60 * 60;
  const m = Math.floor(secondsLessHours / 60);
  const s = secondsLessHours - m * 60;
  return padLeft(h, 2, "0") + ":" + padLeft(m, 2, "0") + ":" + padLeft(s.toFixed(1), 4, "0");
}
