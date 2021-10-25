/* eslint-disable react/no-deprecated */
import React, { createRef } from 'react';
import ReactDOM from "react-dom";
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import _ from "lodash-es";
import CustomConfirm from 'Base/CustomConfirm';
import { Button } from "antd";
// import LineEditor from "Libs/LineEditor";
import PerspectiveItem from "./PerspectiveItem";
// import RoamManager from '../RoamManager';
import FrameEditor from "./FrameEditor";
import toastr from "../../../toastr";
import style from "./style.less";
import { AntdIcon } from '../../../utils/utils';
import { changeMouseIcon } from "../../action";
// import RouteManager from './RouteManager';

class PerspectiveManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      perspective: [], // 视角列表，用于保存视角
      circleList: [], // coord: [number, number, number], name: string
      isPreviewing: false, // 记录是否正在预览全部视角
      editingIndex: 0, // 大于0为有效，代表正在编辑index-1和index的视角
      // editRouteKey: "", // 空字符串是说明现在没有在编辑路径
      perspectiveItemActive: "", // 记录当前点击的视角
    };
    this.frameList = []; // {index: THREE.Curve}，用于记录视角之间的插帧，表示第index-1到index之间有插帧
    this.perspNum = 0; // 记录历史视角数量，主要用于命名处理。保存路径后要回到1
    this.inputRef = React.createRef();
    this.svgParent = props.viewer.getViewerImpl().getRenderer().domElement.parentNode;
    this.routePathRef = createRef();
    this.updateCircleListCB = this.updateCircleList.bind(this);
    this.previewRoamManager = null;
    this.editorList = []; // {index: LineEditor}，帧编辑器实例列表
    this.customRouteIndex = createRef(0);
    this.tempInputName = "";
    this.roamManager = props.roamManager;

    // 优化 - 实例化路径列表管理对象
    this.perspectiveList = new props.BOS3D.Plugins.Roam.PerspectivesList({
      viewer: props.viewer,
    });
  }

  componentDidMount() {
    // 注册相机位置变动事件
    this.props.viewer.registerCameraEventListener(
      this.props.BOS3D.EVENTS.ON_CAMERA_CHANGE,
      this.updateCircleListCB
    );
    this.props.onRef(this);
  }

  componentWillUnmount() {
    this.props.viewer.unregisterCameraEventListener(
      this.props.BOS3D.EVENTS.ON_CAMERA_CHANGE,
      this.updateCircleListCB
    );
    // 关闭后更新小圆点
    this.updateCircleListCB();
  }

  componentDidUpdate(prevProps) {
    if (this.state.perspective.length === 0) {
      this.perspNum = 0;
    }
    const i = this.state.editingIndex;
    if (prevProps.mode === '漫游模式' && this.props.mode !== '漫游模式' && i > 0) {
      this.handleEditFrame(i);
    }
  }

  shouldComponentUpdate(nextProps) {
    // 处理帧编辑逻辑
    if (nextProps.editRouteKey !== "" && this.props.editRouteKey !== nextProps.editRouteKey) {
      const routeData = nextProps.routeList.getRouteById(nextProps.editRouteKey);
      // 根据路径数据，生成新的视角列表
      this.perspectiveList.reGenPerspList(
        routeData,
        this.updatePerspectiveList
      );
      // 修复路径名称显示
      this.inputRef.current.value = routeData.name || "";
    }
    // 处理路径显示
    if (nextProps.mode === "" || !nextProps.active) {
      this.routePathRef.current.style.display = 'none';
    } else {
      this.routePathRef.current.style.display = 'block';
    }
    // 处理切换漫游模式后，重置帧编辑状态
    if (this.state.editingIndex && !nextProps.active) {
      this.reset();
    }
    return true;
  }

  _handleCustomRouteIndex = () => {
    this.customRouteIndex.current += 1;
  }

  flyTo(camera) {
    this.props.viewer.linearFlyTo(camera);
  }

  /**
   * 通过视角名称查询视角
   * @param {string} name
   * @return {number} - index
   */
  getIndexByName(name) {
    let rst = -1;
    this.state.perspective.some((persp, i) => {
      if (persp.name === name) {
        rst = i;
        return true;
      }
      return false;
    });
    return rst;
  }

  updateCircleList() {
    const circleList = [];
    const viewer = this.props.viewer;
    this.state.perspective.forEach((item) => {
      if (item.circlePosition) {
        circleList.push({
          coord: viewer.getScreenCoordFromSceneCoord(item.circlePosition),
          position: item.circlePosition,
          name: item.name
        });
      }
    });
    this.setState({
      circleList,
    });
  }

  // 编辑帧
  editPersp(name, updatePosition) {
    CustomConfirm({
      title: '请确认',
      message: `是否要修改编号为${name}的视角为当前视角？`,
      viewportDiv: document.getElementById('roam'),
      okFunc: () => {
        const index = this.getIndexByName(name);
        if (index > -1) {
          // 更新坐标
          if (updatePosition && typeof updatePosition === "function") {
            updatePosition();
          } else {
            throw new Error("更新视角方法错误！");
          }
          // 更新视角列表
          this.updateCircleList(() => {
            this.updateCircleList();
          });
        }
      },
    });
  }

  /**
   * 删除视角函数
   * @param {number} index 视角索引
   */
  rmPersp(index) {
    // 当前视角是否存在插入的帧
    const frameExist = this.perspectiveList.existEditFrameData(index);
    const name = this.perspectiveList.getPerspList()[index].name;
    // 提示
    CustomConfirm({
      title: '请确认',
      message: frameExist ? "帧编辑器窗口中存在已添加的帧，确定要删除吗？" : `是否要删除编号为${name}的视角？`,
      viewportDiv: document.getElementById('roam'),
      okFunc: () => {
        if (index > -1) {
          // 删除视角
          this.perspectiveList.removePerspective(index);
          // 更新视角列表
          this.updatePerspectiveList();
        }
      },
    });
  }

  // 添加视角
  addPerspective = () => {
    this.perspectiveList.addPerspective();
    // 更新视角列表
    this.updatePerspectiveList(() => {
      this.updateCircleList();
      this.props.viewer.getViewerImpl().controlManager.setFocus();
    });
  }

  // 保存路径
  saveRoute = () => {
    // 只有超过两个视角才可以保存路径
    if (this.state.perspective.length < 2) {
      toastr.error('请至少添加两个视角', '', {
        target: `#${this.props.viewer.viewport}`,
      });
      // 重置当前视角的激活状态
      // this.handleCurrentPersp();
      return;
    }

    // 添加路径
    const routeName = this.inputRef.current.value;
    if (this.state.editingIndex > 0) {
      const currentEditPersp = this.state.perspective[this.state.editingIndex];
      currentEditPersp.editor.stop();
    }
    const route = this.perspectiveList.genRoute(routeName);
    // 如果当前是编辑的路径
    if (this.props.editRouteKey) {
      route.id = this.props.editRouteKey;
    }
    this.props.routeList.addRoute(route);
    // 更新路径列表
    this.props.updateRouteList();
    this.reset();
    // 提醒
    this.props.handleTip();
  }

  /**
   * 全部视角播放函数
   */
  switchPlayAll() {
    this.setState(state => ({
      isPreviewing: !state.isPreviewing,
    }), () => {
      this.perspectiveList.switchPlayAndStop(() => {
        this.setState({
          isPreviewing: false,
        });
      });
    });
  }

  /**
   * viewer中集成的帧编辑功能
   * @param {number} index 当前编辑帧的索引
   */
  handleEditFrame = (index) => {
    // 索引大于1的的视角才可以编辑帧
    if (index < 1) {
      return;
    }
    // 判断当前视角是否正在编辑帧
    let currentPersp;
    if (index < this.perspectiveList.getPerspList().length) {
      currentPersp = this.perspectiveList.getPerspList()[index];
    }
    if (currentPersp.editing) { // 正在编辑
      // 停止编辑
      currentPersp.editor.stop();
      currentPersp.setEditingStatus(false);
      // 隐藏帧编辑弹框
      this.setState({
        editingIndex: 0,
      });
      return;
    }

    if (this.state.editingIndex === 0) {
      // 开启帧编辑
      this.perspectiveList.editPerspective(index);
      // 更新状态
      currentPersp.setEditingStatus(true);
      this.updatePerspectiveList();
      this.setState(
        { editingIndex: index }
      );
    }
  }

  // 重置功能：关闭正在编辑视角
  reset = () => {
    const { editingIndex, perspective } = this.state;
    this.perspectiveList.cleanPerspList();
    if (editingIndex > 0) {
      perspective[editingIndex].editor.stop();
    }
    this.setState({
      editingIndex: 0,
    });
    this.updateCircleList();
    // 关闭路径编辑
    this.props.closeEdit();
    // 重置路径名称
    this.inputRef.current.value = "";
    // 重置当前视角的激活状态
    this.handleCurrentPersp();
    this.updatePerspectiveList();
  }

  // 记录当前点击的视角的
  handleCurrentPersp = (id = -1) => {
    this.setState({
      perspectiveItemActive: id,
    });
  }

  // 保存帧列表
  onSaveFrameList(index, curve) {
    if (index === 0) return;
    if (curve.points.length > 1) {
      this.state.perspective[index].frameList = new this.props.BOS3D.BOSCatmullRomCurve3ForFrameEdit({ "controlPoints": curve.points, "coef": curve.coef });
      this.state.perspective[index].frameList.getPoints();
      // curve;
      this.state.perspective[index].editor.customSave();
      this.state.perspective[index].editor.clearEdit();
    } else {
      this.state.perspective[index].curve = [];
      this.state.perspective[index].frameList = [];
    }
    // this.onEditFrame(index);
  }

  // 更新视角列表
  updatePerspectiveList = (callback = null) => {
    this.setState((state) => ({
      ...state,
      perspective: [...this.perspectiveList.getPerspList()],
    }), () => {
      if (callback && typeof callback === "function") {
        callback();
      }
    });
  }

  // 更新帧编辑状态
  updateEditFrameStatus = (callback = null) => {
    const editingIndex = this.props.roamManager.getEditFrameStatus();
    this.setState(state => ({
      ...state,
      editingIndex
    }), () => {
      if (callback && typeof callback === "function") {
        callback();
      }
    });
  }

  render() {
    const {
      isPreviewing, editingIndex, perspective
    } = this.state;
    const { editRouteKey } = this.props;
    const perspList = [];
    const len = perspective?.length || 0;
    perspective.forEach((item, index) => {
      perspList.push(
        <PerspectiveItem
          key={item.id}
          name={item.name}
          viewer={this.props.viewer}
          onSwitchPersp={() => this.flyTo(item)}
          onChangePersp={(updatePosition) => this.editPersp(item.name, updatePosition)}
          onRemovePersp={(idx) => this.rmPersp(idx)}
          onEditFrame={index > 0 ? () => this.handleEditFrame(index) : false}
          enableOpt={editingIndex === 0}
          draggable={len > 1} // 设置视角能否拖动（大于1个视角才可以拖动）
          index={index}
          data={perspective} // 当前所有视角
          perspectiveItemActive={this.state.perspectiveItemActive}
          handleCurrentPersp={key => this.handleCurrentPersp(key)}
          id={item.id}
          perspective={item}
          updatePerspectiveList={this.updatePerspectiveList}
          perspList={this.perspectiveList}
        />
      );
    });

    this.circleList = [];
    let point = "";
    this.state.circleList.forEach((c, index) => {
      const coord = c.coord;
      // insideCamera
      if (c.position && this.props.viewer.getViewerImpl().insideCamera(c.position)) {
        this.circleList.push(
          <circle
            key={index.toString()}
            cx={coord[0]}
            cy={coord[1]}
            r={4}
            fill="orange"
          >
            <title>{c.name}</title>
          </circle>
        );
        const size = this.props.viewer.getCanvasSize();
        if (coord[0] > 0 && coord[1] > 0 && coord[0] < size.width && coord[1] < size.height) {
          point += `${coord[0]},${coord[1]} `;
        }
      }
    });

    return (
      <div className={style.perspectiveManager}>
        {/* 视角下的小圆点 */}
        {ReactDOM.createPortal((
          <svg className={style.perspPointSvg} ref={this.routePathRef}>
            {this.circleList}
            <polyline points={point} fill="none" stroke="orange" strokeWidth={2} />
          </svg>
        ), this.svgParent)}

        {/* 添加路径操作 */}
        <div className={style.operationPanel}>
          <input type="text" maxLength={50} ref={this.inputRef} className={style.input} placeholder="请输入路径名称" />
          <Button type="primary" className={style.btn} size="small" onClick={this.addPerspective}>添加视角</Button>
          <Button type="primary" className={style.btn} size="small" onClick={this.saveRoute}>保存路径</Button>
        </div>

        {perspList.length ? (
          <div className={style.perspContainer}>
            {/* 视角列表 */}
            <div className={style.perspListContainer}>
              {perspList}
            </div>

            {/* 播放和重置按钮 */}
            <div className={style.perspOperaGroup}>
              {
                this.state.perspective.length > 1 && (
                  <Button className={style.btn} onClick={() => this.switchPlayAll()}>
                    {
                      isPreviewing ? <AntdIcon className={style.previewIcon} type="iconsuspend" title="停止" /> : <AntdIcon className={style.previewIcon} type="iconplay" title="预览" />
                    }
                    {isPreviewing ? "停止" : "预览"}
                  </Button>
                )
              }
              {editRouteKey !== "" && (
                <Button className={style.reset} type="link" title="点击后会重置该路径编辑前的所有视角" onClick={this.reset}>
                  重置
                </Button>
              )}
            </div>

          </div>
        ) : null}

        {editingIndex > 0 && (
          <FrameEditor
            editor={this.state.perspective[editingIndex].editor}
            title={`${_.get(this.state.perspective, [editingIndex - 1, "name"])}-${_.get(this.state.perspective, [editingIndex, "name"])}编辑器`}
            onClose={() => this.handleEditFrame(editingIndex)}
            onSave={curve => this.onSaveFrameList(editingIndex, curve)}
            // updatePerspectiveList={this.updatePerspectiveList}
            viewer={this.props.viewer}
            changeMouseIcon={this.props.changeMouseIcon}
          />
        )}
      </div>
    );
  }
}

PerspectiveManager.propTypes = {
  viewer: PropTypes.object.isRequired,
  BOS3D: PropTypes.object.isRequired,
  // onSaveRoute: PropTypes.func.isRequired,
  mode: PropTypes.string.isRequired,
  roamManager: PropTypes.object,
  editRouteKey: PropTypes.string.isRequired,
  // route: PropTypes.array.isRequired,
  closeEdit: PropTypes.func.isRequired,
  onRef: PropTypes.func.isRequired,
  handleTip: PropTypes.func.isRequired,
  active: PropTypes.bool.isRequired,
  routeList: PropTypes.object.isRequired,
  updateRouteList: PropTypes.func.isRequired,
  changeMouseIcon: PropTypes.func.isRequired,
};

PerspectiveManager.defaultProps = {
  roamManager: {}
};

const mapStateToProps = state => ({
  mode: state.button.mode,
  viewer: state.system.viewer3D,
  BOS3D: state.system.BIMWINNER.BOS3D,
});
const mapDispatchToProps = (dispatch) => ({
  changeMouseIcon: (mode) => {
    dispatch(changeMouseIcon(mode));
  },
});

const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(PerspectiveManager);

export default WrappedContainer;
