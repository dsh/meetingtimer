export default function timeElapsed(startTime) {
  // if start time is in the future, timeElapsed is 0
  return Math.max(0, (new Date().getTime()/1000) - startTime);
}

