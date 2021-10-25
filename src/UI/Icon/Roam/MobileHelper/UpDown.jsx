import React from 'react';
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import * as THREE from "THREE";
import RectHelper from "./RectHelper";
import style from "./upDown.less";

class UpDown extends React.Component {
  static propTypes = {
    viewer: PropTypes.object.isRequired,
    BIMWINNER: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.timer = 0;
    this.dir = new THREE.Vector3(0, 0, 0);
    this.speed = 0;
  }

  onChange(dy) {
    this.dir = new THREE.Vector3(
      0,
      0,
      dy === 0 ? 0 : dy < 0 ? 1 : -1,
    );
    this.speed = Math.abs(dy) * 2;
  }

  onMove() {
    const globalData = this.props.BIMWINNER.BOS3D.GlobalData;
    if (!globalData.WalkingWithGravity) {
      this.props.viewer.viewerImpl.cameraControl.translateCameraForWalk(
        this.dir.clone(), this.speed
      );
      this.props.viewer.viewerImpl.cameraControl.flyOnWorld(false);
      this.timer = requestAnimationFrame(() => {
        this.onMove();
      });
    }
  }

  onMoveStop() {
    cancelAnimationFrame(this.timer);
    this.timer = 0;
    this.dir = new THREE.Vector3(0, 0, 0);
  }

  render() {
    return ReactDOM.createPortal((
      <div className={style.upDownHelper}>
        <RectHelper
          onStart={() => { this.onMove() }}
          onChange={dy => { this.onChange(dy) }}
          onEnd={() => { this.onMoveStop() }}
        />
      </div>
    ), this.props.viewer.viewportDiv);
  }
}

export default UpDown;
