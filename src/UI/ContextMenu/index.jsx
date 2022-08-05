import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { v4 as uuidv4 } from 'uuid';
import style from "./index.less";
import { updateList, setComponentInfoVisible, setFamilyInfoVisible } from "../Icon/action";
import {
  ON_HIDE_COMPONENT,
  ON_CLICK_ISOLATE,
  ON_SHOW_FAMILY,
  SHOW_ALL_CPT,
  ON_SAME_CPT,
  ON_OTHER_TRANSPARENT
} from "../Icon/eventType";
import { handleTreeData, AntdIcon } from '../utils/utils';
import CptSearcher from "../Icon/CptSearch/CptSearcher";
import * as api from './api';

const SENDER = 'ContextMenu';

class ContextMenu extends React.Component {
  constructor(props) {
    super(props);
    this.rootRef = React.createRef();
    this.keys = this.props.viewer && this.props.viewer.getHighlightComponentsKey(); // 获取高亮构件的key
    this.state = {
      mode: this.keys && this.keys.length > 0 ? 0 : 1, // 0:显示所有菜单项，1：只显示最后一个
      visible: false, // 是否显示 所属部件族菜单
      highLightCpt: [],
      modelHighLightCpt: [],
      topFamliyKey: '',
    };
  }

  componentDidMount() {
    const assemblies = this.props.assemblies;
    const familydata = this.props.familyData;
    if (this.keys?.length) {
      // 族信息和部件信息整合到一块儿
      const familyAndAssembliesNodeList = this._dataMerge(familydata, assemblies);
      this._visibel(familyAndAssembliesNodeList);
      this.transDataToArray(familyAndAssembliesNodeList);
    }
  }

  // 判断高亮构件是否属于部件族
  _visibel = familyAndAssembliesNodeList => {
    // 多选构件的情况下，只要一个构件有族数据或者部件数据，就高亮
    let tag = false;
    this.keys.forEach(selectedCptKey => {
      familyAndAssembliesNodeList.forEach(item => {
        if (item.key === selectedCptKey) {
          tag = true;
        }
      });
    });
    this.setState({
      visible: tag,
    });
  }

  // 合并族信息和部件信息
  _dataMerge = (familyData, assemblies) => {
    const familyNodeList = [];
    const assembliesNodeList = [];
    // 处理族信息函数
    function handleFamily(data) {
      const { familyTree, familyList } = data;
      if (!familyList || !familyList.length) return;
      const temp = [];
      Object.keys(familyTree).forEach(familyTreeKey => {
        const tempData = handleTreeData(
          familyTree[familyTreeKey],
          familyTreeKey
        );
        temp.push(...tempData);
      });
      familyNodeList.push(...temp);
    }
    // 处理部件信息函数
    function hadnleAssembly(data) {
      const { assemblyTree, assemblyList } = data;
      if (!assemblies || !assemblyList.length) return;
      const temp = [];
      Object.keys(assemblyTree).forEach(assemblyKey => {
        const tempData = handleTreeData(
          assemblyTree[assemblyKey],
          assemblyKey
        );
        temp.push(...tempData);
      });
      assembliesNodeList.push(...temp);
    }
    if (familyData.length) {
      familyData.forEach(familyDataItem => {
        const { data } = familyDataItem;
        // 如果请求失败
        if (data.code !== "SUCCESS") return;
        // 兼容link模式下的模型合并问题
        if (Object.keys(data.data).length > 0 && "familyTree" in data.data === false) {
          const dataList = Object.values(data.data);
          dataList.forEach((item) => {
            handleFamily(item);
          });
        } else {
          handleFamily(data.data);
        }
      });
    }
    if (assemblies.length) {
      assemblies.forEach(assembliesItem => {
        const { data } = assembliesItem;
        // 如果请求失败
        if (data.code !== "SUCCESS") return;
        // 兼容link模式下的模型合并问题
        if (Object.keys(data.data).length > 0 && "assemblyTree" in data.data === false) {
          const dataList = Object.values(data.data);
          dataList.forEach(item => {
            hadnleAssembly(item);
          });
        } else {
          hadnleAssembly(data.data);
        }
      });
    }
    return [...assembliesNodeList, ...familyNodeList];
  }

  // 部件族数据转化
  transDataToArray = (familyAndAssembliesNodeList) => {
    const modelHighLightCpt = []; // 模型上需要高亮的构件的key
    const highLightCpt = []; // 模型 树 上需要高亮的key
    let topFamliyKey = [];
    // 获取所有选择构件的族信息
    this.keys.forEach(_key => {
      // 获取构件信息
      const cptInfo = familyAndAssembliesNodeList.filter(item => item.key === _key);
      // 获取构件最上面的部件key
      // familyAndAssembliesNodeList中部件的数据在前，所以在部件数据中先找，找不到就是族数据，都没有，那就是没有
      topFamliyKey = cptInfo.length && cptInfo[0].router.split('*').shift();
      // 获取部件的key，然后高亮其整个部件
      if (topFamliyKey.length) {
        highLightCpt.push({ key: topFamliyKey });
      }
      // 兼容模型树是否打开的状态
      modelHighLightCpt.push(
        ...familyAndAssembliesNodeList.filter(_temp => _temp.router.indexOf(topFamliyKey) !== -1));
    });
    // 去重
    const DeduplicationData = Array.from(new Set(highLightCpt));
    this.setState({
      highLightCpt: DeduplicationData,
      modelHighLightCpt,
      topFamliyKey,
    });
  };

  // 兼容模型树打开和关闭状态
  showFamily = (highLightCpt = [], modelHighLightCpt = [], topFamliyKey = '') => {
    this.props.viewer.highlightComponentsByKey(modelHighLightCpt);
    this.props.showFamilyInfo({
      visible: true,
      cptKey: topFamliyKey,
    });
    if (highLightCpt.length) {
      this.props.updateHistoryList({
        name: "所属部件/族",
        type: "family",
        highLightCpt,
      });
      this.props.ee.emit(ON_SHOW_FAMILY, {
        sender: SENDER,
        payload: {
          highLightCpt: Array.from(new Set(highLightCpt)),
          modelHighLightCpt: modelHighLightCpt.filter(cptKey => typeof cptKey === "string"),
        },
      });
    }
  };

  checkPosition() {
    let _left = 0;
    let _top = 0;
    const { position: { x, y } } = this.props;
    const { width, height } = this.props.viewer.viewportDiv.getBoundingClientRect();
    const elWidth = 130;
    const elHeight = this.props.viewer.getHighlightComponentsKey().length > 0 ? 160 : 50;
    _left = x + 2;
    _top = y + 2;
    if (y + elHeight > height) {
      _top = y - elHeight;
    }
    if (x + elWidth > width) {
      _left = x - elWidth;
    }
    return { left: _left, top: _top };
  }

  render() {
    const {
      highLightCpt, modelHighLightCpt, topFamliyKey, visible
    } = this.state;
    const { customMenu } = this.props;
    const { default: userDefault, more: userMore } = this.props.userMenu;
    const highLightCptKey = highLightCpt.map(item => item.key);
    const modelHighLightCptKey = modelHighLightCpt.map(item => item.key);
    const userJSXDefault = userDefault.map(menu => (
      <div
        role="presentation"
        key={uuidv4()}
        className={style.item}
        onClick={() => menu.onClick()}
      >
        {menu.name}
      </div>
    ));
    const userJSXMore = userMore.map(menu => (
      <div
        role="presentation"
        key={uuidv4()}
        className={style.item}
        onClick={() => menu.onClick()}
      >
        {menu.name}
      </div>
    ));
    const isPicker = false; // 是否是新数据，是就隐藏
    // 系统默认的右键菜单功能
    const iniMenu = {
      "隔离": {
        label: '隔离',
        disable: false,
        func: this._isolate
      },
      "隐藏": {
        label: '隐藏',
        disable: false,
        func: this._hide
      },
      "聚焦": {
        label: '聚焦',
        disable: false,
        func: this._focus
      },
      "属性信息": {
        label: '属性信息',
        disable: false,
        func: this._attribute
      },
      "其他构件半透明": {
        label: '其他构件半透明',
        disable: false,
        func: this._otherTransparent
      },
      "相同类型构件": {
        label: '相同类型构件',
        disable: false,
        func: this._sameCpt
      },
      "所属部件/族": {
        label: '所属部件/族',
        disable: false,
        func: () => this.showFamily(highLightCptKey, modelHighLightCptKey, topFamliyKey)
      },
      "显示所有对象": {
        label: '显示所有对象',
        disable: false,
        func: this._showAll
      },
    };

    // 生成菜单
    const genMenu = (menu) => {
      const content = [];
      menu.forEach(item => {
        if (!item.children) {
          // 添加功能
          let func = item.func;
          if (iniMenu[item.label]) {
            func = iniMenu[item.label].func.bind(this);
          }
          content.push(
            <div
              role="presentation"
              onClick={!item.disable ? func : null}
              className={`${style.item} ${item.disable ? style.disabled : ''}`}
              key={item.label}
              style={{ display: item.label === '所属部件/族' ? (visible ? "block" : "none") : "block" }}
            >
              {item.aka || item.label}
            </div>
          );
        } else {
          content.push(
            <div
              role="presentation"
              className={`${style.item} ${style.more}`}
              key={item.label}
            >
              {item.label}
              <AntdIcon className={style.moreIcon} type="icon3dviewericonfont-53-copy-copy" />
              <div
                role="presentation"
                className={style.moreContainer}
                key={item.label}
              >
                {genMenu(item.children)}
              </div>
            </div>
          );
        }
      });
      return content;
    };
    const { left, top } = this.checkPosition();
    return (
      <div
        role="presentation"
        onClick={() => this.dismiss()}
        ref={this.rootRef}
        className={style.container}
        style={{
          left,
          top,
          width: '115px'
        }}
      >
        {this.state.mode === 0
          ? customMenu.length ? genMenu(customMenu) : (
            <>
              {
                !isPicker && (
                  <div
                    role="presentation"
                    onClick={() => this._isolate()}
                    className={style.item}
                  >
                    隔离
                  </div>
                )
              }
              {
                !isPicker && (
                  <div
                    role="presentation"
                    onClick={() => this._hide()}
                    className={style.item}
                  >
                    隐藏
                  </div>
                )
              }
              {
                !isPicker && (
                  <div
                    role="presentation"
                    onClick={() => this._focus()}
                    className={style.item}
                  >
                    聚焦
                  </div>
                )
              }
              {
                !isPicker && (
                  <div
                    role="presentation"
                    onClick={() => this._attribute()}
                    className={style.item}
                  >
                    属性信息
                  </div>
                )
              }

              {!isPicker && userJSXDefault}
              {
                !isPicker && (
                  <div
                    role="presentation"
                    // onClick={() => this._more}
                    className={`${style.item} ${style.more}`}
                  >
                    更多
                    <AntdIcon className={style.moreIcon} type="icon3dviewericonfont-53-copy-copy" />
                    <div
                      role="presentation"
                      className={style.moreContainer}
                    >
                      <div
                        role="presentation"
                        onClick={() => this._otherTransparent()}
                        className={style.item}
                        title="其他构件半透明"
                      >
                        其他构件半透明
                      </div>
                      <div
                        role="presentation"
                        className={style.item}
                        title="相同类型构件"
                        onClick={() => this._sameCpt()}
                      >
                        相同类型构件
                      </div>
                      {visible ? (
                        <div
                          role="presentation"
                          onClick={
                            () => this.showFamily(highLightCptKey, modelHighLightCptKey, topFamliyKey)
                          }
                          className={`${style.item}`}
                          title="所属部件/族"
                        >
                          所属部件/族
                        </div>
                      ) : ""}
                      {userJSXMore}
                    </div>
                  </div>
                )
              }
              <div
                role="presentation"
                onClick={() => this._showAll()}
                className={style.item}
              >
                显示所有对象
              </div>
            </>
          )
          : (
            <div
              role="presentation"
              onClick={() => this._showAll()}
              className={style.item}
            >
              显示所有对象
            </div>
          )}
      </div>
    );
  }

  _sameCpt() {
    if (this.props.viewer) {
      const viewer = this.props.viewer;
      const models = viewer.viewerImpl.modelManager.models;
      const modelKeys = Object.keys(models);
      const keys = viewer.getHighlightComponentsKey(); // 获取高亮构件key列表
      const DesData = [];
      keys.forEach(_key => {
        modelKeys.forEach(modelKey => DesData.push([_key, modelKey]));
      });
      const attributes = [];

      const cptSearcher = new CptSearcher({
        viewer3D: viewer
      });

      // 如果没有高亮的构件就stop
      if (!keys.length) {
        return;
      }

      // 判断是否是离线模式
      const { offline } = this.props;

      if (offline) {
        // 获取构件信息
        const cptKeys = DesData.map(item => item[0]);

        if (!cptKeys.length) return;

        const allCptInfo = viewer.getComponentsByKey(cptKeys);

        // 获取构件类型
        const cptTypes = allCptInfo.map(item => {
          const cptInfoKey = Object.keys(item)[0];
          const type = item[cptInfoKey][0]?.type;
          return type || null;
        });

        // 查找类型相同构件
        const hightKeys = [];
        cptTypes.forEach(
          type => {
            hightKeys.push(...cptSearcher.cache.filter(obj => type === obj.type));
          }
        );
        if (hightKeys?.length) {
          viewer.highlightComponentsByKey(hightKeys.map(item => item.componentKey));
          this.props.ee.emit(ON_SAME_CPT);
        }
      } else {
        // 获取modelKey
        Promise.all(
          DesData.map(([key, modelKey]) => api.getSigleCptInfo(viewer, key, modelKey))
        ).then(
          result => {
            const tempAttributes = result.map(item => {
              const type = item?.data?.data?.type;
              if (type) {
                return type;
              } else {
                return null;
              }
            });
            // 获取所选构件的属性
            attributes.push(...Array.from(new Set(tempAttributes.filter(item => item !== null))));
            const hightKeys = [];
            attributes.forEach(
              type => {
                hightKeys.push(...cptSearcher.cache.filter(obj => type === obj.type));
              }
            );
            if (hightKeys?.length) {
              viewer.highlightComponentsByKey(hightKeys.map(item => item.componentKey));
              this.props.ee.emit(ON_SAME_CPT);
            }
          }
        );
      }
    }
  }

  _otherTransparent() {
    if (this.props.viewer) {
      const viewer = this.props.viewer;
      const keys = viewer.getHighlightComponentsKey();
      if (keys.length) {
        viewer.transparentOtherComponentsByKey(keys);
        this.props.updateHistoryList({
          type: "transparent",
          name: "其他构件半透明",
          keys,
        });
        this.props.ee.emit(ON_OTHER_TRANSPARENT, {
          sender: SENDER,
          payload: {
            keys,
          },
        });
      }
    }
  }

  _isolate() {
    if (this.props.viewer) {
      const viewer = this.props.viewer;
      const keys = viewer.getHighlightComponentsKey();
      if (keys.length > 0) {
        viewer.isolateComponentsByKey(keys);
        viewer.clearHighlightList();
        this.props.ee.emit(ON_CLICK_ISOLATE, {
          sender: SENDER,
          payload: {
            keys,
          },
        });
        this.props.updateHistoryList({
          type: "isolate",
          name: "构件隔离",
          keys,
        });
      }
    }
  }

  _hide() {
    if (this.props.viewer) {
      const viewer = this.props.viewer;
      const keys = viewer.getHighlightComponentsKey();
      if (keys.length > 0) {
        viewer.hideComponentsByKey(keys);
        viewer.clearHighlightList(); // 隐藏后取消构件高亮
        this.props.updateHistoryList({
          name: "隐藏构件",
          type: "hide",
          keys,
        });
        this.props.ee.emit(ON_HIDE_COMPONENT, {
          sender: SENDER,
          payload: {
            keys,
          },
        });
      }
    }
  }

  _focus() {
    if (this.props.viewer) {
      const viewer = this.props.viewer;
      viewer.adaptiveSize();
    }
  }

  _attribute() {
    if (this.props.showComponentInfo) {
      this.props.showComponentInfo();
    }
  }

  _showAll() {
    if (this.props.viewer) {
      const viewer = this.props.viewer;
      viewer.resetScene({
        visible: true,
      });
      this.props.ee.emit(SHOW_ALL_CPT, {
        sender: SENDER,
      });
    }
  }

  dismiss() {
    if (this.props.hide) {
      this.props.hide();
    }
  }
}

ContextMenu.propTypes = {
  position: PropTypes.object,
  hide: PropTypes.func,
  viewer: PropTypes.object,
  updateHistoryList: PropTypes.func.isRequired,
  showComponentInfo: PropTypes.func,
  showFamilyInfo: PropTypes.func,
  ee: PropTypes.object.isRequired,
  familyData: PropTypes.array.isRequired,
  assemblies: PropTypes.array.isRequired,
  userMenu: PropTypes.object,
  offline: PropTypes.bool,
  customMenu: PropTypes.array,
  modelDetail: PropTypes.object,
};

ContextMenu.defaultProps = {
  position: { x: 0, y: 0 },
  hide: undefined,
  viewer: undefined,
  showComponentInfo: undefined,
  showFamilyInfo: undefined,
  userMenu: { default: [], more: [] },
  offline: false,
  customMenu: [],
  modelDetail: {}
};

const mapStateToProps = (state) => ({
  ee: state.system.eventEmitter,
  offline: state.system.offline,
  customMenu: state.system.customMenu,
  modelDetail: state.system.model,
});
const mapDispatchToProps = (dispatch) => ({
  updateHistoryList: item => { dispatch(updateList(item)) },
  showComponentInfo: () => { dispatch(setComponentInfoVisible(true)) },
  showFamilyInfo: payload => dispatch(setFamilyInfoVisible(payload))
});

const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ContextMenu);

export default WrappedContainer;
