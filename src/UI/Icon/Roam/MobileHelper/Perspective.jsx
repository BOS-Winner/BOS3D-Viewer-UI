import React from 'react';
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import * as THREE from "THREE";
import CircleHelper from "./CircleHelper";
import style from "./perspective.less";
import rightController from '../../img/blue/rightController.png';

const SPEED = 0.002;

class Perspective extends React.Component {
  static propTypes = {
    viewer: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.timer = 0;
    this.dir = new THREE.Vector3(0, 0, 0);
  }

  onChange(dx, dy) {
    this.dir = new THREE.Vector3(
      (Math.abs(dy) < 10 ? 0 : dy < 0 ? 1 : -1) * SPEED, // 俯仰
      0,
      (Math.abs(dx) < 10 ? 0 : dx > 0 ? 1 : -1) * SPEED, // 左右
    );
  }

  onRotate() {
    this.props.viewer.viewerImpl.cameraControl.rotateCameraForWalk(this.dir.clone(), 1);
    this.props.viewer.viewerImpl.cameraControl.flyOnWorld(false);
    this.timer = requestAnimationFrame(() => { this.onRotate() });
  }

  onMoveStop() {
    cancelAnimationFrame(this.timer);
    this.timer = 0;
    this.dir = new THREE.Vector3(0, 0, 0);
  }

  render() {
    return ReactDOM.createPortal((
      <div className={style.perspectiveHelper}>
        <CircleHelper
          onStart={() => { this.onRotate() }}
          onChange={(dx, dy) => { this.onChange(dx, dy) }}
          onEnd={() => { this.onMoveStop() }}
          backgroundImage={rightController}
          centerImage="iconicon_h5shijuexuanzhuanyou"
        />
      </div>
    ), this.props.viewer.viewportDiv);
  }
}

export default Perspective;
