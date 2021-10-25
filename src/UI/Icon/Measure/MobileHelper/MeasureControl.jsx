import * as React from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import * as style from "./MeasureControl.less";

class MeasureControl extends React.Component {
  constructor(props) {
    super(props);
    this.rootRef = React.createRef();
    this.targetRef = React.createRef();
    this.onTouchMove = this.onTouchMove.bind(this);
  }

  componentDidMount() {
    const current = this.rootRef.current;

    const div = this.rootRef.current.parentNode;
    if (div) {
      current.style.left = `${(div.clientWidth - current.clientWidth) / 2}px`;
      current.style.top = `${(div.clientHeight - current.clientHeight) / 2}px`;
    }
  }

  componentWillUnmount() {
    document.removeEventListener("touchmove", this.onTouchMove);
  }

  render() {
    return ReactDOM.createPortal((
      <div
        ref={this.rootRef}
        className={`${style.container}`}
      >
        <div className={style.control}>
          <div role="presentation" onClick={() => { this.confirm() }} className={style.confirm} />
          <div
            className={style.move}
            onTouchStart={(e) => { this.onTouchStart(e) }}
            onTouchEnd={(e) => { this.onTouchEnd(e) }}
          />
          <div role="presentation" onClick={() => { this.cancel() }} className={style.cancel} />
        </div>
        <div ref={this.targetRef} className={style.target} />
      </div>
    ), this.props.viewer.viewportDiv);
  }

  onTouchStart(e) {
    if (e.touches.length > 1) return;
    document.addEventListener("touchmove", this.onTouchMove);
    const current = this.rootRef.current;
    const rect = current.getBoundingClientRect();
    // let centerX = rect.left + current.clientWidth/2;
    // let centerY = rect.top + current.clientHeight/2;
    const touch = e.touches[0];

    // 私有信息
    this._touchInfo = {
      offsetX: touch.clientX - rect.left,
      offsetY: touch.clientY - rect.top,
      identifier: touch.identifier
    };
  }

  onTouchMove(e) {
    const touch = e.changedTouches[0];
    if (touch) {
      const id = touch.identifier;
      if (this._touchInfo) {
        if (this._touchInfo.identifier === id) {
          const current = this.rootRef.current;
          const parent = current.parentNode;
          const left = touch.clientX - this._touchInfo.offsetX;
          const top = touch.clientY - this._touchInfo.offsetY;

          if (left > 0 && left < parent.clientWidth - current.clientWidth) {
            current.style.left = `${left}px`;
          }
          if (top > 0 && top < parent.clientHeight - current.clientHeight) {
            current.style.top = `${top}px`;
          }

          const targetRect = this.targetRef.current.getBoundingClientRect();
          const pointX = targetRect.left + (targetRect.right - targetRect.left) / 2;
          const pointY = targetRect.top + (targetRect.bottom - targetRect.top) / 2;
          this.props.onTouchMove(pointX, pointY);
        }
      }
    }
  }

  onTouchEnd() {
    document.removeEventListener("touchmove", this.onTouchMove);
  }

  confirm() {
    const target = this.targetRef.current;
    const rect = target.getBoundingClientRect();
    const pointX = rect.left + (rect.right - rect.left) / 2;
    const pointY = rect.top + (rect.bottom - rect.top) / 2;

    this.props.onOk(pointX, pointY);
  }

  cancel() {
    this.props.onCancel();
  }
}

MeasureControl.propTypes = {
  onTouchMove: PropTypes.func.isRequired,
  onOk: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  viewer: PropTypes.object.isRequired
};

export default MeasureControl;
