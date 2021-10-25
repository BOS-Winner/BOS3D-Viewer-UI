import React from "react";
import PropTypes from "prop-types";
import style from "./style.less";

class Hide extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: true,
      overflow: "unset"
    };
  }

  triggerShow(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState(state => {
      if (state.show) {
        return {
          show: false,
          overflow: 'hidden'
        };
      } else {
        return {
          show: true,
        };
      }
    });
  }

  animateEnd() {
    if (this.state.show && this.state.overflow === 'hidden') {
      this.setState({
        overflow: 'unset'
      });
    }
  }

  render() {
    return (
      <div
        className={style.hideContainer}
        style={{
          overflow: this.state.overflow
        }}
      >
        <button type="button" onClick={e => { this.triggerShow(e) }}>
          {this.state.show ? '隐藏' : '显示'}
        </button>
        <div
          className={`${style.animate} ${this.state.show ? '' : style.hide}`}
          onAnimationEnd={() => { this.animateEnd() }}
        >
          {this.props.children}
        </div>
      </div>
    );
  }
}

Hide.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Hide;
