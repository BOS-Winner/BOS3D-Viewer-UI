import React from 'react';
import ReactDom from "react-dom";
import PropTypes from "prop-types";
import style from "./style.less";

class MobileTool extends React.Component {
  static propTypes = {
    viewer: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      mode: ''
    };
  }

  onClick(e, key) {
    e.preventDefault();
    e.stopPropagation();
    this.setState(state => {
      const mode = (key === state.mode ? '' : key);
      this.props.viewer.viewerImpl.controlManager.getToolByName('pickByRect').setPressKey(mode);
      return {
        mode,
      };
    });
  }

  render() {
    return ReactDom.createPortal((
      <div
        role="presentation"
        className={style.mobileTool}
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <button
          type="button"
          style={{
            backgroundColor: this.state.mode === 'ctrl' ? 'skyblue' : 'grey',
          }}
          onClick={e => { this.onClick(e, 'ctrl') }}
        >
          增选模式
        </button>
        <button
          type="button"
          style={{
            backgroundColor: this.state.mode === 'alt' ? 'skyblue' : 'grey',
          }}
          onClick={e => { this.onClick(e, 'alt') }}
        >
          减选模式
        </button>
      </div>
    ), this.props.viewer.viewportDiv);
  }
}

export default MobileTool;
