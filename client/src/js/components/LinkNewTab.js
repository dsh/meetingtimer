import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'

export default class LinkNewTab extends Component {

  handleClick = (event) => {
    event.stopPropagation();
    window.open(this.to, "_blank");
  };

  render = () => <a href={this.props.to} onClick={this.handleClick}>{this.props.children}</a>
}

LinkNewTab.propTypes =  {
  to: PropTypes.string.isRequired
};
