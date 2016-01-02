import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
require('./Navigation.less');

export default class Navigation extends Component {

  render() {
    const { menuOpen, onToggleMenu } = this.props;
    const menuClass = menuOpen ? "menus menus-open" : "menus menus-closed";
    const handleOpen = () => onToggleMenu(true);
    const handleClose = () => onToggleMenu(false);
    return (
      <div className={menuClass}>
        <a href="#" onClick={handleOpen} className="mobile-menu-button"></a>
        <div onClick={handleClose} className="nav-link-list">
          <Link className="nav-site-name nav-link" to="/">meetingtimer.io</Link>
          <Link className="nav-link" to="/about">about</Link>
          <a className="nav-link" target="_blank" href="https://github.com/dsh/meetingtimer">github</a>
        </div>
        <div className="screen-mask" onClick={handleClose}></div>
      </div>
    )
  }
}

Navigation.propTypes =  {
  menuOpen: PropTypes.bool.isRequired,
  onToggleMenu: PropTypes.func.isRequired
};
