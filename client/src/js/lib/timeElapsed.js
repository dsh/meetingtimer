export default function timeElapsed(startTime, now) {
  if (!now) {
    now = new Date().getTime();
  }
  // if start time is in the future, timeElapsed is 0
  return Math.max(0, (now/1000) - startTime);
}
