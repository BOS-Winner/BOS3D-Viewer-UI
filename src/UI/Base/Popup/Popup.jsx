import React from "react";
import PropTypes from "prop-types";
import Icon from "Base/Icon";
import Toolbar from "Base/Toolbar";
import style from "./popup.less";
// import popupPng from "../img/popup.png";

class Popup extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    icon: PropTypes.element.isRequired,
    title: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      showPopup: false,
    };
  }

  triggerPopUp = () => {
    this.setState(state => ({
      showPopup: !state.showPopup
    }));
  }

  render() {
    return (
      <div
        title="更多"
        role="button"
        tabIndex={0}
        onClick={(e) => this.triggerPopUp(e)}
        style={{ position: 'relative' }}
      >
        <div
          className={style.popupContainer}
          style={{ display: this.state.showPopup ? "flex" : "none" }}
        >
          <Toolbar
            className={style.popup}
          >
            {this.props.children}
          </Toolbar>
        </div>
        <Icon
          icon={this.props.icon}
          title={this.props.title || ''}
        />
      </div>
    );
  }
}

Popup.defaultProps = {
  title: ""
};

export default Popup;
