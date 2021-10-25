import _ from "lodash-es";
import generateUUID from "UIutils/generateUUID";
import ProcedureRecord from "./ProcedureRecord";
import style from "./style.less";
import addImg from "./add.svg";

const LINE_KEY = "__bos3dui_line";
const CUBE_KEY = "__bos3dui_cube";

/**
 * @class LineEditor
 * @description 一定要先调用初始化函数生成线
 */
class LineEditor {
  /**
   * @constructor
   * @param {object} props - props
   * @props {object} props.viewer3D - viewer3D
   * @props {object} props.BOS3D - BOS3D
   * @param {function} [props.onDrag = () => {}] - 拖拽方块触发
   */
  constructor(props) {
    this.viewer3D = props.viewer3D;
    this.BOS3D = props.BOS3D;
    this.recorder = new ProcedureRecord();
    this.adding = false;
    // @deprecated prop
    this.removing = false;
    this.editKey = ''; // 正在编辑的mesh key
    this.editMeshInitPos = new props.BOS3D.THREE.Vector3();
    this.lineObject = null; // 线的Mesh
    this.tmpCube = null; // 临时方块的Mesh，鼠标在线上移动时会改变其几何，并在点击后保存它（此时重置它为null）
    this.cubeList = props.cubeList || []; // 不包括起点和终点
    this.startPoint = props.startPoint || null; // Vector3
    this.endPoint = props.endPoint || null; // Vector3
    this.mousemoveFn = () => {}; // 用来在线上添加方块（即在线上拾取点）的回调
    this.clickFn = this.clickToAddCube(); // 开始添加点之后，使用此函数作为在线上点击添加方块的回调
    this.moveCubeFn = _.throttle(this.moveCubeListener(), 16); // 用来拖动方块的回调
    this.cameraChangeFn = _.throttle(this.cameraChangeListener.bind(this), 16);
    this.rmCubeFn = () => {}; // 用来移除方块的回调
    this.onUserDrag = props.onDrag || (() => {});
    this.tag = document.createElement('div');
    this.tag.classList.add(style.tag);
    this.viewer3D.viewportDiv.appendChild(this.tag);
    this.curve = {};
    this.models = _.values(this.viewer3D.viewerImpl.modelManager.models) || []; // 当前场景中的模型
  }

  /**
   * 初始化设置，绘制起点、终点、初始路线
   * @param {THREE.Vector3} [start] - 起点
   * @param {THREE.Vector3} [end] - 终点
   */
  start(start, end) {
    // 如果没传起终点，说明是恢复操作
    if (!(start && end)) {
      this.lineObject = this.drawHelper(this.startPoint, this.endPoint);
      this.updateLine();
      this.cubeList.forEach(cube => {
        this.viewer3D.addExternalObject(cube.key, cube);
      });
    } else {
      this.startPoint = start;
      this.endPoint = end;
      this.lineObject = this.drawHelper(start, end);
      // this.viewer3D.getScene().add(this.group);
      // this.group.updateMatrixWorld();
      // this.viewer3D.render();
    }
    this.viewer3D.viewportDiv.addEventListener('mousemove', this.moveCubeFn);
    this.viewer3D.registerCameraEventListener(
      this.BOS3D.EVENTS.ON_CAMERA_CHANGE,
      this.cameraChangeFn
    );
  }

  stop(current) {
    this.switchDragCube('');
    if (!current) {
      this.viewer3D.removeExternalObjectByName(CUBE_KEY);
      this.viewer3D.removeExternalObjectByName(LINE_KEY);
      this.viewer3D.viewportDiv.removeEventListener('mousemove', this.moveCubeFn);
      this.viewer3D.unregisterCameraEventListener(
        this.BOS3D.EVENTS.ON_CAMERA_CHANGE,
        this.cameraChangeFn
      );
      if (this.adding) {
        this.viewer3D.viewportDiv.style.cursor = '';
      }
    }
    this.cubeList.forEach(cube => {
      this.viewer3D.removeExternalObjectByName(cube.key);
    });
    this.adding = false;
    this.removing = false;
    // this.lineObject = {};
  }

  /**
   * 退出编辑模式
   */
  clearEdit() {
    this.switchDragCube('');
  }

  /**
   * 添加中间方块（用户交互）
   * @description 必须一个个添加。上一个没添加完毕则禁止添加下一个
   * @param {function} [callback] - 成功添加后的回调，回传方块位置
   * @return {boolean} - 是否成功启用此功能
   */
  addCube(callback) {
    if (this.adding) return false;
    this.adding = true;
    // this.cubeList.forEach(cube => {
    //   cube.onAfterRender = () => {};
    // });
    this.switchDragCube('');
    this.mousemoveFn = _.throttle(this.hoverLineListener(), 16);
    this.viewer3D.viewportDiv.addEventListener('mousemove', this.mousemoveFn);
    this.clickFn = this.clickToAddCube(callback);
    this.viewer3D.viewportDiv.addEventListener('click', this.clickFn);
    this.viewer3D.viewportDiv.style.cursor = `url(${addImg}) -12 -12, auto`;
    return true;
  }

  /**
   * 移除方块
   * @param {number} index - 方块index
   * @param {function} [callback] - 成功删除后的回调
   * @return {boolean} - 是否成功启用此功能
   */
  rmCube(index, callback) {
    if (this.removing || this.cubeList.length === 0) return false;
    this.recorder.record('remove', {
      mesh: this.cubeList[index],
      index,
    });
    this._rmCube(this.cubeList[index], callback);
    // this.rmCubeFn = this.rmCubeListener(callback);
    // this.viewer3D.viewportDiv.addEventListener('click', this.rmCubeFn);
    // this.removing = true;
    return true;
  }

  _rmCube(cube, callback) {
    this.switchDragCube('');
    this.cubeList.some((_cube, index) => {
      if (_cube === cube) {
        this.viewer3D.removeExternalObjectByName(cube.key);
        this.cubeList.splice(index, 1);
        this.updateLine();
        this.updateTag();
        this.viewer3D.viewportDiv.removeEventListener('click', this.rmCubeFn);
        this.viewer3D.render();
        this.removing = false;
        callback(index);
        return true;
      }
      return false;
    });
  }

  /**
   * 手动更新方块的位置
   * @param {string} key - cube key
   * @param {number[]} pos - 坐标
   */
  updateCubePosition(key, pos) {
    this.cubeList.some(cube => {
      if (cube.key === key) {
        this.recorder.record('move', {
          key,
          from: cube.position.clone(),
          to: cube.position.clone().fromArray(pos),
        });
        const mat = new this.BOS3D.THREE.Matrix4();
        mat.elements[12] = pos[0] - cube.position.x;
        mat.elements[13] = pos[1] - cube.position.y;
        mat.elements[14] = pos[2] - cube.position.z;
        this.viewer3D.componentApplyMatrix(key, mat);
        this.updateLine();
        if (this.editKey) {
          this.switchDragCube('');
        }
        this.viewer3D.render();
        return true;
      }
      return false;
    });
  }

  /**
   * 获取方块列表
   * @return {{position: number[], key: string}[]}
   */
  getList() {
    return _.cloneDeep(
      this.cubeList.map(cube => ({
        position: cube.position.toArray(),
        key: cube.uuid,
      }))
    );
  }

  /**
   * 获取线的插值
   * @return {THREE.CatmullRomCurve3} - 曲线插值对象
   */
  getCurve() {
    const points = [this.startPoint.clone()];
    this.cubeList.forEach(_c => {
      points.push(_c.position.clone());
    });
    points.push(this.endPoint.clone());
    this.curve.setControlPoints(points);
    return this.curve;
  }

  reset() {
    this.switchDragCube('');
    this.cubeList.forEach(cube => {
      // cube.onAfterRender = () => {};
      this.viewer3D.removeExternalObjectByName(cube.key);
    });
    this.cubeList = [];
    this.updateLine();
    this.recorder.init();
    this.viewer3D.render();
  }

  canUndo() {
    return this.recorder.canUndo();
  }

  undo(callback = () => {}) {
    if (this.adding || this.removing) return;
    this.recorder.undo(param => {
      this.switchDragCube('');
      switch (param.type) {
        case 'add':
          this._rmCube(param.payload, callback);
          break;
        case 'remove': {
          for (let i = this.cubeList.length - 1; i >= param.payload.index; i--) {
            this.cubeList[i + 1] = this.cubeList[i];
          }
          const mesh = param.payload.mesh;
          this.cubeList[param.payload.index] = mesh;
          this.updateLine();
          this.viewer3D.addExternalObject(mesh.key, mesh);
          callback(mesh.position.toArray());
          break;
        }
        case 'move': {
          const cube = this.viewer3D.getExternalObjectByName(param.payload.key);
          const mat = new this.BOS3D.THREE.Matrix4();
          mat.elements[12] = param.payload.from.x - cube.position.x;
          mat.elements[13] = param.payload.from.y - cube.position.y;
          mat.elements[14] = param.payload.from.z - cube.position.z;
          this.viewer3D.componentApplyMatrix(cube.key, mat);
          this.updateLine();
          this.viewer3D.render();
          callback();
          break;
        }
        default:
          break;
      }
    });
  }

  canRedo() {
    return this.recorder.canRedo();
  }

  redo(callback = () => {}) {
    if (this.adding || this.removing) return;
    this.recorder.redo(param => {
      this.switchDragCube('');
      switch (param.type) {
        case 'add':
          const pointInfo = this.curve.getPointsInfo();
          // 判断线段关键点的索引是否大于插入的点索引，大于说明插入的点位在线段关键点前面
          const index = pointInfo.controlPointsIndex
            .findIndex(item => item.order > param.payload.index);
          // 说明线段内没有线段关键点或者线段内的关键点都插入点的前面
          if (index === -1) {
            this.cubeList.push(param.payload);
          } else {
            this.cubeList.splice(index - 1, 0, param.payload);
          }
          this.updateLine();
          this.viewer3D.addExternalObject(param.payload.key, param.payload);
          callback(param.payload.position.toArray());
          break;
        case 'remove':
          this._rmCube(param.payload.mesh, callback);
          break;
        case 'move': {
          const cube = this.viewer3D.getExternalObjectByName(param.payload.key);
          const mat = new this.BOS3D.THREE.Matrix4();
          mat.elements[12] = param.payload.to.x - cube.position.x;
          mat.elements[13] = param.payload.to.y - cube.position.y;
          mat.elements[14] = param.payload.to.z - cube.position.z;
          this.viewer3D.componentApplyMatrix(cube.key, mat);
          this.updateLine();
          this.viewer3D.render();
          callback();
          break;
        }
        default:
          break;
      }
    });
  }

  preview(index) {
    this.switchDragCube('');
    this.viewer3D.adaptiveSizeByKey(this.cubeList[index].key);
  }

  // --------------------------下面的方法都是私有的---------------------------

  // 点击添加方块的时间，用于添加时的click事件监听函数
  clickToAddCube(callback = () => {}) {
    return () => {
      if (this.tmpCube) {
        const _this = this;
        this.viewer3D.viewportDiv.removeEventListener('mousemove', this.mousemoveFn);
        this.viewer3D.viewportDiv.removeEventListener('click', this.clickFn);
        this.viewer3D.viewportDiv.style.cursor = '';
        // 返回曲线内控制点在线段上的信息 信息内包含曲线的索引
        const pointInfo = this.curve.getPointsInfo();
        // 判断线段关键点的索引是否大于插入的点索引，大于说明插入的点位在线段关键点前面
        const index = pointInfo.controlPointsIndex
          .findIndex(item => item.order > _this.tmpCube.index);
        // 说明线段内没有线段关键点或者线段内的关键点都插入点的前面
        if (index === -1) {
          this.cubeList.push(this.tmpCube);
        } else {
          this.cubeList.splice(index - 1, 0, this.tmpCube);
        }
        this.updateLine();
        callback(this.tmpCube.position.toArray());
        this.recorder.record('add', this.tmpCube);
        this.tmpCube = null;
        this.adding = false;
      }
    };
  }

  /**
   * 生成方块mesh
   * @param {THREE.Vector3} position - 位置
   * @return {THREE.Mesh}
   */
  genCubeObject(position) {
    const THREE = this.BOS3D.THREE;
    const material = new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff });
    let geometry = new THREE.BoxBufferGeometry(200, 200, 200);

    // 判断当前模型是不是合并模型
    // 合并模型的单位是m（米），所以在scene中显示会比较小，需要判断
    if (this.models.length && this.models[0].originalLengthUnit === "m") {
      geometry = new THREE.BoxBufferGeometry(0.2, 0.2, 0.2);
    }

    const object = new THREE.Mesh(geometry, material);

    if (position) {
      object.position.copy(position);
    } else {
      throw new Error('need position');
    }

    return object;
  }

  /**
   * 画线和起终点
   * @param {THREE.Vector3} start - 起点
   * @param {THREE.Vector3} end - 终点
   * @return {THREE.Line}
   */
  drawHelper(start, end) {
    const THREE = this.BOS3D.THREE;
    // 创建起点和终点
    const cubeObjects = [];
    cubeObjects.push(
      this.genCubeObject(start),
      this.genCubeObject(end),
    );
    // 创建线
    this.curve = new this.BOS3D.BOSCatmullRomCurve3ForFrameEdit({ "controlPoints": [start.clone(), end.clone()], "coef": 0.3 });
    const geo = new THREE.Geometry();
    geo.vertices = this.curve.getPoints();
    const material = new THREE.LineBasicMaterial({
      color: 0x4dc0ff,
      // linewidth: 6.18,
      // depthTest: true,
      transparent: false,
    });
    const lineObject = new THREE.Line(geo, material);

    this.viewer3D.addExternalObject(LINE_KEY, lineObject);
    this.viewer3D.addExternalObject(CUBE_KEY, cubeObjects);
    // this.group.add(cubeObjects[0]);
    // this.group.add(cubeObjects[1]);
    // this.group.add(lineObject);

    return lineObject;
  }

  // 更新线的几何
  updateLine() {
    const geo = new this.BOS3D.THREE.Geometry();
    geo.vertices = this.getCurve().getPoints();
    this.lineObject.geometry = geo;
    this.lineObject.updateMatrix();
  }

  updateTag() {
    if (this.editKey) {
      let index = 0;
      this.cubeList.some((cube, i) => {
        if (cube.key === this.editKey) {
          index = i;
          return true;
        }
        return false;
      });
      this.tag.innerText = `帧${index + 1}`;
      const box = this.viewer3D.getBoxByComponentsKey(this.editKey);
      const coord = this.viewer3D
        .getScreenCoordFromSceneCoord(box.getCenter(new this.BOS3D.THREE.Vector3()))
        .map(x => Math.round(x) - 50);
      this.tag.style.top = `${coord[1]}px`;
      this.tag.style.left = `${coord[0]}px`;
      this.tag.style.display = 'block';
    } else {
      this.tag.style.display = 'none';
    }
  }

  // 有在编辑的方块则切换，刚好等于在编辑的方块则关闭，key为空也关闭
  switchDragCube(key) {
    // 先清空所有的onAfterRender
    // if (this.editKey) {
    //   this.cubeList.some(cube => {
    //     if (cube.key === this.editKey) {
    //       cube.onAfterRender = () => {};
    //       return true;
    //     }
    //     return false;
    //   });
    // }

    if (this.editKey === key || key === '') {
      this.viewer3D.cancelTransformComponent();
      this.editKey = '';
      this.editMeshInitPos.set(0, 0, 0);
      this.updateTag();
    } else {
      this.viewer3D.translateComponentByKey(
        key,
        this._onRender(key),
        () => {
          const cube = this.viewer3D.getExternalObjectByName(key);
          this.recorder.record('move', {
            key,
            from: this.editMeshInitPos.clone(),
            to: cube.position.clone(),
          });
          this.editMeshInitPos.copy(cube.position);
        }
      );
      const mesh = this.viewer3D.getExternalObjectByName(key);
      this.editKey = key;
      this.editMeshInitPos.copy(mesh.position);
      // this.cubeList.some(cube => {
      //   if (cube.key === key) {
      //     cube.onAfterRender = _.onRender(key);
      //     return true;
      //   }
      //   return false;
      // });
      this.updateTag();
    }
  }

  _onRender(key) {
    return _.throttle(_key => {
      if (key === _key) {
        this.updateLine();
        // 正在添加方块时不触发
        if (!this.adding) {
          this.onUserDrag();
        }
        this.updateTag();
        console.debug('line refresh');
      }
    }, 16);
  }

  /**
   * 鼠标在移动时拾取线上的点
   * @return {function} - 鼠标移动事件监听函数
   */
  hoverLineListener() {
    const THREE = this.BOS3D.THREE;
    const raycaster = new this.BOS3D.Raycaster();
    const mouse = new THREE.Vector2();
    const camera = this.viewer3D.getViewerImpl().camera;
    raycaster.params.Line.threshold = 100;

    // 判断当前场景中是否是合并模型
    if (this.models.length && this.models[0].originalLengthUnit === "m") {
      raycaster.params.Line.threshold = 0.1;
    }
    let cube;

    return ev => {
      this.viewer3D.getViewerImpl().cameraControl
        .mapWindowToViewport(ev.clientX, ev.clientY, mouse);
      raycaster.setFromCamera(mouse, camera);
      const intersect = raycaster.intersectObject(this.lineObject);
      if (intersect) {
        if (cube) {
          cube.position.copy(intersect.point);
        } else {
          cube = this.genCubeObject(intersect.point);
          // this.group.add(cube);
          this.viewer3D.addExternalObject(`${CUBE_KEY}_${generateUUID()}`, cube);
        }
        cube.visible = true;
        cube.updateMatrixWorld();
        this.tmpCube = cube;
        this.tmpCube.index = intersect.index;
        this.viewer3D.render();
      } else if (cube) {
        cube.visible = false;
        this.tmpCube = null;
        this.viewer3D.render();
      }
    };
  }

  // 鼠标在屏幕上移动，拖动方块时的事件监听
  moveCubeListener() {
    const raycaster = new this.BOS3D.Raycaster();
    const mouse = new this.BOS3D.THREE.Vector2();
    const camera = this.viewer3D.getViewerImpl().camera;

    return ev => {
      if (this.adding || this.removing) return;
      this.viewer3D.getViewerImpl().cameraControl
        .mapWindowToViewport(ev.clientX, ev.clientY, mouse);
      raycaster.setFromCamera(mouse, camera);
      const intersect = raycaster.intersectObjects(this.cubeList);
      if (intersect && intersect.object.key !== this.editKey) {
        this.switchDragCube(intersect.object.key);
      }
    };
  }

  /**
   * 移除方块时的事件监听
   * @deprecated
   * @param {function} [callback]
   * @return {function(Event): (undefined)}
   */
  rmCubeListener(callback = () => {}) {
    const raycaster = new this.BOS3D.Raycaster();
    const mouse = new this.BOS3D.THREE.Vector2();
    const camera = this.viewer3D.getViewerImpl().camera;
    raycaster.params.Line.threshold = 100;

    return ev => {
      if (!this.removing) return;
      this.viewer3D.getViewerImpl().cameraControl
        .mapWindowToViewport(ev.clientX, ev.clientY, mouse);
      raycaster.setFromCamera(mouse, camera);
      const intersect = raycaster.intersectObjects(this.cubeList);
      if (intersect) {
        this._rmCube(intersect.object, callback);
        this.recorder.record('remove', intersect.object);
      }
    };
  }

  cameraChangeListener() {
    if (this.editKey) {
      this.updateTag();
    }
  }
}

export default LineEditor;
