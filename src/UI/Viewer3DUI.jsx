import React from "react";
import PropTypes from "prop-types";
import { Provider, connect } from "react-redux";
import _ from "lodash-es";
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import "./theme/default.less";
import ViewControlToolbar from "./Toolbar/ViewControlToolbar";
import Bottom from "./Toolbar/Bottom";
import AnnotationUI from "./AnnotationUI";
import ProgressBar from "./ProgressBar";
import MouseIcon from "./MouceIcon";
import ContextMenu from "./ContextMenu";
import toastr from "./toastr";
import { getAssemblies, getFamilies } from './ContextMenu/api';
import * as api from "./Icon/InfoTree/api";
import { EVENT } from "./constant";
import { mobileCheck } from './utils/utils';
import { updateModelDetail } from './systemRedux/action';

const theme = createMuiTheme({
  palette: {
    primary: { main: '#55bffd' },
  },
});

class Viewer3DUI extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showAnnotationUI: false,
      showContextMenu: false,
      contextMenuPosition: {
        x: 0,
        y: 0
      },
      familyData: [],
      assemblies: [],
      modelLoad: false,
    };
    this.userMenu = {
      default: [],
      more: [],
    };
    this.contextMenuRef = React.createRef();
    this.openAnnotationUI = this.openAnnotationUI.bind(this);
    this.closeAnnotationUI = this.closeAnnotationUI.bind(this);
    this.saveAnnotation = this.saveAnnotation.bind(this);
    this.hideContextMenu = this.hideContextMenu.bind(this);
    this.modelList = [];
    if (mobileCheck()) {
      // 挂载一个移动端标识的样式
      document.body.classList.add('mobile-device');
    }
  }

  // component

  componentDidMount() {
    const system = this.props.store.getState().system;
    // 自定义右键菜单
    system.eventEmitter.on(EVENT.addContextMenu, option => {
      if (option?.isMore) {
        this.userMenu.more.push(option);
      } else {
        this.userMenu.default.push(option);
      }
      if (this.state.showContextMenu) {
        this.forceUpdate();
      }
    });
    const viewer = system.viewer3D;
    const { EVENTS, LOADERROREVENTS } = system.BIMWINNER.BOS3D;
    viewer.viewportDiv.classList.add('bos3dui');
    // 一些初始化事件通知
    viewer.registerModelEventListener(EVENTS.ON_LOAD_ERROR, (event) => {
      toastr.error(event.message || "加载出现错误", '', {
        target: `#${viewer.viewport}`
      });
    });
    viewer.registerModelEventListener(EVENTS.ON_LOAD_INVALID_SCENE, (event) => {
      toastr.error(`key为${event.modelKey}的模型信息不合法`, '', {
        target: `#${viewer.viewport}`
      });
    });
    viewer.registerModelEventListener(EVENTS.ON_NETWORK_ERROR, (event) => {
      toastr.error(event.message || "网络连接错误", '', {
        target: `#${viewer.viewport}`
      });
    });
    viewer.registerModelEventListener(EVENTS.NO_PERMISSION, (event) => {
      toastr.error(event.message || "权限不足", '', {
        target: `#${viewer.viewport}`
      });
    });
    viewer.registerModelEventListener(EVENTS.ACCOUNT_NO_EXIST, (event) => {
      toastr.error(event.message || "无法获取账户", '', {
        target: `#${viewer.viewport}`
      });
    });
    viewer.registerModelEventListener(EVENTS.ON_LOAD_EMPTY_SCENE, (event) => {
      toastr.error(`key为${event.modelKey}的模型场景为空，请生成场景`, '', {
        target: `#${viewer.viewport}`
      });
    });
    viewer.registerModelEventListener(LOADERROREVENTS.LOAD_COMPONENT_ERROR, (event) => {
      toastr.error(`key为${event.modelKey}的模型加载部分构件失败`, '', {
        target: `#${viewer.viewport}`
      });
    });
    viewer.registerModelEventListener(LOADERROREVENTS.LOAD_MATERIAL_ERROR, (event) => {
      toastr.error(`key为${event.modelKey}的模型加载材质失败`, '', {
        target: `#${viewer.viewport}`
      });
    });
    viewer.registerModelEventListener(LOADERROREVENTS.LOAD_GEOMETRY_ERROR, (event) => {
      toastr.error(`key为${event.modelKey}的模型加载几何失败`, '', {
        target: `#${viewer.viewport}`
      });
    });
    viewer.registerModelEventListener(LOADERROREVENTS.LOAD_TEXTURE_ERROR, (event) => {
      toastr.error(`key为${event.modelKey}的模型加载纹理失败`, '', {
        target: `#${viewer.viewport}`
      });
    });
    viewer.registerModelEventListener(LOADERROREVENTS.LOAD_AXISNET_ERROR, (event) => {
      toastr.error(`key为${event.modelKey}的模型加载轴网失败`, '', {
        target: `#${viewer.viewport}`
      });
    });
    viewer.registerModelEventListener(LOADERROREVENTS.PARSEFAILE, (event) => {
      toastr.error(`key为${event.modelKey}的模型解析失败`, '', {
        target: `#${viewer.viewport}`
      });
    });
    viewer.registerModelEventListener(LOADERROREVENTS.PARSING, (event) => {
      toastr.error(`key为${event.modelKey}的模型解析中`, '', {
        target: `#${viewer.viewport}`
      });
    });
    viewer.registerModelEventListener(LOADERROREVENTS.LOAD_ERROR, (event) => {
      toastr.error(`key为${event.modelKey}的模型加载失败`, '', {
        target: `#${viewer.viewport}`
      });
    });
    viewer.registerModelEventListener(LOADERROREVENTS.SCENE_NOT_CLOSE, (event) => {
      toastr.error(`key为${event.modelKey}的模型场景未闭合`, '', {
        target: `#${viewer.viewport}`
      });
    });
    viewer.registerModelEventListener(LOADERROREVENTS.SCENE_NOTHING_TO_LOAD, (event) => {
      toastr.error(`key为${event.modelKey}的模型没有可加载的内容`, '', {
        target: `#${viewer.viewport}`
      });
    });
    viewer.registerModelEventListener(LOADERROREVENTS.LOAD_SCENE_ERROR, (event) => {
      toastr.error(`key为${event.modelKey}的模型加载场景失败`, '', {
        target: `#${viewer.viewport}`
      });
    });
    viewer.registerModelEventListener(EVENTS.ON_LOAD_COMPLETE, (e) => {
      this.modelList.push(e.modelKey);
      const models = viewer.viewerImpl.modelManager.models;
      const modelKeys = Object.keys(models);
      if (modelKeys.length > 0) {
        const modelDetail = models[modelKeys[0]];
        this.props.updateModelDetail(modelDetail);
      }
      if (this.modelList.length !== modelKeys.length) return;
      const { offline, apiVersion } = system;
      this.setState(state => ({
        ...state,
        modelLoad: true,
      }));
      // eslint-disable-next-line compat/compat
      if (!offline) { // 如果是在线的就需要请求部件族接口
        Promise.all(
          modelKeys.map((_key) => getAssemblies(viewer, _key)) // 获取模型中的部件的数据（部件中可能包含族信息）
        ).then(data => {
          this.setState({
            assemblies: data,
          });
        });
        // eslint-disable-next-line compat/compat
        Promise.all(
          modelKeys.map(_key => getFamilies(viewer, _key))
        ).then(data => {
          this.setState({
            familyData: data,
          });
        });
      } else { // 离线状态下请求组数据
        // 离线状态下获取族树和部件树数据
        Promise.all(modelKeys.map(
          _key => api.getTreeList(viewer, _key, apiVersion, offline))
        ).then(rsp => {
          rsp.forEach((r) => {
            if (r.data.code === 'SUCCESS') {
              if (r.data.data.length > 0) {
                const _data = r.data.data;
                const fileKeyObj = {};
                const modelKey = modelKeys[0];
                _data.forEach(item => {
                  switch (item.name) {
                    case '族树':
                      fileKeyObj['族树'] = item;
                      break;
                    case '部件树':
                      fileKeyObj['部件树'] = item;
                      break;
                    default:
                      break;
                  }
                });
                if (fileKeyObj['族树']) {
                  api.getData(
                    viewer.host, fileKeyObj['族树'].fileKey, modelKey, offline
                  ).then(data => {
                    if (data.status === 200) {
                      // 构造之前的数据结构
                      const tempData = _.cloneDeep(data.data);
                      data.data['code'] = "SUCCESS";
                      data.data["data"] = tempData;
                      this.setState({
                        familyData: [data],
                      });
                    } else {
                      console.error('获取族数据失败');
                    }
                  });
                }
                if (fileKeyObj['部件树']) {
                  api.getData(
                    viewer.host, fileKeyObj['部件树'].fileKey, modelKey, offline
                  ).then(data => {
                    if (data.status === 200) {
                      // 构造之前的数据结构
                      const tempData = _.cloneDeep(data.data);
                      data.data['code'] = "SUCCESS";
                      data.data["data"] = tempData;
                      this.setState({
                        assemblies: [data],
                      });
                    } else {
                      console.error('获取族数据失败');
                    }
                  });
                }
              } else {
                console.log('部件族数据为空');
              }
            } else {
              console.log('获取数据失败');
            }
          });
        }).catch(err => {
          console.error('获取部件族数据失败:', err);
        });
      }
    });
    viewer.registerModelEventListener(
      EVENTS.ON_CLICK_PICK,
      (obj) => {
        if (obj.event && obj.event.button === 2) {
          this.showContextMenu(
            obj.event.offsetX || obj.event.layerX,
            obj.event.offsetY || obj.event.layerY,
          );
        }
      }
    );
  }

  showContextMenu(x, y) {
    this.setState({
      contextMenuPosition: {
        x,
        y
      },
      showContextMenu: true
    });
    document.addEventListener("mousedown", this.hideContextMenu);
  }

  hideContextMenu(e) {
    if (e) {
      const target = e.target;
      const div = this.contextMenuRef.current;
      if (div.contains(target)) {
        return;
      }
    }
    this.setState({
      showContextMenu: false
    });
    document.removeEventListener("mousedown", this.hideContextMenu);
  }

  openAnnotationUI(editorData) {
    // editorData即为批注信息
    // 如果有editorData则表示编辑，没有则是新建
    this.editorData = editorData;
    if (editorData) {
      this.snapshot = undefined;
    } else {
      // 新建批注，获取当前快照
      const viewer = this.props.store.getState().system.viewer3D;
      const scene = _.cloneDeep(viewer.viewerImpl.getSceneState());
      const snapshot = viewer.viewerImpl.modelManager.getModelSnapshotPhoto();
      if (scene && snapshot) {
        this.snapshot = {
          code: new Date().getTime().toString(),
          name: '批注',
          description: '',
          imageURL: snapshot.imgURL,
          imageWidth: snapshot.width,
          imageHeight: snapshot.height,
          cameraState: scene.camera,
          componentState: scene.state,
          highlightComponentsKeys: scene.selection,
          highlightModelsKeys: scene.modelSelection,
        };
      }
    }

    this.setState({
      showAnnotationUI: true
    });
  }

  closeAnnotationUI() {
    this.setState({
      showAnnotationUI: false
    });
  }

  saveAnnotation(data) {
    console.log(data);
  }

  render() {
    const { isMobile, HorizontalorVerticalScreen } = this.props;
    console.log("当前是否是移动端横屏", isMobile, HorizontalorVerticalScreen);
    const viewer = this.props.store.getState().system.viewer3D;
    return (
      <React.StrictMode>
        <ThemeProvider theme={theme}>
          <Provider store={this.props.store}>
            {!isMobile && <ViewControlToolbar />}
            <Bottom
              showAnnotationUI={this.state.showAnnotationUI}
              openAnnotationUI={this.openAnnotationUI}
              modelLoad={this.state.modelLoad}
            />
            {
              this.state.showContextMenu ? (
                <div ref={this.contextMenuRef}>
                  <ContextMenu
                    position={this.state.contextMenuPosition}
                    viewer={viewer}
                    familyData={this.state.familyData}
                    assemblies={this.state.assemblies}
                    hide={() => this.hideContextMenu()}
                    userMenu={this.userMenu}
                  />
                </div>
              ) : null
            }
            {
              this.state.showAnnotationUI
                ? (
                  <AnnotationUI
                    snapshot={this.snapshot}
                    editorData={this.editorData}
                    onClose={this.closeAnnotationUI}
                    onSave={this.saveAnnotation}
                  />
                ) : null
            }
            <ProgressBar />
            <MouseIcon />
          </Provider>
        </ThemeProvider>
      </React.StrictMode>
    );
  }
}

Viewer3DUI.propTypes = {
  store: PropTypes.object.isRequired,
  isMobile: PropTypes.bool,
  HorizontalorVerticalScreen: PropTypes.number,
  updateModelDetail: PropTypes.func.isRequired
};

Viewer3DUI.defaultProps = {
  isMobile: false,
  HorizontalorVerticalScreen: 0
};

const mapDispatchToProps = (dispatch) => ({
  updateModelDetail: modelInfo => {
    dispatch(updateModelDetail(modelInfo));
  },
});

export default connect((state) => ({
  isMobile: state.system.isMobile,
  HorizontalorVerticalScreen: state.system.HorizontalorVerticalScreen
}), mapDispatchToProps)(Viewer3DUI);
