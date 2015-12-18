import React, { Component, PropTypes } from 'react'
var map = require('lodash/collection/map');
require('./BlockLetters.less')

class BlockLetter extends Component {
  render() {
    const { letter } = this.props;
    return (
      <span className="block-letter">{letter}</span>
    );
  }
}
function characterChecker(props, propName, componentName, location) {
  componentName = componentName || 'ANONYMOUS';

  if (typeof props[propName] == "undefined") {
    return new Error(propName + ' in ' + componentName + " is required");
  }
  const value = props[propName];
  if (typeof value !== "string" || value.length != 1) {
    return new Error(propName + ' in ' + componentName + " must be a single character");
  }
  return null;
}
BlockLetter.propTypes =  {
  letter: characterChecker
};


export default class BlockLetters extends Component {
  render() {
    const { letters } = this.props;
    const blockLetters = map(letters.split(""), (l, k) => <BlockLetter key={k} letter={l} />);
    return (
      <div className="block-letters">{blockLetters}</div>
    );
  }
}

BlockLetters.propTypes =  {
  letters: PropTypes.string.isRequired
};
