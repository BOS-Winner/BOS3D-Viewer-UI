import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import _ from "lodash-es";
import { Checkbox } from "@material-ui/core";
import VerticalAlignTopIcon from '@material-ui/icons/VerticalAlignTop';
import IndeterminateIcon from "./IndeterminateIcon";
import CheckboxIcon from "./CheckboxIcon";
import { AntdIcon } from '../../utils/utils';
import {
  ON_HIDE_COMPONENT,
  ON_CLICK_ISOLATE,
  ON_SHOW_FAMILY,
  ON_SAME_CPT,
  ON_SEARCH_CPT,
  SHOW_ALL_CPT,
  ON_OTHER_TRANSPARENT
} from "../eventType";
import showFamilyImg from "../img/gray/paste.png";
import style from "./style.less";

const DEFAULT_TYPES = [
  "空间树",
  "系统树",
  "专业树",
];

const ROOTNODEID = 0; // root node
const STEP = 20; // 每次刷新的条数
const DEFAULT_CHECKED = true;
const DEFAULT_COLLAPSE = -1; // 1展开，-1收起，0代表没有这个状态
const LOAD_NUM = 60; // 列表内一次能显示的条数
const DELIMITER = '#'; // 路径分隔符
const LOCK_GROUP_NAME = '嘛嘛说所有的都不需要锁定了呢^_^'; // 不能操作的构件组，需要锁定并不参与勾选、半选等逻辑运算
const TREE_ITEM_HEIGHT = 40; // 改变树节点高度样式时要记得改变这个值，单位px

function handleDirectotyTreeData(_tree) {
  const tree = _tree.map(item => {
    const treeRootKey = Object.keys(item)[0];
    const treeData = item[treeRootKey];
    return {
      name: treeRootKey,
      key: null,
      child: treeData[treeRootKey]
    };
  });
  return tree;
}

class Tree extends React.Component {
  constructor(props) {
    super(props);
    this.totalNode = 0; // 节点总数
    this.maxLayer = 0;
    this.throttleScroll = _.throttle(e => { this.onScroll(e) }, 16);
    this.treeRef = React.createRef();
    console.log(props.data);
    this.renderData = props.type === "目录树" ? this.transDataToRenderByDirectoryTree(handleDirectotyTreeData(_.cloneDeep(props.data)))[0]
      : this.transDataToRender(_.cloneDeep(props.data))[0];
    // 必须保证data的根是模型的名称，否则没有意义
    // getRootKey依赖renderData，必须先生成renderData再计算
    this.rootIndex = this.getRootKey(props.data);
    // 根据模型信息计算所有勾选状态
    this.calAllNodesCheckState();
    this.clickSelectedList = []; // 通过鼠标点击选中的项,(也就是高亮的构件)
    this.translucentIDList = []; // 存储半透明的构件key
    this.hideIDList = []; // 存储没有勾选的构件key
    this.enableClickNodeName = true; // fuck双击检测
    this.queryRstList = []; // 查找结果的index列表
    this.currentQueryListIdx = -1; // 当前查询结果在查询结果列表中的位置，-1代表没有结果

    this.pickCptCB = this.onPickCpt.bind(this);
    this.modelInitCB = this.onModelInit.bind(this);
    this.onClickHideIconCB = this.onClickHideIcon.bind(this);
    this.onClickIsolateCB = this.onClickIsolate.bind(this);
    this.onShowFamilyCptCB = this.onShowFamilyCpt.bind(this);
    this.onShowAllCpt = this.showAllCpt.bind(this);
    this.showStartIndexToTop = false; // 是否需要将第一个高亮的树节点设置到顶部区域
    this.paddingTop = 0; // 仅在render时更新
    this.paddingBottom = 0; // 仅在render时更新
    this.state = {
      startIndex: 0, // 从哪一个开始加载
      showScrollTop: false,
    };
  }

  componentDidMount() {
    // 获取当前树的数据，方便构件导出
    this.props.handleCurrentTreeData(this);

    const viewer = this.props.viewer;
    const EVT = this.props.BOS3D.EVENTS;

    // 生成待查询字典，方便查询
    this.handleRenderNodeKeyMap();

    // 模型事件回调
    viewer.registerModelEventListener(EVT.ON_CLICK_PICK, this.pickCptCB);
    viewer.registerModelEventListener(EVT.AFTER_RESETSCENE, this.modelInitCB);

    // 右键菜单回调
    this.props.ee.on(ON_HIDE_COMPONENT, this.onClickHideIconCB);
    this.props.ee.on(ON_CLICK_ISOLATE, this.onClickIsolateCB);
    this.props.ee.on(ON_SHOW_FAMILY, this.onShowFamilyCptCB);
    this.props.ee.on(ON_SAME_CPT, this.showSameCpt);
    this.props.ee.on(ON_SEARCH_CPT, this.checkDidmount);
    this.props.ee.on(SHOW_ALL_CPT, this.onShowAllCpt);
    this.props.ee.on(ON_OTHER_TRANSPARENT, this.onTranslucentCB);
    // 反射搜索方法
    this.props.queryFn(q => this.queryTreeNode(q));
    // 反射查找下k个的方法
    this.props.queryIncFn(inc => this.queryInc(inc));

    // 第一次加渲染模型树要依据模型的状态更新模型树的状态
    if (this.props.isShow && DEFAULT_TYPES.includes(this.props.type)) {
      // 检查当前是否有半透明的构件
      // 检查当前场景中是否有高亮构件
      this.checkDidmount(this.props.viewer.getHighlightComponentsKey());
      // 检查当前的场景中是否有半透明的构件
      this.checkTranslucentDidmount(this.props.viewer.getTransparentComponentList());
      // 检查当前的场景中是否有隐藏的构件
      this.checkHideDidmount(this.props.viewer.getInvisibleComponentList());
    } else if (this.props.isShow && !DEFAULT_TYPES.includes(this.props.type)) {
      // 重置模型状态
      this.props.viewer.showAllComponents();
      this.props.viewer.clearHighlightList();
    }
  }

  // 存储模型树字典
  handleRenderNodeKeyMap() {
    this.nodeCptKeyMap = {};
    this.renderData.forEach(node => {
      this.nodeCptKeyMap[node.cptKey || node.familyKey] = node;
    });
  }

  /**
   * 每次state和props更新后会调用（首次加载也会调用）
   * @param {objec} nextProps 下一次的props
   * @returns {boolean} 是否更新
   */
  shouldComponentUpdate(nextProps) {
    // 重新显示树时要重设模型状态
    if (nextProps.isShow && !this.props.isShow) {
      // 恢复切换树之前的状态
      this.recoveryModelState();

      // 获取当前树的数据
      this.props.handleCurrentTreeData(this);

      return true;
    }
    return true;
  }

  componentWillUnmount() {
    // document.removeEventListener('keydown', this.onCtrlDown);
    const viewer = this.props.viewer;
    const EVT = this.props.BOS3D.EVENTS;
    viewer.unregisterModelEventListener(
      EVT.ON_CLICK_PICK,
      this.pickCptCB,
    );
    viewer.unregisterModelEventListener(
      EVT.AFTER_RESETSCENE,
      this.modelInitCB,
    );
    this.props.ee.off(ON_HIDE_COMPONENT, this.onClickHideIconCB);
    this.props.ee.off(ON_CLICK_ISOLATE, this.onClickIsolateCB);
    this.props.ee.off(ON_SHOW_FAMILY, this.onShowFamilyCptCB);
    this.props.ee.off(ON_SAME_CPT, this.showSameCpt);
    this.props.ee.off(ON_SEARCH_CPT, this.checkDidmount);
    this.props.ee.off(SHOW_ALL_CPT, this.onShowAllCpt);
    this.props.ee.off(ON_OTHER_TRANSPARENT, this.onTranslucentCB);
  }

  componentDidUpdate() {
    // 渲染完成之后更新checkbox的半选中状态
    // this.updateAllCheckboxState();

    // 按需更新滚动条位置
    if (this.showStartIndexToTop) {
      this.setNodeToScrollTop(this.clickSelectedList[this.clickSelectedList.length - 1]);
      this.showStartIndexToTop = false;
    }
  }

  // 根据模型中高亮的构件，模型树初始化的时候也需要跟随着高亮
  checkDidmount = (highLightCptKeys) => {
    // 如果没有高亮构件取消执行
    if (!highLightCptKeys.length) {
      this.clickSelectedList = [];
      this.forceUpdate();
      return;
    }
    // 获取最后一个构件key
    const lastHighCptKey = highLightCptKeys.length && highLightCptKeys[highLightCptKeys.length - 1];
    let startIndex;

    // 获取高亮构件对应的模型的ids
    this.clickSelectedList = this.genRenderIdByCptKey(highLightCptKeys);

    // 展开每个节点的父代节点
    this.clickSelectedList.forEach(_id => {
      if (_id !== ROOTNODEID) {
        const node = this.renderData[_id];
        const routeList = node.route.split("#");
        const parentId = routeList[routeList.length - 2];
        // 判断其父节点是否已经展开
        if (this.renderData[parentId].collapse === -1) {
          this.expandToShowNode(_id);
        }
      }
    });

    // 记录高亮显示的第一个构件节点
    startIndex = this.clickSelectedList[this.clickSelectedList.length - 1];
    if (lastHighCptKey) {
      startIndex = this.genRenderIdByCptKey(lastHighCptKey)[0];
    }

    // 考虑选中嵌套族，处理其子节点
    const ids = []; // 存储当前节点的所有叶子节点和非叶子节点
    this.clickSelectedList.forEach(id => {
      let len = this.renderData[id].children;
      let i = 0;
      while (len--) {
        i++;
        if (!this.renderData[id + i].locked) {
          ids.push(id + i);
        }
        if (this.renderData[id + i].children) {
          len += this.renderData[id + i].children;
        }
      }
    });
    this.clickSelectedList.push(...ids);

    // 去重
    this.clickSelectedList = Array.from(new Set(this.clickSelectedList));

    // 更新其父代节点选中状态
    this.clickSelectedList.forEach(id => this.updateSelectedParentNode(id, true));

    // 模型树显示树节点
    this.forceUpdate(() => {
      this.setNodeToScrollTop(startIndex); // 定位节点到模型树的显示区域
    });

    // 高亮构件
    // const tempHighLightKey = [];
    // this.clickSelectedList.forEach(_id => {
    //   tempHighLightKey.push(this.renderData[_id].cptKey || this.renderData[_id].familyKey);
    // });
    // this.props.viewer.highlightComponentsByKey(tempHighLightKey);

    // this.forceUpdate();
  }

  /**
   * 模型打开时检查当前模型的半透明构件状态
   */
  checkTranslucentDidmount = (translucentCptKeys) => {
    if (!translucentCptKeys.length) return;
    // 获取模型中半透明树节点ID
    this.translucentIDList = this.genRenderIdByCptKey(translucentCptKeys);
    if (this.translucentIDList.length) {
      // 查找其所有子节点
      const ids = [];
      this.translucentIDList.forEach(id => {
        let len = this.renderData[id].children;
        let i = 0;
        while (len--) {
          i++;
          if (!this.renderData[id + i].locked) {
            ids.push(id + i);
          }
          if (this.renderData[id + i].children) {
            len += this.renderData[id + i].children;
          }
        }
      });

      // 添加子节点
      this.translucentIDList.push(...ids);

      // 去重
      this.translucentIDList = Array.from(new Set(this.translucentIDList));

      // 然后点击？
      this.translucentIDList.forEach(_id => {
        this.handleTranslucentNode(_id, true);
      });

      this.forceUpdate();
    }
  }

  checkHideDidmount = (hideCptKeys) => {
    if (!hideCptKeys.length) return;
    this.hideIDList = this.genRenderIdByCptKey(hideCptKeys);
    // 查找其所有子节点
    const ids = [];
    this.hideIDList.forEach(id => {
      let len = this.renderData[id].children;
      let i = 0;
      while (len--) {
        i++;
        if (!this.renderData[id + i].locked) {
          ids.push(id + i);
        }
        if (this.renderData[id + i].children) {
          len += this.renderData[id + i].children;
        }
      }
    });

    // 添加子节点
    this.hideIDList.push(...ids);

    // 去重
    this.hideIDList = Array.from(new Set(this.hideIDList));

    this.hideIDList.forEach(_id => {
      this.checkNode(_id, false);
    });
    this.forceUpdate();
  }

  /**
   * 响应鼠标右键菜单，同类型构件
   */
  showSameCpt = () => {
    this.checkDidmount(this.props.viewer.getHighlightComponentsKey());
  }

  onPickCpt(e) {
    // 当前显示的模型树和左键点击
    if (this.props.isShow && e.event.button === 0) {
      this.clickSelectedList = this.genRenderIdByCptKey(
        this.props.viewer.getHighlightComponentsKey()
      );
      // 防止当前树上没有模型高亮的构件的情况
      const outTreeNodeHgihLightCptKeys = this.props.viewer.getHighlightComponentsKey();
      if (
        this.clickSelectedList?.length < 1
         && e.event.button === 0
          && !outTreeNodeHgihLightCptKeys?.length
      ) {
        // 如果点击模型外的区域说明没有选中构件，那么就取消构件的选中
        this.clickSelectedList = [];
        this.handleCpthighLight([]);
        // return;
      }
      if (e.intersectInfo) {
        if (this.clickSelectedList.length > 0 && e.event.button === 0) {
          this.expandToShowNode(this.clickSelectedList[0]);
          this.showStartIndexToTop = true;
          // const halfNum = Math.round(
          //   parseFloat(getComputedStyle(this.treeRef.current).height)
          //   / 2
          //   / TREE_ITEM_HEIGHT
          // );
          const startIndex = this.calStartIndex(this.clickSelectedList[0]);
          // 考虑选中嵌套族，处理其子节点
          const ids = []; // 存储当前节点的所有叶子节点和非叶子节点
          this.clickSelectedList.forEach(id => {
            let len = this.renderData[id].children;
            let i = 0;
            while (len--) {
              i++;
              if (!this.renderData[id + i].locked) {
                ids.push(id + i);
              }
              if (this.renderData[id + i].children) {
                len += this.renderData[id + i].children;
              }
            }
          });
          this.clickSelectedList.push(...ids);
          this.setState({
            startIndex,
          });
          this.clickSelectedList.forEach(id => this.updateSelectedParentNode(id, true));
          // 将高亮的构件key反馈给父组件
          const selectedCptKeys = outTreeNodeHgihLightCptKeys;
          this.clickSelectedList.forEach(i => {
            if (this.renderData[i].cptKey || this.renderData[i].familyKey) {
              selectedCptKeys.push(this.renderData[i].cptKey || this.renderData[i].familyKey);
            }
          });
          this.handleCpthighLight(selectedCptKeys);
          this.clickSelectedList.forEach(key => {
            this.onClickTypeName(new Event('build'), key, true, true);
          });
          this.forceUpdate();
        } else {
          this.forceUpdate();
        }
      } else {
        this.forceUpdate();
      }
    }
  }

  onModelInit() {
    if (this.props.isShow) {
      this.clickSelectedList = [];
      this.checkAll();
    }
  }

  // 用户点击其他构件半透明触发
  showAllCpt() {
    this.renderData.forEach(data => {
      this.handleTranslucentNode(data.key, false);
    });
    this.checkDidmount(this.props.viewer.getHighlightComponentsKey());
    this.forceUpdate();
  }

  // 用户点击隐藏构件按钮触发
  onClickHideIcon(opt) {
    if (this.props.isShow) {
      // 隐藏的构件取消高亮
      this.props.viewer.clearHighlightList();
      const keys = opt.payload.keys;
      // 去重
      this.clickSelectedList = Array.from(new Set(this.clickSelectedList));
      this.renderData.forEach(data => {
        if (keys.includes(data.cptKey || data.familyKey)) {
          this.checkNode(data.key, false);
          this.updateSelectedParentNode(data.key, false);
          // 取消树节点高亮
          this.clickSelectedList = this.clickSelectedList.filter(id => id !== data.key);
        }
      });
      this.forceUpdate();
    }
  }

  // 用户点击半透明其他构件按钮时触发
  onTranslucentCB = opt => {
    if (this.props.isShow) {
      const keys = opt.payload.keys;
      this.renderData.forEach(data => {
        if (keys.includes(data.cptKey || data.familyKey)) {
          this.handleTranslucentNode(data.key, false);
        } else {
          this.handleTranslucentNode(data.key, true);
        }
      });
      this.forceUpdate();
    }
  }

  // 用户点击构件隔离触发
  onClickIsolate(opt) {
    if (this.props.isShow) {
      // 获取需要隔离的构件key
      const keys = opt.payload.keys;
      this.renderData.forEach(data => {
        if (keys.includes(data.cptKey || data.familyKey)) {
          this.checkNode(data.key, true);
          // this.onClickNodeName(new Event('build'), data.key, false); // 右键点击隔离后取消树节点选中状态
          this.clickSelectedList = Array.from(new Set(this.clickSelectedList));
          const index = this.clickSelectedList.indexOf(data.key);
          this.clickSelectedList.splice(index, 1);
        } else {
          this.checkNode(data.key, false);
        }
      });
      this.checkDidmount(this.clickSelectedList);
      this.forceUpdate();
    }
  }

  // 用户点击构件所属构件族触发
  onShowFamilyCpt(opt) {
    const keys = opt.payload.highLightCpt;
    // 处理专业树外其他树不跟随模型同时亮的问题
    const allNeedHighlight = opt.payload.modelHighLightCpt;
    if (this.props.isShow) {
      const tempNeedHightlight = [];
      const tempAllneedHighlight = [];
      this.renderData.forEach(data => {
        if (keys.includes(data.cptKey || data.familyKey)) {
          tempNeedHightlight.push(data.key);
        }
        if (allNeedHighlight.includes(data.cptKey)) {
          tempAllneedHighlight.push(data.key);
        }
      });
      const needHighlight = Array.from(new Set(tempNeedHightlight));
      const allHihlight = Array.from(new Set(tempAllneedHighlight));
      this.clickSelectedList = [...needHighlight, ...allHihlight];
      // 记录树节点需要高亮的第一个节点的索引
      const startIndex = this.clickSelectedList[this.clickSelectedList.length - 1];

      // 考虑选中嵌套族，处理其子节点
      const ids = []; // 存储当前节点的所有叶子节点和非叶子节点
      this.clickSelectedList.forEach(id => {
        let len = this.renderData[id].children;
        let i = 0;
        while (len--) {
          i++;
          if (!this.renderData[id + i].locked) {
            ids.push(id + i);
          }
          if (this.renderData[id + i].children) {
            len += this.renderData[id + i].children;
          }
        }
      });
      this.clickSelectedList.push(...ids);
      this.clickSelectedList = Array.from(new Set(this.clickSelectedList)); // 去重

      needHighlight.forEach(key => {
        this.onClickTypeName(new Event('build'), key, true, true);
      });
      this.clickSelectedList.map(_id => {
        this.updateSelectedParentNode(_id, true); // 更新其父代的关系
        this.expandNode(_id, true); // 展开节点
        this.expandToShowNode(_id); // 展开其父代节点
        this.forceUpdate();
        return _id;
      });
      this.forceUpdate(() => {
        this.setNodeToScrollTop(startIndex); // 定位节点到模型树的显示区域
      });
    }
  }

  /**
   * 勾选所有node
   */
  checkAll() {
    this.calAllNodesCheckState();
    this.forceUpdate();
  }

  /**
   * 根据用户操作切换前的树节点状态
   */
  recoveryModelState() {
    const { viewer } = this.props;
    // 默认显示全部模型
    viewer.showAllComponents();
    // 恢复高亮状态
    const highLightKeys = this.genCptKeysByRenderId(this.clickSelectedList);
    viewer.highlightComponentsByKey(highLightKeys);

    // 恢复显示状态
    // viewer.showAllComponents();
    const hideKeys = [];
    const showKeys = [];
    const translucentKeys = [];
    const normalKeys = [];
    this.renderData.forEach(d => {
      if (!d.locked) {
        if (d.checked) {
          showKeys.push(d.cptKey || d.familyKey);
        } else {
          hideKeys.push(d.cptKey || d.familyKey);
        }
        if (d.translucent) {
          translucentKeys.push(d.cptKey || d.familyKey);
        } else {
          normalKeys.push(d.cptKey || d.familyKey);
        }
      }
    });

    viewer.showComponentsByKey(showKeys);
    viewer.hideComponentsByKey(hideKeys);

    viewer.transparentComponentsByKey(translucentKeys);
    viewer.closeTransparentComponentsByKey(normalKeys);
  }

  /**
   * 更新checkbox的半选中状态
   * @description 更新的是人看见的树的状态而不是数据本身
   * @deprecated mui自动更了，不需要像控制原生input那样控制了，因此此方法暂时弃用
   */
  updateAllCheckboxState() {
    let index = 0;
    const stop = Math.min(LOAD_NUM, this.totalNode);
    let count = this.state.startIndex;
    while (index < stop) {
      const data = this.renderData[count];
      // 跳过不显示的节点
      if (data.show) {
        if (data.children > 0) {
          this.treeRef.current.children[index].querySelector('input').indeterminate = data.indeterminate;
        }
        index++;
      }
      count++;
      if (count >= this.totalNode) break;
    }
  }

  /**
   * 获取root节点的位置
   * @param {{}[]} data - 树的原始数据
   * @return {object} - 对应root的name-index对
   */
  getRootKey(data) {
    const rootNames = _.flatMap(
      data.map(_d => _.keys(_d)),
      _v => _v
    );
    const rst = {};
    rootNames.forEach(name => {
      this.renderData.some(d => {
        if (d.name === name) {
          rst[name] = d.key;
          return true;
        }
        return false;
      });
    });
    return rst;
  }

  /**
   * 计算所有node的check状态
   * @description 需要先更新rootIndex
   * @description 结果直接写入renderData
   */
  calAllNodesCheckState() {
    Object.values(this.rootIndex).forEach(idx => {
      this.calNodeCheckedState(idx);
    });
  }

  /**
   * 根据模型是否存在指定构件且是否处于显示状态，计算node是否打勾
   * @description 这个方法会考虑子代的状态
   * @param {number} id - node id
   * @param {Set<string>} [_allKeys] - 场景里所有的构件key。记忆化用参数，调用者不需要传递
   * @return {{indeterminate: boolean, checked: boolean}} - 当前id的node的选中状态
   */
  calNodeCheckedState(id, _allKeys) {
    let allKeys = _allKeys;
    if (!allKeys) {
      allKeys = new Set(this.props.viewer.getAllComponentsKey());
    }
    if (this.renderData[id].children === 0) {
      if (this.renderData[id].locked) {
        return {
          checked: false,
          indeterminate: false,
        };
      }
      const cptKey = this.renderData[id].cptKey;
      const checked = allKeys.has(cptKey);
      this.renderData[id].checked = checked;
      return {
        checked,
        indeterminate: false,
      };
    } else {
      let allChecked = true;
      let hasChecked = false;
      let cnt = this.renderData[id].children;
      let i = id;
      while (cnt) {
        i += 1;
        // 跳过锁定组的运算
        try {
          if (this.renderData[i] && !this.renderData[i].locked) {
            const { checked, indeterminate } = this.calNodeCheckedState(i, allKeys);
            // 直接子代是选中或者半选中状态，均说明子代里有选中的node；只要有未选中的node，说明子代不全是选中的
            if (checked || indeterminate) {
              hasChecked = true;
            }
            if (!checked) {
              allChecked = false;
            }
          }
        } catch (error) {
          console.error(this.renderData[i], i, this.renderData, error);
        }
        // eslint-disable-next-line no-empty
        if (!this.renderData[i]) {

        } else {
          i += this.renderData[i].allChildren;
        }
        cnt--;
      }

      let checked;
      let indeterminate;
      // 全选时要禁用半选中状态；不存在选中的node说明完全没选中；非全选但是存在选中node说明是半选中状态
      // 注意逻辑顺序，以及没有if else关系
      if (allChecked) {
        checked = true;
        indeterminate = false;
      }
      if (!hasChecked) {
        checked = false;
        indeterminate = false;
      }
      if (!allChecked && hasChecked) {
        checked = false;
        indeterminate = true;
      }
      this.renderData[id].checked = checked;
      this.renderData[id].indeterminate = indeterminate;

      return {
        checked,
        indeterminate,
      };
    }
  }

  /**
   * 获取2个id节点之间的可见索引距离
   * @description 曾经用过，现有逻辑用不到了
   * @param {number} id1 - id1(小)
   * @param {number} id2 - id2(大)
   * @return {number} - 可见索引距离
   */
  getDistance(id1, id2) {
    let rst = 0;
    for (let i = id1; i < id2; i++) {
      if (this.renderData[i].show) {
        rst++;
      }
    }
    return rst;
  }

  /**
   * 将指定id的node设置到树的scroll top处
   * @description 仅用于重设滚动条，并不用于节点的显隐状态。需要和重置startIndex配合使用
   * @param {number} id - 节点id
   */
  setNodeToScrollTop(id) {
    const dom = this.treeRef.current;
    let shownBeforeId = 0;
    for (let i = 0; i < id; i++) {
      if (this.renderData[i].show) {
        shownBeforeId++;
      }
    }
    dom.scrollTop = shownBeforeId * TREE_ITEM_HEIGHT;
    /*
    // 旧版滚动策略的方法
    let sum = 0;
    const { startIndex } = this.state;
    for (let i = startIndex, len = this.renderData.length; i < len; i++) {
      if (this.renderData[i].show) {
        sum += 1;
      }
    }
    // const areaHeight = getComputedStyle(this.treeRef.current).height;
    dom.scrollTop = Math.round(
      dom.scrollHeight
      * this.getDistance(startIndex, id)
      / sum
      // - parseFloat(areaHeight) / 2
    );
    */
  }

  /**
   * 使指定节点跳一下
   * @description 延迟播放动画，对抗UI渲染延迟
   * @param {number} id - 节点id
   */
  tipNodeById(id) {
    setTimeout(() => {
      const dom = this.treeRef.current.querySelector(`[data-id="${id}"]>.js-node-name`);
      dom.classList.add(style.breathFilter);
      setTimeout(() => {
        dom.classList.remove(style.breathFilter);
      }, 200);
    }, 50);
  }

  /**
   * 树形结构转换成数组
   * @description 所有可选参数在直接调用的时候都不传，那些都是递归过程要用到的
   * @param {object[] | object} data - 数据
   * @param {number} [indent = 0] - 缩进级别
   * @param {string} [pRoute = ''] - 父路径
   * @param {boolean} [locked = false] - 是否锁定本分组下的节点。父节点被锁定则所有子代都锁定
   * @param {string} [modelKey=''] - 模型key，用来在需要网络请求时反查必要数据用
   * @param {boolean} [isFamily = false] - 是否是族。族下只有族。
   * @return {{}[]} - 转换后的树数据
   */
  transDataToRender(data, indent = 0, pRoute = '', locked = false, modelKey = '', isFamily = false) {
    let result = [];
    // 存在length说明是数组（不考虑长度为0和字符串的情况，因为字符串是非法格式）
    if (this.maxLayer < indent) {
      this.maxLayer = indent;
    }
    let initReverseOrder = 0;
    if (data.length && _.isArray(data)) {
      data.forEach(_d => {
        const route = pRoute === '' ? this.totalNode.toString() : `${pRoute}${DELIMITER}${this.totalNode}`;
        // 处理叶节点是空的情况
        if (_.keys(_d).length === 0) {
          result.push({
            name: '',
            key: this.totalNode, // 用于react的key
            modelKey,
            collapse: DEFAULT_COLLAPSE, // 是否展开
            indent: indent + 1, // 缩进次数，用于样式渲染
            reverseOrder: initReverseOrder,
            children: 0, // 子代数
            allChildren: 0, // 全部子代数（包括子代的子代）
            show: DEFAULT_COLLAPSE === 1, // 是否要显示这个节点,
            checked: !locked && DEFAULT_CHECKED, // 不选中被锁定的节点
            route,
            querySelected: false, // is selected by query string or not
            locked,
            translucent: false, // 叶子节点半透明状态，默认为false,
            translucentIndeterminate: false, // 复选框是否为不确定状态。注意如果为true，必须保证checked为false
            cptKey: _d.key,
          });
          this.totalNode += 1;
          // 叶节点包含name，否则是中间节点为{}[]的情况
        } else if (typeof _d.name === 'string') { // 处理叶子节点
          let name = _d.name;
          const { originalId, familyName, familySymbol } = _d;
          // const cptInfo = this.props.viewer.getComponentsByKey(_d.key); // 获取构件数据
          // const originalId = Object.values(
          //   cptInfo?.[0] || {}
          // )?.[0]?.[0]?.originalId;
          // const familyName = Object.values(
          //   cptInfo?.[0] || {}
          // )?.[0]?.[0]?.familyName;
          // const familySymbol = Object.values(
          //   cptInfo?.[0] || {}
          // )?.[0]?.[0]?.familySymbol;
          if (originalId === 0 || originalId) {
            if (!familyName && !familySymbol) {
              name = `${name}[${originalId}]`;
            } else {
              name = `${familyName || ""}: ${familySymbol || ""}[${originalId}]`;
            }
          }
          result.push({
            name,
            key: this.totalNode, // 用于react的key
            cptKey: _d.key, // 构件key
            modelKey,
            familyKey: isFamily ? _d.key : undefined,
            collapse: DEFAULT_COLLAPSE,
            indent: indent + 1, // 缩进次数，用于样式渲染
            reverseOrder: initReverseOrder,
            children: 0, // 子代数
            allChildren: 0, // 全部子代数（包括子代的子代）
            show: DEFAULT_COLLAPSE === 1, // 是否要显示这个节点,
            checked: !locked && DEFAULT_CHECKED, // 不选中被锁定的节点
            route,
            querySelected: false, // is selected by query string or not
            locked,
            translucent: false, // 叶子节点半透明状态，默认为false,
            translucentIndeterminate: false, // 复选框是否为不确定状态。注意如果为true，必须保证checked为false

          });
          this.totalNode += 1;
        } else {
          const familyKey = _d.key;
          // const cptInfo = this.props.viewer.getComponentsByKey(_d.familyKey);
          const originalId = familyKey?.split('_')?.[1];
          delete _d.key;
          _.keys(_d).forEach(_k => {
            const _key = this.totalNode;
            this.totalNode += 1;
            const _locked = (_k === LOCK_GROUP_NAME) || locked;
            let _modelKey = modelKey;
            // 如果是根节点，说明它代表模型名字，此时提取模型key
            if (pRoute === '') {
              const info = this.props.modelInfo.find(_info => _info.name === _k);
              _modelKey = info?.modelKey || modelKey;
            }
            const [childNodes, reverseOrder] = this.transDataToRender(
              _d[_k], indent + 1, route, _locked, _modelKey, !!familyKey,
            );
            initReverseOrder = reverseOrder;
            const allChildren = childNodes.length;
            result.push({
              name: `${_k}${originalId ? `[${originalId}]` : ''}`,
              // cptKey: _k,
              key: _key,
              modelKey: _modelKey,
              familyKey,
              // 默认展开第0级节点
              collapse: indent === 0 ? 1 : DEFAULT_COLLAPSE,
              children: _d[_k].length || _.keys(_d[_k]).length,
              allChildren,
              indent,
              reverseOrder: initReverseOrder,
              // 默认显示根节点和其直接子代
              show: (DEFAULT_COLLAPSE === 1) || (indent <= 1),
              checked: !_locked && DEFAULT_CHECKED,
              indeterminate: false, // 复选框是否为不确定状态。注意如果为true，必须保证checked为false
              route,
              querySelected: false,
              locked: _locked,
              translucent: false, // 叶子节点半透明状态，默认为false,
              translucentIndeterminate: false, // 复选框是否为不确定状态。注意如果为true，必须保证checked为false
              cptKey: _d.key,

            });
            result = result.concat(childNodes);
          });
        }
      });
    } else if (typeof data !== 'string') {
      // 本身就是{}类型，说明是中间节点
      const familyKey = data.key;
      const originalId = familyKey?.split('_')?.[1];
      delete data.key;
      _.keys(data).forEach(_k => {
        const _key = this.totalNode;
        const route = pRoute === '' ? _key.toString() : `${pRoute}${DELIMITER}${_key}`;
        let _modelKey = modelKey;
        // 如果是根节点，说明它代表模型名字，此时提取模型key
        if (pRoute === '') {
          const info = this.props.modelInfo.find(_info => _info.name === _k);
          _modelKey = info?.modelKey || modelKey;
        }
        this.totalNode += 1;
        const _locked = (_k === LOCK_GROUP_NAME) || locked;
        const [childNodes, reverseOrder] = this.transDataToRender(
          data[_k], indent + 1, route, _locked, _modelKey, !!familyKey
        );
        initReverseOrder = reverseOrder;
        const allChildren = childNodes.length;
        result.push({
          name: `${_k}${originalId ? `[${originalId}]` : ''}`,
          // cptKey: _k,
          key: _key,
          modelKey: _modelKey,
          familyKey,
          // 默认展开第0级节点
          collapse: indent === 0 ? 1 : DEFAULT_COLLAPSE,
          children: data[_k].length || _.keys(data[_k]).length,
          allChildren,
          indent,
          reverseOrder: initReverseOrder,
          // 默认显示根节点和其直接子代
          show: (DEFAULT_COLLAPSE === 1) || (indent <= 1),
          checked: !_locked && DEFAULT_CHECKED,
          indeterminate: false, // 复选框是否为不确定状态。注意如果为true，必须保证checked为false
          route,
          locked: _locked,
        });
        result = result.concat(childNodes);
      });
    }
    return [result, initReverseOrder + 1];
  }

  transDataToRenderByDirectoryTree(data, indent = 0, pRoute = '', locked = false, modelKey = '', isFamily = false) {
    let result = [];
    if (this.maxLayer < indent) {
      this.maxLayer = indent;
    }
    let initReverseOrder = 0;
    if (data.length && _.isArray(data)) {
      data.forEach(_d => {
        const route = pRoute === '' ? this.totalNode.toString() : `${pRoute}${DELIMITER}${this.totalNode}`;
        // 处理叶节点是空的情况, 其实这个应该不用处理
        if (_.keys(_d).length === 0) {
          result.push({
            name: '',
            key: this.totalNode, // 用于react的key
            modelKey,
            collapse: DEFAULT_COLLAPSE, // 是否展开
            indent: indent + 1, // 缩进次数，用于样式渲染
            reverseOrder: initReverseOrder,
            children: 0, // 子代数
            allChildren: 0, // 全部子代数（包括子代的子代）
            show: DEFAULT_COLLAPSE === 1, // 是否要显示这个节点,
            checked: !locked && DEFAULT_CHECKED, // 不选中被锁定的节点
            route,
            querySelected: false, // is selected by query string or not
            locked,
            translucent: false, // 叶子节点半透明状态，默认为false,
            translucentIndeterminate: false, // 复选框是否为不确定状态。注意如果为true，必须保证checked为false
            cptKey: _d.key,
          });
          this.totalNode += 1;
          // 叶节点包含name，否则是中间节点为{}[]的情况
        } else if (!_.keys(_d).includes("child")) { // 处理叶子节点
          let name = _d.name || "未命名";
          const { originalId, familyName, familySymbol } = _d;
          if (originalId === 0 || originalId) {
            if (!familyName && !familySymbol) {
              name = `${name}[${originalId}]`;
            } else {
              name = `${familyName || ""}: ${familySymbol || ""}[${originalId}]`;
            }
          }
          result.push({
            name,
            key: this.totalNode, // 用于react的key
            cptKey: _d.key, // 构件key
            modelKey,
            familyKey: isFamily ? _d.key : undefined,
            collapse: DEFAULT_COLLAPSE,
            indent: indent + 1, // 缩进次数，用于样式渲染
            reverseOrder: initReverseOrder,
            children: 0, // 子代数
            allChildren: 0, // 全部子代数（包括子代的子代）
            show: DEFAULT_COLLAPSE === 1 || indent <= 1, // 是否要显示这个节点,
            checked: !locked && DEFAULT_CHECKED, // 不选中被锁定的节点
            route,
            querySelected: false, // is selected by query string or not
            locked,
            translucent: false, // 叶子节点半透明状态，默认为false,
            translucentIndeterminate: false, // 复选框是否为不确定状态。注意如果为true，必须保证checked为false

          });
          this.totalNode += 1;
        } else { // 处理中间节点
          const familyKey = _d.key;
          // const cptInfo = this.props.viewer.getComponentsByKey(_d.familyKey);
          const originalId = familyKey?.split('_')?.[1];
          delete _d.key;
          // _.keys(_d).forEach(_k => {
          const _key = this.totalNode;
          this.totalNode += 1;
          const _locked = (_d.name === LOCK_GROUP_NAME) || locked;
          let _modelKey = modelKey;
          // 如果是根节点，说明它代表模型名字，此时提取模型key
          if (pRoute === '') {
            const info = this.props.modelInfo.find(_info => _info.name === _d.name);
            _modelKey = info?.modelKey || modelKey;
          }
          const [childNodes, reverseOrder] = this.transDataToRenderByDirectoryTree(
            _d.child, indent + 1, route, _locked, _modelKey, !!familyKey,
          );
          initReverseOrder = reverseOrder;
          const allChildren = childNodes.length;
          result.push({
            name: `${_d.name}${originalId ? `[${originalId}]` : ''}`,
            // cptKey: _k,
            key: _key,
            modelKey: _modelKey,
            familyKey,
            // 默认展开第0级节点
            collapse: indent === 0 ? 1 : DEFAULT_COLLAPSE,
            children: _d.child.length,
            allChildren,
            indent,
            reverseOrder: initReverseOrder,
            // 默认显示根节点和其直接子代
            show: (DEFAULT_COLLAPSE === 1) || (indent <= 1),
            checked: !_locked && DEFAULT_CHECKED,
            indeterminate: false, // 复选框是否为不确定状态。注意如果为true，必须保证checked为false
            route,
            querySelected: false,
            locked: _locked,
            translucent: false, // 叶子节点半透明状态，默认为false,
            translucentIndeterminate: false, // 复选框是否为不确定状态。注意如果为true，必须保证checked为false
            cptKey: _d.key,

          });
          result = result.concat(childNodes);
          // });
        }
      });
    } else if (typeof data !== 'string') {
      // 本身就是{}类型，说明是中间节点
      const familyKey = data.key;
      const originalId = familyKey?.split('_')?.[1];
      delete data.key;

      const _key = this.totalNode;
      const route = pRoute === '' ? _key.toString() : `${pRoute}${DELIMITER}${_key}`;
      let _modelKey = modelKey;
      // 如果是根节点，说明它代表模型名字，此时提取模型key
      if (pRoute === '') {
        const info = this.props.modelInfo.find(_info => _info.name === data.name);
        _modelKey = info?.modelKey || modelKey;
      }
      this.totalNode += 1;
      const _locked = (data.name === LOCK_GROUP_NAME) || locked;
      // 处理子节点
      const [childNodes, reverseOrder] = this.transDataToRenderByDirectoryTree(
        data.child, indent + 1, route, _locked, _modelKey, !!familyKey
      );
      initReverseOrder = reverseOrder;
      const allChildren = childNodes.length;
      result.push({
        name: `${data.name || "未命名"}${originalId ? `[${originalId}]` : ''}`,
        // cptKey: _k,
        key: _key,
        modelKey: _modelKey,
        familyKey,
        // 默认展开第0级节点
        collapse: indent === 0 ? 1 : DEFAULT_COLLAPSE,
        children: data.child.length,
        allChildren,
        indent,
        reverseOrder: initReverseOrder,
        // 默认显示根节点和其直接子代
        show: (DEFAULT_COLLAPSE === 1) || (indent <= 1),
        checked: !_locked && DEFAULT_CHECKED,
        indeterminate: false, // 复选框是否为不确定状态。注意如果为true，必须保证checked为false
        route,
        locked: _locked,
      });
      result = result.concat(childNodes);
    }
    return [result, initReverseOrder + 1];
  }

  /**
   * 展开指定id节点
   * @param {string | number} id - 节点id（index）
   * @param {boolean} expand - 是否展开
   */
  expandNode(id, expand) {
    let index = Number(id);
    this.renderData[index].collapse = expand ? 1 : -1;
    let count = this.renderData[index].allChildren;
    while (count--) {
      index += 1;
      const route = this.renderData[index].route;
      const pRoute = route.slice(0, route.lastIndexOf(DELIMITER));
      const pIndex = Number(pRoute.slice(pRoute.lastIndexOf(DELIMITER) + 1));
      this.renderData[index].show = (
        this.renderData[pIndex].collapse === 1
        && this.renderData[pIndex].show
      );
      // count += this.renderData[index].children;
    }
  }

  /**
   * 展开指定节点所有的父代
   * @param {number | string} id - 节点id（index）
   */
  expandToShowNode(id) {
    const _id = Number(id);
    // if (this.renderData[_id].children) return;
    const routes = this.renderData[_id].route.split(DELIMITER);
    routes.pop();
    routes.forEach(r => {
      this.expandNode(r, true);
    });
  }

  /**
   * 预先计算真实的startIndex，防止节点数量不足
   * @param {number} initStartIndex - 起始节点的index
   * @return {number} - 真实的index
   */
  calStartIndex(initStartIndex) {
    let num = Math.min(LOAD_NUM, this.totalNode); // 需要加载数据的条数
    let count = initStartIndex;
    while (num) {
      // 跳过不显示的节点
      if (this.renderData[count].show) {
        num--;
      }
      count++;
      if (count >= this.totalNode) break;
    }

    // 渲染节点数量不足的时候从上方补全
    count = initStartIndex;
    while (num) {
      count -= 1;
      if (count <= 0) break;
      const data = this.renderData[count];
      if (data.show) {
        num--;
      }
    }

    if (count <= 0) return 0;
    return count;
  }

  onScroll(e) {
    e.stopPropagation();
    const showScrollTop = e.target.scrollTop !== 0;
    if (showScrollTop !== this.state.showScrollTop) {
      this.setState({
        showScrollTop,
      });
    }
    // 只有节点总数大于一次加载的数量才启用infinite scroll
    if (this.totalNode > LOAD_NUM) {
      const testRange = TREE_ITEM_HEIGHT * STEP;
      const target = e.target;
      // 下滚
      if ((
        target.scrollHeight - target.scrollTop - testRange <= this.paddingBottom
      ) && (
        this.state.startIndex < this.totalNode - LOAD_NUM
      )) {
        console.debug('bottom+');
        // e.target.scrollBy(0, -1);
        // todo: 上滚和下滚的新版index更新算法是重复的，建议合并
        this.setState(() => {
          /*
          // 滚动时，跳过点的数量等于STEP加上不显示点的数量
          let startIndex = state.startIndex;
          let count = STEP;
          while (count > 0 && startIndex < this.totalNode - LOAD_NUM) {
            if (this.renderData[startIndex].show) {
              count -= 1;
            }
            startIndex += 1;
          }
          */

          // 从0向下数startIndex个显示的节点，并跳过不显示的点
          let startIndex = Math.trunc(target.scrollTop / TREE_ITEM_HEIGHT) - STEP;
          if (startIndex < 0) startIndex = 0;
          let cnt = startIndex;
          let i = 0;
          while (cnt > 0 && startIndex < this.totalNode - LOAD_NUM) {
            if (this.renderData[i].show) {
              cnt--;
            } else {
              startIndex++;
            }
            i++;
          }

          return {
            startIndex: this.calStartIndex(startIndex),
          };
        });
      }
      // 上滚
      if ((
        target.scrollTop - testRange <= this.paddingTop
      ) && (
        this.state.startIndex > 0
      )) {
        console.debug('top+');
        // e.target.scrollBy(0, 1);
        this.setState(() => {
          /*
          // 滚动时，跳过点的数量等于STEP加上不显示点的数量
          let startIndex = state.startIndex;
          let count = STEP;
          while (count > 0 && startIndex > 0) {
            if (this.renderData[startIndex].show) {
              count -= 1;
            }
            startIndex -= 1;
          }
          */

          // 从0向下数startIndex个显示的节点，并跳过不显示的点
          let startIndex = Math.trunc(target.scrollTop / TREE_ITEM_HEIGHT) - STEP;
          if (startIndex < 0) startIndex = 0;
          let cnt = startIndex;
          let i = 0;
          while (cnt > 0 && startIndex < this.totalNode - LOAD_NUM) {
            if (this.renderData[i].show) {
              cnt--;
            } else {
              startIndex++;
            }
            i++;
          }

          return {
            startIndex: this.calStartIndex(startIndex),
          };
        });
      }
    }
  }

  // 点击节点，控制展开与收起。如果点击叶节点，则反馈给父组件
  onClick(e) {
    const id = e.target.getAttribute("data-id");
    if (id === null) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const index = Number(id);
    if (this.renderData[index].children > 0) {
      this.expandNode(id, this.renderData[index].collapse === -1);
      this.forceUpdate();
    }
  }

  onCheck(e, id, check) {
    if (e) {
      e.stopPropagation();
    }

    // mui已经替我反过来了
    const checked = e !== null ? e.target.checked : check;
    let cptKeys = [];
    const key = this.renderData[id].cptKey;
    // handing the root of tree show or hide
    // if (id === ROOTNODEID) {
    //   this.renderData.forEach(item => {
    //     if (!item.locked) {
    //       item.checked = checked;
    //       this.hideIDList.push(item.key);
    //       cptKeys.push(item.cptKey || item.familyKey);
    //     }
    //   });
    //   this.checkNode(ROOTNODEID, checked);
    // } else
    if (this.renderData[id] === 0 && key) {
      const ids = [];
      this.renderData.forEach(data => {
        if (data.cptKey === key) {
          ids.push(data.key);
        }
      });
      // 去重
      this.hideIDList = Array.from(new Set(this.hideIDList));
      // 需要隐藏的构件
      if (!checked) {
        this.hideIDList.push(...ids);
      } else {
        // 去掉不需要隐藏的
        this.hideIDList = _.difference(this.hideIDList, ids);
      }
      this.hideIDList = Array.from(new Set(this.hideIDList));

      ids.forEach(_id => {
        const tempCptKeys = this.checkNode(_id, checked);
        cptKeys.push(...tempCptKeys);
      });
      cptKeys = Array.from(new Set(cptKeys));
    } else {
      // 查找该节点下的所有节点；
      const ids = [id];
      const notDuplicateCpt = {};
      const duplicateIds = [];
      let len = this.renderData[id].children;
      let i = 0;
      while (len--) {
        i++;
        try {
          if (!this.renderData[id + i]?.locked) {
            ids.push(id + i);
            const node = this.renderData[id + 1];
            if (!notDuplicateCpt[node.cptKey || node.familyKey]) {
              notDuplicateCpt[node.cptKey || node.familyKey] = node.id;
            } else {
              duplicateIds.push(node.id);
            }
          }
          if (this.renderData[id + i].children) {
            len += this.renderData[id + i].children;
          }
        } catch (error) {
          console.error(id, i, this.renderData[i + id], error);
        }
      }

      const allCheckNodeId = [...ids, ...duplicateIds];
      this.checkNode(id, checked);
      _.uniq(duplicateIds).forEach(_id => this.checkNode(_id, checked));

      // 去重
      this.hideIDList = Array.from(new Set(this.hideIDList));

      // 需要隐藏的构件
      if (!checked) {
        this.hideIDList.push(...allCheckNodeId);
      } else {
        // 去掉不需要隐藏的构件
        this.hideIDList = _.difference(this.hideIDList, allCheckNodeId);
      }
      this.hideIDList = Array.from(new Set(this.hideIDList));

      // 需要显示和隐藏的模型
      cptKeys = _.uniq(allCheckNodeId).map(_id => this.renderData[_id].cptKey
        || this.renderData[_id].familyKey);
    }
    this.handleHideCpt(checked, cptKeys);

    // 恢复半透明状态
    this.props.viewer.clearTransparentList();
    const translucentCptKeys = this.genCptKeysByRenderId(this.translucentIDList);
    // 如果当前树全部构件半透明，则全部构件半透明。
    // if (this.renderData.length === this.translucentIDList.length) {
    //   this.props.viewer.transparentAllComponents();
    // }
    if (translucentCptKeys.length) {
      this.props.viewer.transparentComponentsByKey(translucentCptKeys);
    }

    // 恢复高亮状态
    const hightLightCptKeys = this.genCptKeysByRenderId(this.clickSelectedList);
    if (hightLightCptKeys.length) {
      this.props.viewer.highlightComponentsByKey(hightLightCptKeys);
    }

    this.forceUpdate();
    setTimeout(() => {
      this.forceUpdate();
    }, 100);
  }

  /**
   * 处理构件半透明模式的点击事件
   * @param {object} e 事件对象
   * @param {number} id 构件id
   * @param {boolean} check 是否选择（true表示选择）
   */
  handleTranslucent = (e, id, check) => {
    if (e) {
      e.stopPropagation();
    }
    // mui已经替我反过来了
    const checked = e !== null ? e.target.checked : check;
    let cptKeys = [];
    const key = this.renderData[id].cptKey;
    // 叶节点直接处理，否则作为中间节点勾选
    if (this.renderData[id].children === 0 && key) {
      const ids = [];
      this.renderData.forEach(data => {
        if (data.cptKey === key) {
          ids.push(data.key);
        }
      });

      // 去重
      this.translucentIDList = Array.from(new Set(this.translucentIDList));

      // 需要半透明的构件
      if (checked) {
        this.translucentIDList.push(...ids);
        this.translucentIDList = Array.from(new Set(this.translucentIDList));
      } else {
        // 去掉不需要半透明的
        this.translucentIDList = _.difference(this.translucentIDList, ids);
      }
      ids.forEach(_id => {
        const tempCptKeys = this.handleTranslucentNode(_id, checked);
        cptKeys.push(...tempCptKeys);
      });
      cptKeys = Array.from(new Set(cptKeys));
    } else {
      // 查找该节点下的所有节点；
      const ids = [id];
      let len = this.renderData[id].children;
      let i = 0;
      while (len--) {
        i++;
        try {
          if (!this.renderData[id + i]?.locked) {
            ids.push(id + i);
          }
          if (this.renderData[id + i].children) {
            len += this.renderData[id + i].children;
          }
        } catch (error) {
          console.error(id, i, this.renderData[i + id], error);
        }
      }
      // 查找树中与上面查找到的节点相同的所有节点
      const allCheckNodeId = [];
      ids.forEach(_id => {
        const tempId = this.findAllSameNode(_id);
        allCheckNodeId.push(...tempId);
      });
      // 上面这些节点选中或者取消选中
      _.uniq(allCheckNodeId).forEach(_id => this.handleTranslucentNode(_id, checked));

      // 去重
      this.translucentIDList = Array.from(new Set(this.translucentIDList));

      // 需要半透明的构件
      if (checked) {
        this.translucentIDList.push(...allCheckNodeId);
        this.translucentIDList = Array.from(new Set(this.translucentIDList));
      } else {
        // 去掉不需要半透明的
        this.translucentIDList = _.difference(this.translucentIDList, allCheckNodeId);
      }

      // 需要显示和半透明的模型
      cptKeys = _.uniq(allCheckNodeId).map(_id => this.renderData[_id].cptKey
        || this.renderData[_id].familyKey);
    }
    this.forceUpdate();
    this.handleCptTranslucent(checked, cptKeys);
  }

  /**
   * 勾选或反选node
   * @param {number | string} id - node id
   * @param {boolean} checked - 是否被选中
   * @return {string[]} - 被操作的构件key
   */
  checkNode(id, checked) {
    let index = Number(id);
    const routes = this.renderData[index].route.split(DELIMITER).map(i => Number(i));
    // 记录哪些构件被选中或反选
    const cptKeys = [];
    // 改变子代选中状态
    let count = 0;
    do {
      if (!this.renderData[index].locked) {
        this.renderData[index].checked = checked;
        count += this.renderData[index].children;
        if (this.renderData[index].children > 0) {
          this.renderData[index].indeterminate = false;
        } else {
          cptKeys.push(this.renderData[index].cptKey || this.renderData[index].familyKey);
        }
      }
      index += 1;
    } while (count--);

    // 改变父代选中状态
    for (let i = routes.length - 2; i >= 0; i--) {
      count = this.renderData[routes[i]].children;
      index = routes[i];
      if (checked) {
        // 依次查看父节点的子代是否都选中，并改变状态
        // 选中时，父节点只有选中和半选中两种可能，值由checked决定
        let allChecked = true;
        while (allChecked && count--) {
          index += 1;
          if (!this.renderData[index].locked && !this.renderData[index].checked) {
            allChecked = false;
            this.renderData[routes[i]].checked = false;
            this.renderData[routes[i]].indeterminate = true;
          }
          index += this.renderData[index].allChildren;
        }
        if (allChecked) {
          this.renderData[routes[i]].checked = true;
          // 都选中的话，就选中父节点，防止出现模型没有共享的构件显隐不正确的问题
          cptKeys.push(this.renderData[routes[i]].cptKey || this.renderData[routes[i]].familyKey);
          this.renderData[routes[i]].indeterminate = false;
        }
      } else {
        // 依次查看父节点的直接子代是否都半选中，并改变状态
        // 未选中时，父节点只有未选中和半选中两种可能，值由checked和indeterminate决定
        let hasChecked = false;
        this.renderData[routes[i]].checked = false;
        while (!hasChecked && count--) {
          index += 1;
          // 注意可能存在，节点选中但是半选中状态是false的情况（即子代是全选的时候）
          if (
            !this.renderData[index].locked
            && (
              this.renderData[index].indeterminate
              || this.renderData[index].checked
            )
          ) {
            hasChecked = true;
            this.renderData[routes[i]].indeterminate = true;
          }
          index += this.renderData[index].allChildren;
        }
        if (!hasChecked) {
          this.renderData[routes[i]].indeterminate = false;
          // 都都没选中的话，就隐藏父节点构件，防止出现模型没有共享的构件显隐不正确的问题
          cptKeys.push(this.renderData[routes[i]].cptKey || this.renderData[routes[i]].familyKey);
        }
      }
    }

    return cptKeys;
  }

  /**
   * 勾选或反选node 处理半透明模式
   * @param {number | string} id - node id
   * @param {boolean} checked - 是否被选中
   * @return {string[]} - 被操作的构件key
   */
  handleTranslucentNode(id, checked) {
    let index = Number(id);
    const routes = this.renderData[index].route.split(DELIMITER).map(i => Number(i));
    // 记录哪些构件被选中或反选
    const cptKeys = [];
    // 改变子代选中状态
    let count = 0;
    do {
      if (!this.renderData[index].locked) {
        this.renderData[index].translucent = checked;
        count += this.renderData[index].children;
        if (this.renderData[index].children > 0) {
          this.renderData[index].translucentIndeterminate = false;
        } else {
          cptKeys.push(this.renderData[index].cptKey || this.renderData[index].familyKey);
        }
      }
      index += 1;
    } while (count--);

    // 改变父代选中状态
    for (let i = routes.length - 2; i >= 0; i--) {
      count = this.renderData[routes[i]].children;
      index = routes[i];
      if (checked) {
        // 依次查看父节点的子代是否都选中，并改变状态
        // 选中时，父节点只有选中和半选中两种可能，值由checked决定
        let allChecked = true;
        while (allChecked && count--) {
          index += 1;
          if (!this.renderData[index].locked && !this.renderData[index].translucent) {
            allChecked = false;
            this.renderData[routes[i]].translucent = false;
            this.renderData[routes[i]].translucentIndeterminate = true;
          }
          index += this.renderData[index].allChildren;
        }
        if (allChecked) {
          this.renderData[routes[i]].translucent = true;
          // 都选中的话，就选中父节点，防止出现模型没有共享的构件显隐不正确的问题
          cptKeys.push(this.renderData[routes[i]].cptKey || this.renderData[routes[i]].familyKey);
          this.renderData[routes[i]].translucentIndeterminate = false;
        }
      } else {
        // 依次查看父节点的直接子代是否都半选中，并改变状态
        // 未选中时，父节点只有未选中和半选中两种可能，值由checked和indeterminate决定
        let hasChecked = false;
        this.renderData[routes[i]].translucent = false;
        while (!hasChecked && count--) {
          index += 1;
          // 注意可能存在，节点选中但是半选中状态是false的情况（即子代是全选的时候）
          if (
            !this.renderData[index].locked
            && (
              this.renderData[index].translucentIndeterminate
              || this.renderData[index].translucent
            )
          ) {
            hasChecked = true;
            this.renderData[routes[i]].translucentIndeterminate = true;
          }
          index += this.renderData[index].allChildren;
        }
        if (!hasChecked) {
          this.renderData[routes[i]].translucentIndeterminate = false;
          // 都都没选中的话，就隐藏父节点构件，防止出现模型没有共享的构件显隐不正确的问题
          cptKeys.push(this.renderData[routes[i]].cptKey || this.renderData[routes[i]].familyKey);
        }
      }
    }

    return cptKeys;
  }

  /**
   * 查找name模糊匹配的node
   * @description 忽略大小写
   * @param {string} query - 查询字符串
   * @return {number} - 匹配的数量
   */
  queryTreeNode(query) {
    const _q = query.toLowerCase();
    const renderData = this.renderData;
    const expandedNodeList = {};
    // 第一个被命中的index
    let firstSelected = -1;
    this.currentQueryListIdx = -1;
    this.queryRstList = [];

    renderData.forEach((data, i) => {
      const selected = (_q && data.name.toLowerCase().includes(_q));
      renderData[i].querySelected = selected;

      if (selected) {
        this.queryRstList.push(i);
        if (firstSelected === -1) {
          firstSelected = i;
          this.currentQueryListIdx = 0;
        }

        renderData[i].route.split(DELIMITER).forEach(_i => {
          const intI = Number(_i);
          if (renderData[intI].children > 0 && !expandedNodeList[intI]) {
            expandedNodeList[intI] = true;
            this.expandNode(_i, true);
          }
          renderData[intI].show = true;
        });
      }
    });

    if (firstSelected >= 0) {
      /*
      this.setState({
        startIndex: this.calStartIndex(firstSelected),
      }, () => {
        this.setNodeToScrollTop(firstSelected);
        this.tipNodeById(firstSelected);
      });
      */
      // 上面的操作已经更新了树节点的显隐状态，直接更新即可
      this.forceUpdate(() => {
        this.setNodeToScrollTop(firstSelected);
        this.tipNodeById(firstSelected);
      });
    } else {
      this.forceUpdate();
    }

    return this.queryRstList.length;
  }

  /**
   * 查找下k个
   * @param {number} inc - 下inc个，正数向下，负数向上，0是非法
   * @return {{canQueryPrev: boolean, canQueryNext: boolean} | undefined} - 是否可以继续向下或者向上查找，undefined代表本次跳转失败
   */
  queryInc(inc) {
    if (inc === 0) return;
    const next = this.currentQueryListIdx + inc;
    if (next < 0 || next > this.queryRstList.length) return;
    this.currentQueryListIdx = next;
    const nextId = this.queryRstList[next];
    if (!this.renderData[nextId].show) {
      this.expandToShowNode(nextId);
    }
    this.setNodeToScrollTop(nextId);
    this.tipNodeById(nextId);
    /*
    this.setState({
      startIndex: this.calStartIndex(this.queryRstList[next])
    }, () => {
      this.setNodeToScrollTop(this.queryRstList[next]);
      this.tipNodeById(this.queryRstList[next]);
    });
    */
    // eslint-disable-next-line consistent-return
    return {
      canQueryPrev: next > 0,
      canQueryNext: next < this.queryRstList.length - 1,
    };
  }

  /**
   * 点击叶节点触发
   * @description keep模式下保证选择的节点是高亮的
   * @param {Event} e - event
   * @param {number} id - 节点id（index）
   * @param {boolean} [keep = false] - 是否保持选中
   */
  onClickNodeName(e, id, keep = false) {
    e.preventDefault();
    e.stopPropagation();
    // 监听点击事件事件中的ctrlKey和metaKey(Mac中的Command键)，因为在Mac上：ctrl + leafclick as rightclick，会阻断keyup事件，所以改为这种方式;
    const isCtrlPress = e.ctrlKey || e.metaKey;
    if (this.renderData[id].locked) return;
    if (this.enableClickNodeName) {
      const _i = this.clickSelectedList.indexOf(id);
      const needSelect = keep || (_i === -1);
      // 单选多选新逻辑 start
      switch (isCtrlPress) {
        case false: { // 单选
          if (!needSelect) { // 不需要选中
            this.clickSelectedList = []; // 置空
          } else {
            this.clickSelectedList = [id];
          }
          break;
        }
        case true: { // 多选
          if (!needSelect) {
            this.clickSelectedList.splice(_i, 1); // 删除一个
          } else {
            this.clickSelectedList.push(id);
          }
          break;
        }
        default:
          break;
      }
      // 单选多选新逻辑 end
      const cptKey = this.renderData[id].cptKey;
      // 找到所有被高亮的构件，后续要高亮它们所有的父节点
      const needHighlight = [id];
      if (cptKey) {
        this.renderData.forEach(data => {
          if (data.cptKey === cptKey) {
            const j = this.clickSelectedList.indexOf(data.key);
            if (!needSelect) {
              if (j !== -1) {
                this.clickSelectedList.splice(j, 1);
                needHighlight.push(data.key);
              }
            } else if (j === -1) {
              this.clickSelectedList.push(data.key);
              needHighlight.push(data.key);
            }
          }
        });
      }
      // 更新父节点的高亮状态
      needHighlight.forEach(_id => {
        this.updateSelectedParentNode(_id, needSelect);
      });
      // 将高亮的构件key反馈给父组件
      const selectedCptKeys = [];
      this.clickSelectedList.forEach(i => {
        if (this.renderData[i].cptKey || this.renderData[i].familyKey) {
          selectedCptKeys.push(this.renderData[i].cptKey || this.renderData[i].familyKey);
        }
      });
      this.handleCpthighLight(selectedCptKeys);

      this.clickSelectedList.forEach(key => {
        this.onClickTypeName(new Event('build'), key, true, true);
      });

      // 更新其父代节点选中状态
      this.clickSelectedList.forEach(_id => this.updateSelectedParentNode(_id, true));
      // 双击和单击效果一致，因此在短时间内锁定单击，营造双击的假象
      this.enableClickNodeName = false;
      this.forceUpdate();
      setTimeout(() => {
        this.enableClickNodeName = true;
      }, 300);
    }
  }

  /**
   * 查找与该节点相同cptKey的所有节点
   * @param {string} 当前节点的key
   * @return {Array} 相同cptKey节点的id（key），包括树节点
   */
  findAllSameNode(id) {
    // 全树搜索，找到和操作节点的构件key相同的点，做相同的操作
    const findKey = this.renderData[id].cptKey || this.renderData[id].familyKey;
    // 找到所有被高亮的构件，后续要高亮它们所有的父节点
    const needHighlight = [id];
    if (findKey) {
      this.renderData.forEach(data => {
        const tempComponentskey = data.cptKey;
        if (tempComponentskey === findKey) {
          needHighlight.push(data.key);
        }
      });
    }
    return needHighlight;
  }

  /**
   * 点击非叶节点触发
   * @param {Event} e - event
   * @param {number} id - 节点id（index）
   * @param {boolean} [keep=false] - 是否需要保持高亮
   * @param {boolean} [showfamliyCpt=false] - 是否是显示部件族构件高亮
   */
  onClickTypeName(e, id, keep = false, showfamliyCpt = false) {
    e.preventDefault();
    e.stopPropagation();
    // 监听点击事件事件中的ctrlKey和metaKey(Mac中的Command键)，因为在Mac上：ctrl + leafclick as rightclick，会阻断keyup事件，所以改为这种方式;
    const isCtrlPress = e.ctrlKey || e.metaKey;
    if (this.renderData[id].locked) return;
    if (this.enableClickNodeName) {
      const _i = this.clickSelectedList.indexOf(id);
      const needSelect = keep || (_i === -1);
      const ids = [id]; // 存储当前节点的所有叶子节点和非叶子节点
      const notDuplicateCpt = {};
      const duplicateIds = [];
      let len = this.renderData[id].children;
      let i = 0;
      while (len--) {
        i++;
        if (!this.renderData[id + i].locked) {
          ids.push(id + i);
          const node = this.renderData[id + 1];
          if (!notDuplicateCpt[node.cptKey || node.familyKey]) {
            notDuplicateCpt[node.cptKey || node.familyKey] = node.id;
          } else {
            duplicateIds.push(node.id);
          }
        }
        if (this.renderData[id + i].children) {
          len += this.renderData[id + i].children;
        }
      }
      // 如果列表里有选择的元素
      if (_i !== -1) {
        // 多选模式且需要保持不变时则直接返回，无需任何操作
        if (isCtrlPress && keep && !showfamliyCpt) return; // ?????
        // 单选keep模式，需要仅保留当前选中元素
        if (!isCtrlPress && keep && !showfamliyCpt) {
          this.clickSelectedList = ids;
          // 否则移除当前选中元素
        } else if (!showfamliyCpt && isCtrlPress) {
          this.clickSelectedList = _.difference(this.clickSelectedList, ids);
        } else if (!showfamliyCpt && !isCtrlPress) {
          this.clickSelectedList = [];
        }

        // 多选构件显示部件族
        if (showfamliyCpt) {
          this.clickSelectedList.push(...ids);
        }

        // 多选模式下增量添加选中元素
      } else if (isCtrlPress) {
        this.clickSelectedList.push(...ids);
      } else {
        this.clickSelectedList = ids;
      }
      // 有重复节点则更新其更新父节点的高亮状态
      duplicateIds.forEach(_id => {
        const j = this.clickSelectedList.indexOf(_id);
        // 如果需要高亮
        if (needSelect) {
          // 如果不在选择节点列表中的话，push进去
          if (j === -1) {
            this.clickSelectedList.push(_id);
          }
        } else if (j !== -1) {
          // 如果要取消高亮状态
          // 如果在选择列表中，则删除，取消高亮状态
          this.clickSelectedList.splice(j, 1);
        }
        // 更新父节点状态
        this.updateSelectedParentNode(_id, needSelect);
      });

      // 将高亮的构件key反馈给父组件
      const selectedCptKeys = [];
      this.clickSelectedList.forEach(_id => {
        // 如果父节点包含几何结构，也要高亮
        const key = this.renderData[_id].cptKey || this.renderData[_id].familyKey;
        if (key) {
          selectedCptKeys.push(key);
        }
      });
      // 控制模型中构件的高亮
      if (!showfamliyCpt) {
        this.handleCpthighLight(selectedCptKeys);
      }

      this.forceUpdate();
      if (!showfamliyCpt) {
        this.enableClickNodeName = false;
        setTimeout(() => {
          this.enableClickNodeName = true;
        }, 250);
      }
    }
  }

  /**
   * 更新指定节点的父节点高亮状态
   * @param {number} id - 节点id
   * @param {boolean} selected - 此节点是否被选中
   */
  updateSelectedParentNode(id, selected) {
    const routes = this.renderData[id].route
      .split(DELIMITER)
      .slice(0, -1)
      .map(n => Number(n))
      .reverse();
    routes.some(_id => {
      // 如果点击的点需要被取消高亮，则移除所有父节点的高亮
      if (!selected) {
        const j = this.clickSelectedList.indexOf(_id);
        if (j !== -1) {
          this.clickSelectedList.splice(j, 1);
        }
        return false;
      } else {
        // 如果需要高亮，则找到所有父节点的子节点是否高亮。如果他们都高亮，则高亮父节点
        // 如果这个父节点本来就是高亮的，则无需检查子节点
        if (this.clickSelectedList.indexOf(_id) > -1) return false;
        let children = this.renderData[_id].children;
        let cnt = 0;
        // 查看是不是所有的子节点都高亮了
        while (children--) {
          cnt += 1;
          const _selected = this.clickSelectedList.indexOf(_id + cnt);
          // 只要有没高亮的节点，说明所有父节点均不需要高亮了，直接退出
          if (_selected === -1) {
            return true;
          }
          cnt += this.renderData[_id + cnt].allChildren;
        }
        // 没有退出，说明当前节点的所有子代都被选中，则选中之
        this.clickSelectedList.push(_id);
        return false;
      }
    });
  }

  onScrollTop() {
    this.setState({
      startIndex: 0,
    }, () => {
      this.setNodeToScrollTop(0);
    });
  }

  /**
   * 显示族属性
   * @param {Event} ev - dom event
   * @param {string} modelKey - 模型key
   * @param {string} familyKey - 族的key
   * @param {number} key - node id
   * @param {boolean} isLeaf - 是否是叶节点
   */
  onShowFamily(ev, modelKey, familyKey, key, isLeaf) {
    ev.preventDefault();
    ev.stopPropagation();
    this.props.onShowFamily(modelKey, familyKey);
    if (isLeaf) {
      this.onClickNodeName(ev, key, true);
    } else {
      this.onClickTypeName(ev, key, true);
    }
  }

  /**
   * 获取模型中构件key相对应的树节点ID
   * @param {string | string[]} keys 模型key列表
   * @returns {Array} 树节点ID
   */
  genRenderIdByCptKey = (keys) => {
    if (!keys) return [];
    let tempKeys = keys;
    if (!Array.isArray(keys)) tempKeys = [keys];
    if (!tempKeys.length) return [];

    const renderDataIdList = [];
    tempKeys.forEach(_key => {
      if (this.nodeCptKeyMap[_key] && this.nodeCptKeyMap[_key]["key"] !== undefined) {
        renderDataIdList.push(this.nodeCptKeyMap[_key]["key"]);
      }
    });
    return renderDataIdList;
  };

  /**
   * 根据树节点id获取模型key
   * @param {Array} ids 树节点id
   * @returns {Array} keys 返回构件key列表
   */
  genCptKeysByRenderId = (ids) => {
    const templist = [];
    ids.forEach(_id => {
      if (this.renderData[_id]?.allChildren === 0) {
        templist.push(this.renderData[_id].cptKey || this.renderData[_id].familyKey);
      }
    });
    return templist;
  }

  /**
   * 设置高亮构件
   * @param {Array}} cptKeys 高亮构件列表
   */
  handleCpthighLight = (cptKeys) => {
    const { viewer } = this.props;
    if (cptKeys.length > 0) {
      viewer.highlightComponentsByKey(cptKeys);
      viewer.adaptiveSize();
    } else {
      viewer.clearHighlightList();
    }
  }

  /**
   * 设置半透明构件
   * @param {boolen} state 是否半透明
   * @param {Array} cptKeys 半透明构件key
   */
  handleCptTranslucent = (state, cptKeys) => {
    const key = cptKeys.filter(item => item && item);
    if (state) {
      this.props.viewer.transparentComponentsByKey(key);
    } else {
      this.props.viewer.closeTransparentComponentsByKey(key);
    }
  }

  /**
   * 设置隐藏构件
   * @param {boolen} state 是否显示构件
   * @param {Array} cptKeys 隐藏显示的构件key
   */
  handleHideCpt = (state, cptKeys) => {
    if (state) {
      this.props.viewer.showComponentsByKey(cptKeys);
    } else {
      this.props.viewer.hideComponentsByKey(cptKeys);
    }
  }

  handleTreeNodeStatistics = (treeNodeStatistic, indent, reverseOrder) => {
    const { layer, order } = treeNodeStatistic;
    if (order) {
      return !!(typeof layer === 'number' && layer !== 0 && layer > indent);
    } else {
      return !!(typeof layer === 'number' && layer !== 0 && reverseOrder > layer);
    }
  }

  /**
   * 计算节点渲染的react component
   * @param {object} data
   * @return {ReturnType<React.createElement>} - react component
   */
  genTreeNode(data) {
    const displayName = data.name || "未命名";
    const { treeNodeStatistic } = this.props;
    if (data.children === 0) {
      return (
        <div
          key={data.key}
          className={`${style.treeNode} ${data.locked ? style.disabled : ''}`}
          style={{
            paddingLeft: `${data.indent * 16}px`
          }}
          role="tree"
          tabIndex={0}
          data-id={data.key}
          onClick={e => { this.onClick(e) }}
        >
          <Checkbox
            classes={{
              root: style.checkbox,
              checked: style.checked,
              disabled: style.disabled,
            }}
            size="small"
            checked={data.checked}
            checkedIcon={<CheckboxIcon checked />}
            icon={<CheckboxIcon checked={false} disabled={data.locked} />}
            disabled={data.locked}
            indeterminate={data.indeterminate}
            indeterminateIcon={<IndeterminateIcon />}
            onChange={e => { this.onCheck(e, data.key) }}
          />
          {
            this.props.translucentMode ? (
              <Checkbox
                classes={{
                  root: style.checkbox,
                  checked: style.checked,
                  disabled: style.disabled,
                }}
                size="small"
                checked={typeof data.translucent !== 'undefined' ? data.translucent : false}
                checkedIcon={<AntdIcon type="iconicon_goujiantouming_xuanzhongzhuangtai" className={style.translucentCheckedIcon} />}
                icon={<AntdIcon type="iconicon_goujiantouming_weixuanzhongzhuangtai" className={style.translucentCheckIcon} />}
                disabled={data.locked}
                indeterminate={typeof data.translucentIndeterminate !== 'undefined' ? data.translucentIndeterminate : false}
                indeterminateIcon={<AntdIcon type="iconicon_goujiantouming_hunhezhuangtai" className={style.translucentIndeterIcon} />}
                onChange={e => { this.handleTranslucent(e, data.key) }}
              />
            ) : null
          }
          <div
            className={`js-node-name ${style.nodeName}`}
            aria-hidden
            title={displayName}
            data-queryselected={data.querySelected}
            data-clickselected={this.clickSelectedList.includes(data.key)}
            onClick={ev => { this.onClickNodeName(ev, data.key) }}
          >
            {displayName}
          </div>
          {data.familyKey ? (
            <img
              className={style.showFamily}
              alt="显示族属性"
              src={showFamilyImg}
              onClick={ev => {
                this.onShowFamily(ev, data.modelKey, data.familyKey, data.key, true);
              }}
            />
          ) : (
            <></>
          )}
        </div>
      );
    } else {
      // 渲染中间节点
      return (
        <div
          key={data.key}
          className={`${style.treeNode} ${style.title} ${data.collapse === -1 ? style.collapse : ''} ${data.locked ? style.disabled : ''}`}
          style={{
            paddingLeft: `${data.indent * 16}px`
          }}
          role="tree"
          tabIndex={0}
          data-id={data.key}
          onClick={e => { this.onClick(e) }}
        >
          <Checkbox
            classes={{
              root: style.checkbox,
              checked: style.checked,
              disabled: style.disabled,
            }}
            size="small"
            checked={data.checked}
            checkedIcon={<CheckboxIcon checked />}
            icon={<CheckboxIcon checked={false} disabled={data.locked} />}
            disabled={data.locked}
            indeterminate={data.indeterminate}
            indeterminateIcon={<IndeterminateIcon />}
            onChange={e => { this.onCheck(e, data.key) }}
          />
          {
            this.props.translucentMode ? (
              <Checkbox
                classes={{
                  root: style.checkbox,
                  checked: style.checked,
                  disabled: style.disabled,
                }}
                size="small"
                checked={typeof data.translucent !== 'undefined' ? data.translucent : false}
                checkedIcon={<AntdIcon type="iconicon_goujiantouming_xuanzhongzhuangtai" className={style.translucentCheckedIcon} />}
                icon={<AntdIcon type="iconicon_goujiantouming_weixuanzhongzhuangtai" className={style.translucentCheckIcon} />}
                disabled={data.locked}
                indeterminate={typeof data.translucentIndeterminate !== 'undefined' ? data.translucentIndeterminate : false}
                indeterminateIcon={<AntdIcon type="iconicon_goujiantouming_hunhezhuangtai" className={style.translucentIndeterIcon} />}
                onChange={e => { this.handleTranslucent(e, data.key) }}
              />
            ) : null
          }
          <div
            className={`js-node-name ${style.nodeName}`}
            aria-hidden
            title={displayName}
            data-queryselected={data.querySelected}
            data-clickselected={this.clickSelectedList.includes(data.key)}
            onClick={e => this.onClickTypeName(e, data.key)}
          >
            {displayName}
            {this.handleTreeNodeStatistics(treeNodeStatistic, data.indent, data.reverseOrder) ? `(${data.children})` : ''}
          </div>
          {data.familyKey ? (
            <img
              className={style.showFamily}
              alt="显示族属性"
              src={showFamilyImg}
              onClick={ev => {
                this.onShowFamily(ev, data.modelKey, data.familyKey, data.key);
              }}
            />
          ) : (
            <></>
          )}
        </div>
      );
    }
  }

  render() {
    // console.log(this.renderData);
    const content = [];
    let num = Math.min(LOAD_NUM, this.totalNode); // 需要加载数据的条数
    const startIndex = this.state.startIndex;
    let count = startIndex;
    while (num > 0) {
      const data = this.renderData[count];
      // 跳过不显示的节点
      if (data.show) {
        num--;
        // 渲染节点
        content.push(this.genTreeNode(data));
      }
      count++;
      if (count >= this.totalNode) break;
    }

    let paddingTop = 0;
    for (let i = 0; i < startIndex; i++) {
      if (this.renderData[i].show) {
        paddingTop += TREE_ITEM_HEIGHT;
      }
    }
    this.paddingTop = paddingTop;
    paddingTop += 'px';

    let paddingBottom = 0;
    for (let j = count; j < this.totalNode; j++) {
      if (this.renderData[j].show) {
        paddingBottom += TREE_ITEM_HEIGHT;
      }
    }
    this.paddingBottom = paddingBottom;
    paddingBottom += 'px';

    return (
      <div className={style.treeContainer}>
        <div
          className={style.treeNodeContainer}
          onScroll={e => {
            e.persist();
            this.throttleScroll(e);
          }}
          ref={this.treeRef}
        >
          <div
            style={{
              paddingTop,
              paddingBottom,
            }}
          >
            {content}
          </div>
        </div>
        <div
          className={style.scrollToTop}
          style={{
            display: this.state.showScrollTop ? 'flex' : 'none',
          }}
        >
          <VerticalAlignTopIcon
            onClick={() => this.onScrollTop()}
          />
        </div>
      </div>
    );
  }
}

Tree.propTypes = {
  data: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
  ]).isRequired,
  modelInfo: PropTypes.arrayOf(PropTypes.object).isRequired,
  // 如果type变化，将重算整个树的数据。但是需求变化使得这个功能暂时不用了
  type: PropTypes.string.isRequired,
  // 如果树从不显示到显示，将重置模型状态（而不用于控制 css display）
  isShow: PropTypes.bool.isRequired,
  // onClickLeaf: PropTypes.func,
  // onCheck: PropTypes.func,
  viewer: PropTypes.object.isRequired,
  BOS3D: PropTypes.object.isRequired,
  ee: PropTypes.object.isRequired,
  // 将内部的搜索方法反射给父级
  queryFn: PropTypes.func,
  // 将内部的查找下一个或上一个的方法反射给父级调用
  queryIncFn: PropTypes.func,
  onShowFamily: PropTypes.func,
  translucentMode: PropTypes.bool,
  // handleTranslucent: PropTypes.func.isRequired,
  handleCurrentTreeData: PropTypes.func.isRequired,
  treeNodeStatistic: PropTypes.object,
};

Tree.defaultProps = {
  // onClickLeaf: () => {},
  // onCheck: () => {},
  queryFn: () => {},
  queryIncFn: () => {},
  onShowFamily: () => {},
  translucentMode: false,
  treeNodeStatistic: { layer: 0, order: true },
};

const mapStateToProps = (state) => ({
  ee: state.system.eventEmitter,
  viewer: state.system.viewer3D,
  BOS3D: state.system.BIMWINNER.BOS3D,
  treeNodeStatistic: state.system.treeNodeStatistic
});
const mapDispatchToProps = () => ({});
const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Tree);
export default WrappedContainer;
