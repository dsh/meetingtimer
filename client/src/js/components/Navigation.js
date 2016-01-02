import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
require('./Navigation.less');

export default class Navigation extends Component {

  render() {
    const { menuOpen, onToggleMenu } = this.props;
    const menuClass = menuOpen ? "menus menus-open" : "menus menus-closed";
    const handleOpen = () => onToggleMenu(true);
    const handleClose = () => onToggleMenu(false);

    const navList = [
      <Link key="1" className="nav-site-name nav-link" to="/">meetingtimer.io</Link>,
      <Link key="2" className="nav-link" to="/about">about</Link>,
      <a key="3" className="nav-link" target="_blank" href="https://github.com/dsh/meetingtimer">github</a>
    ];
    // I had to dupe the menu list because I was getting weird CSS transitions when re-sizing the browser window.
    return (
      <div className={menuClass}>
        <a href="#" onClick={handleOpen} className="mobile-menu-button"></a>
        <div className="nav-link-list">
          {navList}
        </div>
        <div onClick={handleClose} className="mobile-nav-link-list">
          {navList}
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
