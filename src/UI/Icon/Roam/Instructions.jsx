import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import freeRoamCtrlImg from "./img/freeRoamCtrl.png";
import style from "./style.less";
// import direction from "./img/direction.png";
// import wasd from "./img/wasd.png";
// import q from "./img/q.png";
// import e from "./img/e.png";
// import mouse from "./img/mouse.jpeg";
// import plus from "./img/plus.png";
// import minus from "./img/minus.png";

class Instructions extends React.PureComponent {
  render() {
    if (this.props.show) {
      return ReactDOM.createPortal(
        <div
          className={style.instruction}
          role="presentation"
          onClick={ev => {
            ev.preventDefault();
            ev.stopPropagation();
          }}
        >
          <div className={style.title}>
            <span
              role="button"
              tabIndex={0}
              onClick={ev => {
                ev.preventDefault();
                ev.stopPropagation();
                this.props.onClose();
              }}
            >
              x
            </span>
          </div>
          <div className={style.container}>
            <div className={style.row1}>
              <div>速度</div>
              <div>视角</div>
            </div>
            <img alt="tips" src={freeRoamCtrlImg} />
            <div className={style.row3}>
              按Shift键加速
            </div>
          </div>
        </div>,
        this.props.viewportDiv
      );
    } else {
      return '';
    }
  }
}

Instructions.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  viewportDiv: PropTypes.object.isRequired, // wtf!!!
};

export default Instructions;
