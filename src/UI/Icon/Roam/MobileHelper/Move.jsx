import React from 'react';
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import * as THREE from "THREE";
import CircleHelper from "./CircleHelper";
import leftController from '../../img/blue/leftController.png';
import style from "./move.less";

class Move extends React.Component {
  static propTypes = {
    viewer: PropTypes.object.isRequired,
    BIMWINNER: PropTypes.object.isRequired,
    speedRate: PropTypes.number,
  };

  static defaultProps = {
    speedRate: 1,
  };

  constructor(props) {
    super(props);
    this.timer = 0;
    this.dir = new THREE.Vector3(0, 0, 0);
    this.speed = 0;
  }

  onChange(dx, dy) {
    this.dir = new THREE.Vector3(
      Math.abs(dx) < 10 ? 0 : dx > 0 ? 1 : -1,
      Math.abs(dy) < 10 ? 0 : dy > 0 ? 1 : -1,
      0,
    );
    this.speed = Math.sqrt(dx * dx + dy * dy) * this.props.speedRate;
  }

  onMove() {
    const globalData = this.props.BIMWINNER.BOS3D.GlobalData;
    const cameraControl = this.props.viewer.viewerImpl.cameraControl;
    if (globalData.WalkingWithGravity) {
      cameraControl.computeManHeight();
      cameraControl.computeGravity();
    }
    cameraControl.translateCameraForWalk(
      new THREE.Vector3(this.dir.x, 0, 0), this.speed
    );
    cameraControl.translateCameraForWalk(
      new THREE.Vector3(0, this.dir.y, 0), this.speed
    );
    cameraControl.flyOnWorld(false);
    this.timer = requestAnimationFrame(() => { this.onMove() });
  }

  onMoveStop() {
    cancelAnimationFrame(this.timer);
    this.timer = 0;
    this.dir = new THREE.Vector3(0, 0, 0);
  }

  render() {
    return ReactDOM.createPortal((
      <div className={style.moveHelper}>
        <CircleHelper
          onStart={() => { this.onMove() }}
          onChange={(dx, dy) => { this.onChange(dx, dy) }}
          onEnd={() => { this.onMoveStop() }}
          backgroundImage={leftController}
          centerImage="iconicon_h5manyouzuo"
        />
      </div>
    ), this.props.viewer.viewportDiv);
  }
}

export default Move;
