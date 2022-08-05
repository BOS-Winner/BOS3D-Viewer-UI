import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import _ from "lodash-es";
import Modal from "Base/Modal";
import Query from "Base/Query";
import Tree from "./Tree";
import Option from "./Option";
import FamilyProperty from "./FamilyProperty";
import { ON_SHOW_FAMILY } from "../eventType";
import noneIcon from "../img/blue/noneIcon.png";
import toastr from "../../toastr";
import { setComponentInfoVisible } from "../action";
import * as api from "./api";
import style from "./style.less";
import { DEFAULT_MODAL_PLACE } from "../../constant.js";
import { getComponentsByAttribute } from "../CptSearch/api";
import { getAllModelkeys } from "../../utils/utils";

const TIPS = {
  pending: 1,
  error: 2,
  noData: 3,
  ok: 4,
};
const ORIGIN_DEFAULT_TYPES = ["空间树", "系统树", "专业树"];
let DEFAULT_TYPES = ["空间树", "系统树", "专业树"];
const DEFAULT_SELECTED_TYPE = DEFAULT_TYPES[0];
const CustomModelType = [
  "RVM",
  "OBJ",
  "I-MODEL",
  "DAE",
  "FBX",
  "3DS",
  "STP",
  "STEP",
  "NWD",
  "SKP"
];
const CATALOG_TREE = "目录树";

class TreeManager extends React.Component {
  constructor(props) {
    super(props);
    this.data = {}; // {[type]: {[modelName]: treeData}[]}
    this.fileKey = {};

    const tips = {};
    DEFAULT_TYPES.forEach((type) => {
      tips[type] = TIPS.pending;
    });
    // 用于协调搜索框相关逻辑
    // {[type]: { canQueryNext: boolean, canQueryPrev: boolean, queryFn: function, queryIncFn: function }}
    this.treeInfo = {};

    this.state = {
      modelInfo: {}, // {type: [{name: modelName, fileKey: treeFileKey, modelKey,}]}
      treeType: DEFAULT_SELECTED_TYPE, // 当前的树类型
      tips,
      canQueryNext: false,
      canQueryPrev: false,
      showSearchArrow: false,
      // 显示族属性依赖这两个值，用来在底层发送网络请求
      family: {
        familyKey: "",
        modelKey: "",
      },
      // 保留当前树的状态
      spaceTreeStatus: [],
      modelTreeStatus: [],
      professionalTreeStatus: [],
      directoryTreeStatus: [],
      // 半透明模式， 默认关闭
      translucentMode: false,
      // 获取模型树当前状态
      treeData: {},
    };
  }

  componentDidMount() {
    const _info = []; // 存储scene中每个模型的信息
    const { apiVersion, isOffline } = this.props;
    const allModelKeys = this.props.viewer.getViewerImpl().getAllBimModelsKey();
    const allModels = allModelKeys.map(_key => this.props.viewer.getViewerImpl().getModel(_key));
    let isMergeModel = false;
    let isArrayModel = false;
    let isScene = false;
    _.values(allModels).forEach(
      (model) => {
        // 获取所有模型的配置
        const modelConfig = model.getConfig();
        if (modelConfig) {
          _info.push({
            key: modelConfig.key,
            name: modelConfig.modelName,
            type: modelConfig.type,
          });
          // Show directory tree if RVM model is available
          if (
            CustomModelType.some(item => item === modelConfig.type)
            && !DEFAULT_TYPES.includes(CATALOG_TREE)
          ) {
            DEFAULT_TYPES.push(CATALOG_TREE);
          }
          // 如果是合并模型，默认添加目录树
          if (modelConfig.type === "MERGE" && !DEFAULT_TYPES.includes(CATALOG_TREE)) {
            DEFAULT_TYPES.push(CATALOG_TREE);
            isMergeModel = true;
          }

          // 如果是阵列模型，默认添加目录树
          if (modelConfig.type === "ARRAY" && !DEFAULT_TYPES.includes(CATALOG_TREE)) {
            DEFAULT_TYPES.push(CATALOG_TREE);
            isArrayModel = true;
          }

          // 如果是自定义场景，默认添加目录树
          if (modelConfig.type === "SCENE" && !DEFAULT_TYPES.includes(CATALOG_TREE)) {
            DEFAULT_TYPES.push(CATALOG_TREE);
            isScene = true;
          }
        }
      }
    );
    // 如果只有目录树的模型，则只需要显示目录树即可
    if (
      Object.values(allModels).length === 1
      && DEFAULT_TYPES.includes(CATALOG_TREE)
      && !isMergeModel
    ) {
      DEFAULT_TYPES = [CATALOG_TREE];
      // 设置默认显示目录树
      this.changeDefaultShowTreeType(CATALOG_TREE);
    }
    const modelInfo = {};
    const { tips } = this.state;
    // 监听右键菜单打开部件族数据时，关闭族属性
    this.props.ee.on(ON_SHOW_FAMILY, () => {
      this.setState({
        family: {
          familyKey: "",
          modelKey: "",
        },
      });
    });
    // eslint-disable-next-line compat/compat
    Promise.all(
      _info.map((model) => api.getTreeList(this.props.viewer, model.key, apiVersion, isOffline)
      )
    )
      .then((rsp) => {
        rsp.forEach((r, i) => {
          if (r.data.code === "SUCCESS") {
            if (r.data.data.length > 0) {
              const treeList = r.data.data;
              // 合并模型如果有目录树就展示，如果没有，就不展示
              if (isMergeModel && !treeList.some(_tree => _tree.name === CATALOG_TREE)) {
                DEFAULT_TYPES = _.cloneDeep(ORIGIN_DEFAULT_TYPES);
                this.changeDefaultShowTreeType(DEFAULT_TYPES[0]);
              }

              // 阵列模型
              if (isArrayModel) {
                // 如果只有目录树
                if (treeList.length === 1 && treeList[0].name === CATALOG_TREE) {
                  DEFAULT_TYPES = [CATALOG_TREE];
                } else if (
                  treeList.length > 1
                  && treeList.some(_tree => _tree.name === CATALOG_TREE)
                ) {
                  // 如果出了目录树还有你其他树，则显示四个tab页
                  DEFAULT_TYPES = [...ORIGIN_DEFAULT_TYPES, CATALOG_TREE];
                  this.changeDefaultShowTreeType(DEFAULT_TYPES[0]);
                }

                // 如果没有目录树
                if (!treeList.some(_tree => _tree.name === CATALOG_TREE)) {
                  DEFAULT_TYPES = _.cloneDeep(ORIGIN_DEFAULT_TYPES);
                  this.changeDefaultShowTreeType(DEFAULT_TYPES[0]);
                }
              }

              // 自定义场景
              if (isScene) {
                // 如果只有目录树
                if (treeList.length === 1 && treeList[0].name === CATALOG_TREE) {
                  DEFAULT_TYPES = [CATALOG_TREE];
                } else if (
                  treeList.length > 1
                  && treeList.some(_tree => _tree.name === CATALOG_TREE)
                ) {
                  // 如果出了目录树还有你其他树，则显示四个tab页
                  DEFAULT_TYPES = [...ORIGIN_DEFAULT_TYPES, CATALOG_TREE];
                  this.changeDefaultShowTreeType(DEFAULT_TYPES[0]);
                }

                // 如果没有目录树
                if (!treeList.some(_tree => _tree.name === CATALOG_TREE)) {
                  DEFAULT_TYPES = _.cloneDeep(ORIGIN_DEFAULT_TYPES);
                  this.changeDefaultShowTreeType(DEFAULT_TYPES[0]);
                }
              }

              treeList.forEach((data) => {
                // data.name是树的类型
                if (!modelInfo[data.name]) {
                  modelInfo[data.name] = [];
                }
                modelInfo[data.name].push({
                  name: _info[i].name,
                  fileKey: data.fileKey,
                  modelKey: _info[i].key,
                  treeKey: data.key,
                });
                // 如果树的类型有不在默认类型里的，补充之
                if (typeof tips[data.name] === "undefined") {
                  tips[data.name] = TIPS.pending;
                }
                this.initTreeInfo(data.name);
              });
              if (process.env.NODE_ENV === "development") {
                modelInfo["空间树空间树空间树"] = modelInfo["空间树"];
                tips["空间树空间树空间树"] = TIPS.pending;
                this.initTreeInfo("空间树空间树空间树");
                modelInfo["系统树系统树系统树"] = modelInfo["系统树"];
                tips["系统树系统树系统树"] = TIPS.pending;
                this.initTreeInfo("系统树系统树系统树");
              }
            } else {
              // todo: 无数据处理
              Object.keys(tips).forEach((tip) => {
                tips[tip] = TIPS.ok;
              });
            }
          } else {
            toastr.error(r.data.message, "获取树列表失败", {
              target: `#${this.props.viewer.viewport}`,
            });
          }
        });
        this.setState({
          modelInfo,
          tips,
        });
        DEFAULT_TYPES.forEach((type) => {
          this.getTreeData(type);
        });
      })
      .catch((rsp) => {
        toastr.error(rsp.message, "获取树列表失败", {
          target: `#${this.props.viewer.viewport}`,
        });
        Object.keys(tips).forEach((type) => {
          tips[type] = TIPS.error;
        });
        this.setState({
          tips,
        });
      });
  }

  componentWillUnmount() {
    DEFAULT_TYPES = _.cloneDeep(ORIGIN_DEFAULT_TYPES);
  }

  componentDidUpdate(prevProps) {
    // 显示构件信息的时候，要隐藏族信息
    if (!prevProps.componentInfoVisible && this.props.componentInfoVisible) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        family: {
          familyKey: "",
          modelKey: "",
        },
      });
    }
  }

  /**
   * 改变默认显示的模型树的类型
   * @param {string} treeType 树类型
   */
  changeDefaultShowTreeType = treeType => this.setState({ treeType });

  /**
   * 初始化指定类型的树基本信息
   * @param {string} type - 树的类型
   */
  initTreeInfo(type) {
    this.treeInfo[type] = {
      canQueryNext: false, // 是否可以查询下一项
      canQueryPrev: false, // 是否可以查询上一个
      queryFn: () => {}, // 查询函数，由子代的Tree组件负责暴露它，然后在此处缓存
      queryIncFn: () => {}, // 查询上(下)一个函数，由子代的Tree组件负责暴露它，然后在此处缓存
    };
  }

  /**
   * 获取树数据
   * @param {string} type - tree type
   * @param {boolean} [force=false] - 是否强制获取
   */
  getTreeData(type, force = false) {
    const modelInfo = this.state.modelInfo;
    // 默认的树类型在服务端无数据时直接返回
    if (!modelInfo[type]) {
      this.setState((state) => ({
        tips: {
          ...state.tips,
          [type]: TIPS.noData,
        },
      }));
      return;
    }
    // 如果强制获取 或者 当前的数据（例如空间树下没有数据）为空，就获取数据。
    if (force || !this.data[type]) {
      // 设置状态
      this.setState((state) => ({
        tips: {
          ...state.tips,
          [type]: TIPS.pending,
        },
      }));
      // eslint-disable-next-line compat/compat
      // 根据要获取的数据类型（例如：空间树）全部请求获取树的数据
      Promise.all(
        modelInfo[type].map((info) => api.getData(
          this.props.viewer.host,
          info.fileKey,
          info.modelKey,
          this.props.isOffline
        )
        )
      )
        .then((rsp) => {
          // 当前数据类型的数据置空
          this.data[type] = [];
          modelInfo[type].forEach((info, i) => {
            // 服务端返回空数据时不保存
            if (Object.keys(rsp[i].data).length > 0) {
              // 为了防止同名模型的树数据被合并，data[type]是数组类型而不可以直接是object
              this.data[type].push({
                [info.name]: rsp[i].data,
              });
            }
          });
          // 修改状态
          this.setState((state) => ({
            tips: {
              ...state.tips,
              [type]: TIPS.ok,
            },
          }));
        })
        .catch((rsp) => {
          toastr.error(rsp.message, "获取树数据失败", {
            target: `#${this.props.viewer.viewport}`,
          });
          this.setState((state) => ({
            tips: {
              ...state.tips,
              [type]: TIPS.error,
            },
          }));
        });
    }
  }

  switchTreeType(type) {
    if (!this.data[type]) {
      this.getTreeData(type);
    } else if (type !== this.state.treeType) {
      const viewer = this.props.viewer;
      switch (type) {
        case "空间树":
          if (this.state.spaceTreeStatus.length > 0) {
            viewer.highlightComponentsByKey(this.state.spaceTreeStatus);
            viewer.adaptiveSize();
          } else {
            viewer.clearHighlightList();
          }
          break;
        case "系统树":
          if (this.state.modelTreeStatus.length > 0) {
            viewer.highlightComponentsByKey(this.state.modelTreeStatus);
            viewer.adaptiveSize();
          } else {
            viewer.clearHighlightList();
          }
          break;
        case "专业树":
          if (this.state.professionalTreeStatus.length > 0) {
            viewer.highlightComponentsByKey(this.state.professionalTreeStatus);
            viewer.adaptiveSize();
          } else {
            viewer.clearHighlightList();
          }
          break;
        case CATALOG_TREE:
          if (this.state.directoryTreeStatus.length > 0) {
            viewer.highlightComponentsByKey(this.state.directoryTreeStatus);
            viewer.adaptiveSize();
          } else {
            viewer.clearHighlightList();
          }
          break;
        default:
          break;
      }
    }
    this.setState({
      treeType: type,
      canQueryPrev: _.get(this, `treeInfo[${type}].canQueryPrev`, false),
      canQueryNext: _.get(this, `treeInfo[${type}].canQueryNext`, false),
    });
  }

  onCheckCpts(state, cptKeys) {
    if (state) {
      this.props.viewer.showComponentsByKey(cptKeys);
    } else {
      this.props.viewer.hideComponentsByKey(cptKeys);
    }
  }

  // 控制构件半透明
  handleTranslucent = (state, cptKeys) => {
    const key = cptKeys.filter((item) => item && item);
    if (state) {
      this.props.viewer.transparentComponentsByKey(key);
    } else {
      this.props.viewer.closeTransparentComponentsByKey(key);
    }
  };

  async onSearch(query) {
    const info = this.treeInfo[this.state.treeType];
    if (info) {
      const sum = info.queryFn(query);
      const hasNext = sum > 1;
      info.canQueryNext = hasNext;
      info.canQueryPrev = false;

      if (query && sum <= 0) {
        if (!this.props.isOffline) {
          // 判断当前构件是不是模型中隐藏的构件
          const queryBody = {
            "name": {
              "operator": "like",
              "value": `${query}`,
              "logic": "and"
            }
          };
          const currentModelKeys = getAllModelkeys(this.props.viewer);

          const { status, data } = await getComponentsByAttribute(
            this.props.viewer,
            currentModelKeys,
            queryBody,
            0,
            100
          );

          try {
            if (status === 200 && data.data.totalElements) {
              if (data?.data?.content.some(cpt => cpt.primitives > 0)) {
                toastr.info("该构件未显示~", "", {
                  target: `#${this.props.viewer.viewport}`,
                });
                return;
              }
              return;
            }
          } catch (error) {
            console.warn("请求构件信息发生错误：", error);
          }
        }

        toastr.error("查找的内容不存在哦~", "", {
          target: `#${this.props.viewer.viewport}`,
        });
      }

      this.setState({
        canQueryNext: hasNext,
        canQueryPrev: false,
        showSearchArrow: sum > 0,
      });
    }
  }

  queryInc(type, inc) {
    const info = this.treeInfo[type];
    if (info) {
      const rst = info.queryIncFn(inc);
      if (rst) {
        info.canQueryNext = rst.canQueryNext;
        info.canQueryPrev = rst.canQueryPrev;
        this.setState({
          canQueryNext: rst.canQueryNext,
          canQueryPrev: rst.canQueryPrev,
        });
      }
    }
  }

  /**
   * 切换族信息的显示状态
   * @description 两个参数要么都是空字符串，要么都是非空
   * @param {string} modelKey - 模型key
   * @param {string} familyKey - 族的key
   */
  showFamily(modelKey, familyKey) {
    this.props.setComponentInfoVisible(false);
    this.setState({
      family: {
        modelKey,
        familyKey,
      },
    });
  }

  /**
   * 获取当前树的数据到父节点
   * @param {array} currentTreeData 当前树的数据
   */
  handleCurrentTreeData = (ref, type) => {
    const { treeData } = this.state;
    this.setState({
      treeData: {
        ...treeData,
        [type]: ref,
      },
    });
  };

  /**
   * 树数据的提示信息
   * @param {string} content 提示信息
   * @returns {object} 返回提示信息
   */
  createTipComponent = (content) => (
    <div className={style.tip}>
      <img src={noneIcon} alt={content} />
      <span>{content}</span>
    </div>
  );

  /**
   * 获取书组件
   * @param {stirng} type 树组件类型
   * @param {boolean} show 是否显示
   * @returns {object} 树组件
   */
  genTreeComponent(type, show) {
    let content;
    const data = this.data[type] || [];
    switch (this.state.tips[type]) {
      case TIPS.ok:
        if (data.length > 0) {
          content = (
            <Tree
              data={data}
              type={type}
              modelInfo={this.state.modelInfo[type]}
              isShow={show}
              onCheck={(state, cptKeys) => {
                this.onCheckCpts(state, cptKeys);
              }}
              // onClickLeaf={cptKeys => { this.onClickCpt(cptKeys) }}
              queryFn={(fn) => {
                this.treeInfo[type].queryFn = fn;
              }}
              queryIncFn={(fn) => {
                this.treeInfo[type].queryIncFn = fn;
              }}
              onShowFamily={(modelKey, familyKey) => this.showFamily(modelKey, familyKey)}
              translucentMode={this.state.translucentMode}
              // handleTranslucent={this.handleTranslucent}
              handleCurrentTreeData={(that) => this.handleCurrentTreeData(that, type)}
            />
          );
        } else {
          content = this.createTipComponent("暂无数据");
        }
        break;
      case TIPS.error:
        content = this.createTipComponent("无法获取数据");
        break;
      case TIPS.pending:
        content = this.createTipComponent("加载中...");
        break;
      default:
        content = this.createTipComponent("暂无数据");
    }
    return content;
  }

  /**
   * 控制半透明模式
   */
  handleTranslucentMode = (value) => {
    this.setState({
      translucentMode: value,
    });
  };

  render() {
    const {
      treeType,
      modelInfo,
      canQueryNext,
      canQueryPrev,
      showSearchArrow,
      family,
      translucentMode,
      treeData,
    } = this.state;
    const { viewer, isMobile } = this.props;
    const trees = [];
    const otherOpts = [];
    _.uniq(Object.keys(modelInfo).concat(DEFAULT_TYPES)).forEach((type) => {
      if (
        !DEFAULT_TYPES.includes(type)
        && type !== "族树"
        && type !== "部件树"
      ) {
        otherOpts.push(type);
      }
      const show = type === treeType;
      trees.push(
        <div
          key={type}
          style={{
            display: show ? "block" : "none",
            height: "calc(100% - 86px)",
          }}
        >
          {this.genTreeComponent(type, show)}
        </div>
      );
    });

    const modalInfo = {
      width: isMobile ? "302px" : "350px",
      height: isMobile ? "calc(100% - 32px)" : "70%",
      top: isMobile ? "16px" : DEFAULT_MODAL_PLACE.infoTree.top,
      left: isMobile ? "16px" : DEFAULT_MODAL_PLACE.infoTree.left,
      right: isMobile ? "initial" : DEFAULT_MODAL_PLACE.infoTree.right,
      bottom: isMobile ? "16px" : DEFAULT_MODAL_PLACE.infoTree.bottom,
    };

    return (
      <>
        <Modal
          onCancel={() => {
            this.props.onClose();
          }}
          visible
          title="模型树"
          top={modalInfo.top}
          bottom={modalInfo.bottom}
          left={modalInfo.left}
          right={modalInfo.right}
          width={modalInfo.width}
          height={modalInfo.height}
          minWidth={251}
          minHeight={300}
          viewportDiv={this.props.viewer.viewportDiv}
          overflowX="visible"
          overflowY="visible"
        >
          <div className={style.tree}>
            <Query
              onSearch={async (q) => {
                await this.onSearch(q);
              }}
              upValid={canQueryPrev}
              downValid={canQueryNext}
              onSearchPrev={() => {
                this.queryInc(treeType, -1);
              }}
              onSearchNext={() => {
                this.queryInc(treeType, 1);
              }}
              showSearchArrow={showSearchArrow}
              placeholder="请输入搜索内容"
            />
            <Option
              defaultOpts={DEFAULT_TYPES}
              onChange={(type) => this.switchTreeType(type)}
              opts={otherOpts}
              viewer={viewer}
              translucentMode={translucentMode}
              handleTranslucent={this.handleTranslucentMode}
              treeData={treeData}
              currentTreType={this.state.treeType}
              BOS3D={this.props.BOS3D}
              offline={this.props.isOffline}
            />
            {trees}
          </div>
        </Modal>
        <FamilyProperty
          visible={!!family.familyKey}
          modelKey={family.modelKey}
          familyKey={family.familyKey}
          onClose={() => this.showFamily("", "")}
        />
      </>
    );
  }
}

TreeManager.propTypes = {
  onClose: PropTypes.func.isRequired,
  viewer: PropTypes.object.isRequired,
  BOS3D: PropTypes.object.isRequired,
  apiVersion: PropTypes.string.isRequired,
  isOffline: PropTypes.bool.isRequired,
  componentInfoVisible: PropTypes.bool.isRequired,
  setComponentInfoVisible: PropTypes.func.isRequired,
  ee: PropTypes.object.isRequired,
  isMobile: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
  ee: state.system.eventEmitter,
  viewer: state.system.viewer3D,
  apiVersion: state.system.apiVersion,
  isOffline: state.system.offline,
  componentInfoVisible: state.button.componentInfoVisible,
  isMobile: state.system.isMobile,
});
const mapDispatchToProps = (dispatch) => ({
  setComponentInfoVisible: (visible) => {
    dispatch(setComponentInfoVisible(visible));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(TreeManager);
