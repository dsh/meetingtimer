import React, { Component, PropTypes } from 'react'
import BlockLetters from './BlockLetters'
import formatCost from '../lib/formatCost'

export default class Cost extends Component {
  render() {
    const { cost } = this.props;
    const formattedCost = "$" + formatCost(cost, true);
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
