import React from 'react';
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import style from "./style.less";

class PointHelper extends React.Component {
  static propTypes = {
    viewer: PropTypes.object.isRequired,
    onTouchMove: PropTypes.func.isRequired,
    onOk: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      top: 'calc(50% - 15px)',
      left: 'calc(50% - 35px)',
    };
    this.ref = React.createRef();
    this.moveRef = React.createRef();
    this.moveOffset = {
      x: 0,
      y: 0,
    };
    this.clientPos = {
      clientX: 0,
      clientY: 0,
    };
  }

  componentDidMount() {
    // 监听真实事件，防止iOS safari拖动外层dom的bounding rect导致svg绘制坐标偏移
    this.moveRef.current.addEventListener('touchmove', e => { this.onTouchMove(e) });
  }

  onTouchStart(e) {
    e.preventDefault();
    e.stopPropagation();
    const CSS = getComputedStyle(this.ref.current);
    this.moveOffset.x = parseFloat(CSS.left || 0)
      - e.targetTouches[0].clientX
      - parseFloat(CSS.borderWidth || 0);
    this.moveOffset.y = parseFloat(CSS.top || 0)
      - e.targetTouches[0].clientY
      - parseFloat(CSS.borderWidth || 0);
  }

  onTouchMove(e) {
    e.preventDefault();
    e.stopPropagation();
    let top = e.targetTouches[0].clientY + this.moveOffset.y;
    let left = e.targetTouches[0].clientX + this.moveOffset.x;
    const CSS = getComputedStyle(this.ref.current);
    const pCSS = getComputedStyle(this.props.viewer.viewportDiv);
    if (
      left + parseFloat(CSS.width || 0) + parseFloat(CSS.borderWidth || 0)
      > parseFloat(pCSS.width || 0)
    ) {
      left = parseFloat(pCSS.width || 0)
        - parseFloat(CSS.width || 0) - parseFloat(CSS.borderWidth || 0);
    }
    if (left < 0) left = 0;
    if (
      top + parseFloat(CSS.height || 0) + parseFloat(CSS.borderWidth || 0)
      > parseFloat(pCSS.height || 0)
    ) {
      top = parseFloat(pCSS.height || 0)
        - parseFloat(CSS.height || 0) - parseFloat(CSS.borderWidth || 0);
    }
    if (top < 0) top = 0;
    if (left < 0) left = 0;
    this.clientPos = {
      clientX: e.targetTouches[0].clientX,
      clientY: e.targetTouches[0].clientY,
    };
    this.props.onTouchMove(this.clientPos);
    this.setState({
      top,
      left
    });
  }

  render() {
    return ReactDOM.createPortal((
      <div
        ref={this.ref}
        className={style.pointHelper}
        style={{
          top: this.state.top,
          left: this.state.left,
        }}
      >
        <div
          className={style.rect}
          onTouchStart={() => { this.props.onOk(this.clientPos) }}
        >
          &radic;
        </div>
        <div
          ref={this.moveRef}
          className={style.circle}
          onTouchStart={e => { this.onTouchStart(e) }}
        >
          &oplus;
        </div>
        <div className={style.rect}>&times;</div>
      </div>
    ), this.props.viewer.viewportDiv);
  }
}

export default PointHelper;
