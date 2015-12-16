import React, { Component, PropTypes } from 'react'
import BlockLetters from './BlockLetters'
var _ = require('lodash');

export default class Cost extends Component {
  render() {
    const { cost } = this.props;
    const [whole, fraction] = (cost).toFixed(2).split(".");

    function iteratee(accum, char) {
      const [pos, string] = accum;
      if (pos > 0 && pos % 3 === 0) {
        return [pos + 1, String(char) + "," + String(string)]
      } else {
        return [pos + 1, String(char) + String(string)];
      }
    }

    // 1. Convert whole value into array of chars.
    // 2. Reduce over array, adding commas.
    // 3. Extract just the string (ignore pos)
    const formattedWhole = _.reduceRight(
      _.padLeft(String(whole), 5, "0").split(""),
      iteratee,
      [0, ""])[1];
    const formattedCost = "$" + formattedWhole + "." + fraction;
    return (
      <div className="cost">
        <BlockLetters letters={formattedCost} />
      </div>
    );
  }
}

Cost.propTypes =  {
  cost: PropTypes.number.isRequired
};
