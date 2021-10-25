import THREE from "THREE";
import _ from "lodash-es";

class RoamPlayer {
  /**
   * @constructor
   * @param {object} props
   * @param {object} props.viewer - viewer3D.viewerImpl实例
   * @param {object} props.roamData - 漫游数据实例
   */
  constructor(props) {
    this.viewer = props.viewer;
    this.roam = null;
    this.bPause = false;
    this.bContinue = false;
    this.spline = null;

    this.reqid = 0;
    this.recordId = -1;

    this.keyFrameIdx = 0;
    this.count = -1;

    this.camera = this.viewer.cameraControl.camera;

    this.pausePlayCallback = null;
    this.stopPlayCallback = null;

    this.timeRecorder = {
      last: 0,
      pause: 0,
      deltaTime: 0
    };
    this.keyFrameCallback = null;

    this.setRoam(props.roamData);
  }

  /**
   * 设置漫游数据
   * @param {object} wt - RoamData实例
   */
  setRoam(wt) {
    this.roam = wt;
    this.bPause = false;
    this.recordId = -1;
    this.spline = null;
    this.keyFrameIdx = 0;
    this.count = -1;
  }

  updateCamera(offset, eye) {
    this.camera.position.add(offset);
    this.camera.target.addVectors(this.camera.position, eye);
  }

  _play() {
    this.reqid = requestAnimationFrame(() => {
      this._play();
    });
    if (this.bContinue === false) {
      this.bContinue = true;
      this.timeRecorder.deltaTime = this.timeRecorder.pause - this.timeRecorder.last;
    } else {
      this.timeRecorder.deltaTime = performance.now() - this.timeRecorder.last;
    }
    this.timeRecorder.last = performance.now();
    let jumpCounts = this.roam.getJumpCounts(this.timeRecorder.deltaTime);

    if (this.recordId !== this.roam.getModificationId()) {
      this.roam.allocateSegments();
      this.roam.calculateDeltaOffset();
      this.roam.calculateDeltaAngle();
      this.recordId = this.roam.getModificationId();
    }
    if (this.bPause) {
      this.timeRecorder.pause = performance.now();
      console.log(`Roam pause now,key frame index is ${this.keyFrameIdx}`);
      cancelAnimationFrame(this.reqid);
      if (typeof this.pausePlayCallback === 'function') {
        this.pausePlayCallback();
      }
      this.bPause = false;
      this.bContinue = false;
      return;
    }
    const totalKeyFrame = this.roam.getKeyFrameCount();
    const segmentCount = this.roam.getAllocateSegmentCount(this.keyFrameIdx);
    if (segmentCount === 0) {
      this.keyFrameIdx += 1;
      this.triggerKeyFrameCallback(this.keyFrameIdx);
      this.count = -1;
    } else if (this.keyFrameIdx === totalKeyFrame - 1) {
      this.stop();
      return;
    } else if (this.count === -1) {
      this.timeStart = performance.now();
      if (this.keyFrameIdx === 0) {
        this.triggerKeyFrameCallback(0);
      }
      const position = this.roam.getKeyFramePosition(this.keyFrameIdx);
      const target = this.roam.getKeyFrameTarget(this.keyFrameIdx);
      this.camera.position.copy(position);
      this.camera.target.copy(target);
      this.count = 0;
    } else if (this.count < segmentCount) {
      if (this.count + jumpCounts > segmentCount) {
        jumpCounts = segmentCount - this.count;
      }
      const offset = this.roam.getDeltaOffset(this.keyFrameIdx);
      const deltaAngle = this.roam.getDeltaAngle(this.keyFrameIdx);
      const rotateAxis = this.roam.getRotateAxis(this.keyFrameIdx);

      const eye = new THREE.Vector3();
      eye.subVectors(this.camera.target.clone(), this.camera.position);
      if (!_.isNaN(rotateAxis.length())) {
        eye.applyAxisAngle(rotateAxis, deltaAngle * jumpCounts);
      }

      if (this.count + jumpCounts === segmentCount) {
        this.keyFrameIdx += 1;
        this.triggerKeyFrameCallback(this.keyFrameIdx);
        this.count = 0;
      } else {
        this.count += jumpCounts;
      }
      this.updateCamera(offset.clone().multiplyScalar(jumpCounts), eye);
    }
    this.viewer.render();
  }

  play() {
    this.bPause = false;
    this._play();
  }

  pause() {
    this.bPause = true;
  }

  stop() {
    this.bPause = false;
    this.keyFrameIdx = 0;
    this.count = -1;
    console.log(`Time cost ${performance.now() - this.timeStart}ms.`);
    cancelAnimationFrame(this.reqid);
    if (typeof this.stopPlayCallback === 'function') {
      this.stopPlayCallback();
    }
  }

  triggerKeyFrameCallback(idx) {
    if (typeof this.keyFrameCallback === 'function') {
      this.keyFrameCallback(idx);
    }
  }

  addPausePlayCallback(callback) {
    this.pausePlayCallback = callback;
  }

  addStopPlayCallback(callback) {
    this.stopPlayCallback = callback;
  }
}

export default RoamPlayer;
