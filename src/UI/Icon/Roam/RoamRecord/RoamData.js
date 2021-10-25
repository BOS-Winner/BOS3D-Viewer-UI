import THREE from "THREE";

const DEFAULT_FPS = 50;

/**
 * @class RoamData
 * @desc 漫游控制器，负责控制漫游路径的各个行为
 */
class RoamData {
  /**
   * @constructor
   * @param {object} props
   * @param {string} props.name - 名称
   * @param {string | number} props.id - id
   * @param {number} props.roamTime - 漫游时间，单位是秒
   * @param {object[]} [props.keyFrameList = []] - 关键帧list
   * @param {object} [props.parameters] - 内置参数
   * @param {number} [props.type = 1] - 插值类型，默认线性插值
   * @param {number} [props.fps = 50] - fps
   */
  constructor(props) {
    this.name = props.name;
    this.id = props.id;
    this.keyFrameList = [];
    this.roamTime = 5;
    this.interpolateType = 1;
    this.fps = DEFAULT_FPS;
    this.parts = 100;
    this.rotateSpeed = Math.PI / this.fps / 4;
    this.parameters = {
      segments: this.roamTime * this.fps * this.parts,
      closed: false,
      curveType: "centripetal",
      tension: 0.25
    };
    this.modificationId = 0;
    this.mapDeltaAngle = {};
    this.mapDeltaOffset = {};
    this.allocateSegmentList = null;
    this._init(props);
  }

  // TODO: 初始化顺序是否正确
  _init(props) {
    this.setKeyFrameList(props.keyFrameList);
    this.setParameters(props.parameters);
    this.setRoamTime(props.roamTime);
    this.setInterpolateType(props.type);
    this.setFps(props.fps);
  }

  /**
   * 添加关键帧
   * @param {object} frame
   * @param {string | number} frame.id - id
   * @param {{x: number, y: number, z: number}} frame.position - position
   * @param {{x: number, y: number, z: number}} frame.target - target
   */
  addKeyFrame(frame) {
    const position = new THREE.Vector3(frame.position.x, frame.position.y, frame.position.z);
    const target = new THREE.Vector3(frame.target.x, frame.target.y, frame.target.z);
    const up = new THREE.Vector3(frame.up.x, frame.up.y, frame.up.z);
    this.keyFrameList.push({
      position,
      target,
      up,
      id: frame.id
    });
    this.modificationId += 1;
  }

  setName(name) {
    this.name = name;
  }

  getName() {
    return this.name;
  }

  getId() {
    return this.id;
  }

  setKeyFrameList(list = []) {
    this.keyFrameList = [];
    for (let i = 0, len = list.length; i < len; i += 1) {
      this.addKeyFrame(list[i]);
    }
  }

  setParameters(parameters) {
    if (parameters) {
      this.parameters = parameters;
      this.modificationId += 1;
    }
  }

  setRoamTime(time) {
    this.roamTime = time;
    this.setSegments(time * this.fps * this.parts);
  }

  setSegments(segments) {
    this.parameters.segments = segments;
    this.modificationId += 1;
  }

  getSegments() {
    return this.parameters.segments;
  }

  /**
   * 设置插值类型
   * @param {number} [type = 1] - 插值类型(0: spline; 1: line)
   */
  setInterpolateType(type = 1) {
    this.interpolateType = type;
    if (type === 1) {
      this.setSplineTension(0);
    }
  }

  setSplineTension(tension) {
    if (tension >= 0 && tension <= 1) {
      this.parameters.tension = tension;
      this.modificationId += 1;
    }
  }

  setFps(fps = DEFAULT_FPS) {
    this.fps = fps;
    this.modificationId += 1;
  }

  getKeyFramePositions() {
    const positions = [];
    for (let i = 0, len = this.keyFrameList.length; i < len; i += 1) {
      const keyFrame = this.keyFrameList[i];
      positions.push(keyFrame.position);
    }
    return positions;
  }

  getKeyFramePosition(idx) {
    return this.keyFrameList[idx].position;
  }

  getKeyFrameTarget(idx) {
    return this.keyFrameList[idx].target;
  }

  getKeyFrameDirection(idx) {
    const keyFrame = this.keyFrameList[idx];
    return keyFrame.target.clone().sub(keyFrame.position);
  }

  getDeltaAngle(keyFrameIdx) {
    return this.mapDeltaAngle[keyFrameIdx];
  }

  getDeltaOffset(keyFrameIdx) {
    return this.mapDeltaOffset[keyFrameIdx];
  }

  getRotateAxis(keyFrameIdx) {
    const dir0 = this.getKeyFrameDirection(keyFrameIdx);
    const dir1 = this.getKeyFrameDirection(keyFrameIdx + 1);
    const currentAxis = dir0.clone().cross(dir1.clone());
    return currentAxis.normalize();
  }

  getJumpCounts(deltaTime) {
    const counts = deltaTime / (1000 / this.fps) * this.parts;
    return Math.round(counts - 0.5);
  }

  allocateSegments() {
    const segments = [];
    for (let i = 0, len = this.keyFrameList.length; i < len - 1; i += 1) {
      const pos1 = this.keyFrameList[i].position;
      const pos2 = this.keyFrameList[i + 1].position;
      segments.push(pos2.clone().sub(pos1).length());
    }

    let sum = 0;
    for (let j = 0, len = segments.length; j < len; j += 1) {
      sum += segments[j];
    }

    let leftSegments = this.getSegments();
    for (let k = 0, len = segments.length; sum !== 0 && k < len; k += 1) {
      segments[k] /= sum;
      segments[k] *= this.getSegments();
      segments[k] = Math.floor(segments[k]);
      leftSegments -= segments[k];
    }

    // 多余的segments均匀分配给每一段
    for (let l = 0; l < leftSegments; l += 1) {
      if (segments[l] > 0) {
        segments[l] += 1;
      }
    }

    this.allocateSegmentList = segments;
  }

  calculateDeltaAngle() {
    const segmentList = this.allocateSegmentList;
    for (let i = 0; i < segmentList.length; i += 1) {
      const dir0 = this.getKeyFrameDirection(i);
      const dir1 = this.getKeyFrameDirection(i + 1);
      const deltaAngle = dir0.angleTo(dir1);
      const segments = segmentList[i];
      if (segments === 0) {
        const frames = Math.floor(deltaAngle / this.rotateSpeed) * this.parts;
        segmentList[i] = frames;
        this.mapDeltaAngle[i] = deltaAngle / frames;
      } else {
        this.mapDeltaAngle[i] = deltaAngle / segments;
      }
    }
  }

  calculateDeltaOffset() {
    const segmentList = this.allocateSegmentList;
    const keyFramePositions = this.getKeyFramePositions();
    for (let i = 0; i < segmentList.length; i += 1) {
      const pos1 = keyFramePositions[i];
      const pos2 = keyFramePositions[i + 1];
      const segments = this.allocateSegmentList[i];
      if (segments === 0) {
        this.mapDeltaOffset[i] = new THREE.Vector3();
      } else {
        this.mapDeltaOffset[i] = pos2.clone()
          .sub(pos1)
          .divideScalar(segments);
      }
    }
  }

  getAllocateSegmentCount(idx) {
    if (this.allocateSegmentList === null) {
      this.allocateSegments();
    }
    return this.allocateSegmentList[idx];
  }

  getModificationId() {
    return this.modificationId;
  }

  getKeyFrameCount() {
    return this.keyFrameList.length;
  }

  export() {
    return {
      name: this.name,
      id: this.id,
      fps: this.fps,
      roamTime: this.roamTime,
      type: this.interpolateType,
      keyFrameList: this.keyFrameList,
    };
  }
}

export default RoamData;
