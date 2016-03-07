const reduceRight = require('lodash/collection/reduceRight');
const padLeft = require('lodash/string/padLeft');

export default function formatCost(cost, pad = false) {
  const [whole, fraction] = (cost).toFixed(2).split(".");

  function iteratee(accum, char) {
    const [pos, string] = accum;
    if (pos > 0 && pos % 3 === 0) {
      return [pos + 1, String(char) + "," + String(string)]
    } else {
      return [pos + 1, String(char) + String(string)];
    }
  }

  const padded = pad ? padLeft(String(whole), 5, "0") : whole;

  // 1. Convert whole value into array of chars.
  // 2. Reduce over array, adding commas.
  // 3. Extract just the string (ignore pos)
  const formattedWhole = reduceRight(
    padded.split(""),
    iteratee,
    [0, ""])[1];
  return formattedWhole + "." + fraction;
}
