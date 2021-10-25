import React from "react";
import PropTypes from "prop-types";
import _ from "lodash-es";
import { connect } from "react-redux";
import generateUUID from "UIutils/generateUUID";
import Icon from "Base/Icon";
import Modal from "Base/Modal";
import { Modal as AntdModal } from 'antd';
import toastr from "../../toastr";
import style from "./style.less";
import redPointPng from "./redPoint";
import { EVENT, DEFAULT_MODAL_PLACE } from "../../constant";
import {
  LINE_OFFSET, TEXT_X_OFFSET, TEXT_Y_OFFSET, DOM_COLOR
} from "./constant";
import { cropPlusExport, getMarkShot } from "./getMarkShot";
import DomMarkNameEditor from './DomMarkNameEditor';
import { AntdIcon } from '../../utils/utils';
import iconstyle from '../../Toolbar/bottom.less';
import MarkMgr from './MarkMgr';
// import MarkForm from './MarkForm/index.jsx';
import MarkCardList from './CardList/index';
import DetailCom from './Detail/index';
import { genDomTitle, genSpriteTitle } from './func';
import { changeMode } from "../action";

const nameEditor = new DomMarkNameEditor();

class Mark extends React.Component {
  static propTypes = {
    viewer: PropTypes.object.isRequired,
    BIMWINNER: PropTypes.object.isRequired,
    DOMMark: PropTypes.object.isRequired,
    SpriteMark: PropTypes.object.isRequired,
    eventEmitter: PropTypes.object.isRequired,
    mode: PropTypes.string.isRequired,
    changeMode: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      dom: [],
      sprite: [],
      curMarkType: 'dom', // 当前标签类型，dom或者sprite
      domColor: DOM_COLOR,
      domOpacity: 255,
      startPosition: [0, 0, 0],
      cptKey: '',
      selectedDOMMarkId: '', // 当前选中的DOMMarkId
      selectedSpriteMarkId: '', // 当前选中的SpriteMarkId
      needConfirmRemove: {
        dom: true,
        sprite: true
      },
      needConfirmEdit: {
        dom: true,
        sprite: true
      },
      detailModal: {
        visible: false,
        data: {}
      },
      updateMarkObj: {
        isEdit: false, // 是否有标注在编辑中
        data: {} // 当前选中标注信息
      }
    };
    this.markComRef = React.createRef();

    this.viewerEvent = this.props.BIMWINNER.BOS3D.EVENTS;
    // 颜色拾取器实例
    this.minWidth = this.props.viewer.viewerImpl.domElement.clientWidth < 760 ? 240 : 355;
    this.clickDOMMarkTime = 0; // 用于记录双击点击时间
    this.isAddingMark = false; // 记录是否在添加标签的状态，只有不在的时候才开启添加功能
    this.clickModelListener = this.clickModelListener.bind(this);
    this.escListener = this.escListener.bind(this);
    this.clickModelGlobalListener = this.clickModelGlobalListener.bind(this);
  }

  componentDidMount() {
    // 全局模型事件回调
    this.props.viewer.registerModelEventListener(
      this.viewerEvent.ON_CLICK_PICK,
      this.clickModelGlobalListener
    );
    this.props.eventEmitter.on(EVENT.userAddMark, mark => {
      this._addMark(mark);
      if (mark.type === 'dom') {
        this.addClickDOMMarkListener(mark.id);
      }
    });
    this.props.eventEmitter.on(EVENT.userDeleteMark, (type, id) => {
      this._removeMark(type, id);
    });
    this.props.eventEmitter.on(EVENT.userUpdateMark, (type, id, obj) => {
      this._updateMark({
        ...obj,
        type,
        id
      });
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const { modalVisible } = this.state;
    if (!prevState.modalVisible && modalVisible) {
      document.addEventListener('keydown', ev => {
        if (ev.key === 'Delete') {
          if (this.state.curMarkType === 'dom' && this.state.selectedDOMMarkId) {
            this.removeMark('dom', this.state.selectedDOMMarkId);
          }
          if (this.state.curMarkType === 'sprite' && this.state.selectedSpriteMarkId) {
            this.removeMark('sprite', this.state.selectedSpriteMarkId);
          }
        }
      });
    }
    if (prevState.modalVisible && !this.state.modalVisible) {
      this.quitAddingMark();
    }
    if (prevProps.mode !== this.props.mode && this.props.mode === "漫游模式") {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        modalVisible: false,
      });
    }
  }

  componentWillUnmount() {
    this.props.viewer.unregisterModelEventListener(
      this.viewerEvent.ON_CLICK_PICK,
      this.clickModelGlobalListener
    );
  }

  calImageSize(viewer, componentId) {
    const box = this.props.viewer.viewerImpl.getBoundingBoxByIds([componentId]);
    return box.max.distanceTo(box.min) / 10;
  }

  // 监听全局点击全局事件
  clickModelGlobalListener(e) {
    if (performance.now() - this.clickDOMMarkTime > 300 && e.intersectInfo) {
      try {
        const { selectedObjectId, object = {} } = e.intersectInfo;
        if (object.type === "Sprite" && selectedObjectId) {
          const atIndex = this.state.sprite.findIndex(item => item.id === selectedObjectId);
          if (atIndex > -1) {
            this.undoMarkInfo('sprite', atIndex, false);
          }
        }
      } catch (error) {
        console.warn('标签的全局点击事件报错：', error);
      }
    }
  }

  clickModelListener(e) {
    this.getCptInfo(e);
    if (e.intersectInfo) {
      this.addMark();
      this.quitAddingMark();
      this.resetMarkForm();
    }
  }

  escListener(ev) {
    if (ev.key === 'Escape') {
      this.quitAddingMark();
    }
  }

  getCptInfo(e) {
    const info = e.intersectInfo;
    if (info) {
      const point = info.point.clone();
      this.setState({
        startPosition: [point.x, point.y, point.z],
        cptKey: info.selectedObjectId,
      });
    }
  }

  setColor = (color) => {
    const value = parseInt(color.hex.substring(1), 16);
    this.setState({
      domColor: value,
      domOpacity: color.alpha * 255,
    });
  }

  genMark() {
    const subFormInstance = this.markComRef.current.formRef.current;
    const err = {
      type: 'error'
    };
    // 检查起点
    if (this.state.cptKey.length === 0) {
      toastr.error("请选择起点", "", {
        target: `#${this.props.viewer.viewport}`
      });
      return err;
    }

    const comment = subFormInstance.state.comment;

    if (this.state.curMarkType === 'dom') {
      const title = subFormInstance.state.title || genDomTitle();
      const id = generateUUID();
      const sp2d = this.props.viewer.getScreenCoordFromSceneCoord(this.state.startPosition);
      const endPosition = [
        sp2d[0] + TEXT_X_OFFSET,
        sp2d[1] + TEXT_Y_OFFSET,
      ];
      return {
        type: 'dom',
        title,
        id,
        componentId: this.state.cptKey,
        color: [
          (this.state.domColor & 0xff0000) >> 16,
          (this.state.domColor & 0xff00) >> 8,
          this.state.domColor & 0xff,
          this.state.domOpacity / 255,
        ],
        colorLine: [204, 204, 204],
        startPosition: [...this.state.startPosition],
        endPosition,
        draggable: true,
        utime: new Date().getTime(),
        comment,
      };
    } else {
      const title = subFormInstance.state.title || genSpriteTitle();
      const scale = subFormInstance.state.scale ? parseFloat(subFormInstance.state.scale) : 1;
      const id = generateUUID();
      const imageSize = this.calImageSize(this.viewer, this.state.cptKey);
      return {
        type: 'sprite',
        title,
        id,
        position: [...this.state.startPosition],
        url: subFormInstance.state.url,
        scale,
        width: imageSize,
        height: imageSize,
        useImageSize: false,
        alwaysVisible: true, // TODO: 这是什么
        componentId: this.state.cptKey,
        comment,
        utime: new Date().getTime(),
      };
    }
  }

  genDOMThumbnail(props, cb) {
    const { endPosition, id } = props;
    const { viewer } = this.props;
    const HIGH_LIGHT_KEYS = viewer.getHighlightComponentsKey();
    viewer.clearHighlightList();

    // 先强制更新模型状态，再截图
    viewer.getViewerImpl()._render();
    // 1. convert model canvas to img
    const canvas = viewer.viewportDiv.querySelector('canvas');
    const img = document.createElement('img');
    img.src = canvas.toDataURL();
    const dpr = window.devicePixelRatio;
    // 需要把endpoint特殊处理，mark的endPosition是个屏幕x，Y轴的坐标，它的一个作用是显示文本标签的文字，请看genMark 关于endpoint部分。此时我们是回归正常的xy轴点。
    // 这样才能正常的截取到中心点位置。具体请打印下日志
    // console.log(endPosition, 'genDOMThumbnail')
    const END_POSITION = [];
    END_POSITION[0] = (endPosition[0] - TEXT_X_OFFSET);
    END_POSITION[1] = (endPosition[1] - TEXT_Y_OFFSET);
    const cropWidth = LINE_OFFSET * 2.1 * dpr;
    const cropHeight = LINE_OFFSET * 1.2 * dpr;
    const cropX = (END_POSITION[0]) * dpr - cropWidth / 2 * dpr;
    const cropY = (END_POSITION[1]) * dpr - cropHeight / 2 * dpr;

    img.onload = () => {
      // 2. crop modelImg
      const modelImg = cropPlusExport(
        img,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
      );
      // 3. copy mark container, reset css and hide it to viewportDiv
      const markContainer = viewer.viewportDiv.querySelector(`#label${id}`).cloneNode(true);
      markContainer.style.position = 'absolute';
      markContainer.style.zIndex = -114514;
      markContainer.style.top = 0;
      markContainer.style.left = 0;
      const { width, height } = getComputedStyle(viewer.viewportDiv);
      const { width: bodyWidth, height: bodyHeight } = getComputedStyle(document.body);
      // 补差计算，当小屏幕时候，view标签跟body的大小不一样，导致view点不是从0,0开始的。所以要减去这个。ps:全屏模式下无此问题，因为两个是相等的
      const difX = parseInt(bodyWidth, 10) - parseInt(width, 10);
      const difY = parseInt(bodyHeight, 10) - parseInt(height, 10);
      markContainer.style.width = width; // Math.max(...[width, bodyWidth]);
      markContainer.style.height = height; //  Math.max(...[height, bodyHeight]);;
      markContainer.id = '';
      viewer.viewportDiv.appendChild(markContainer);
      // 4. merge modelImg and mark
      const img2 = document.createElement('img');
      img2.src = modelImg;
      img2.onload = () => {
        getMarkShot(
          img2,
          markContainer,
          END_POSITION[0] - LINE_OFFSET * 2.1 / 2 + difX / 2,
          END_POSITION[1] - LINE_OFFSET * 1.2 / 2 + difY / 2,
          LINE_OFFSET * 2.1,
          LINE_OFFSET * 1.2,
        )
          .then(rsp => {
            viewer.viewportDiv.removeChild(markContainer);
            viewer.highlightComponentsByKey(HIGH_LIGHT_KEYS);
            if (rsp.code === 'success') {
              cb(rsp.imgURL);
            }
          })
          .catch(err => {
            viewer.viewportDiv.removeChild(markContainer);
            throw new Error(err.msg);
          });
      };
    };
  }

  genSpriteThumbnail(props, cb) {
    const { viewer } = this.props;
    const HIGH_LIGHT_KEYS = viewer.getHighlightComponentsKey();
    viewer.clearHighlightList();

    // 先强制更新模型状态，再截图
    viewer.getViewerImpl()._render();
    // 1. convert model canvas to img
    const canvas = viewer.viewportDiv.querySelector('canvas');
    const img = document.createElement('img');
    img.src = canvas.toDataURL();
    img.onload = () => {
      // 2. crop modelImg
      const pos = viewer.getScreenCoordFromSceneCoord(props.position);
      const dpr = window.devicePixelRatio;
      const modelImg = cropPlusExport(
        img,
        (pos[0] - 85) * dpr,
        (pos[1] - 45) * dpr,
        LINE_OFFSET * 2.1 * dpr,
        LINE_OFFSET * 1.2 * dpr,
      );
      cb(modelImg);
      viewer.highlightComponentsByKey(HIGH_LIGHT_KEYS);
    };
  }

  // 与三维交互用
  _addMark(mark) {
    const type = mark.type;
    if (type === 'dom') {
      this.props.DOMMark.add(mark, id => {
        this.genDOMThumbnail(mark, imgURL => {
          this.setState(state => ({
            [type]: [
              ...state[type],
              {
                ...mark,
                id,
                thumbnail: imgURL
              }
            ]
          }));
        });
      });
    } else {
      this.props.SpriteMark.add(mark, id => {
        this.genSpriteThumbnail(mark, imgURL => {
          this.setState(state => ({
            [type]: [
              ...state[type],
              {
                ...mark,
                id,
                thumbnail: imgURL,
              }
            ]
          }));
        });
      });
    }
  }

  startAddingMark = () => {
    const prevMode = this.props.mode;
    if (prevMode) {
      // 添加标签要取消其他模式，否则会产生无法点击的问题
      this.props.changeMode('');
      setTimeout(() => {
        toastr.info(`添加标签将关闭${prevMode}`, "", {
          target: `#${this.props.viewer.viewport}`
        });
      });
    }
    if (prevMode && this.isAddingMark) {
      this.quitAddingMark();
    }
    if (!this.isAddingMark) {
      this.clearHighLightAndTransparentList();
      this.setState({
        selectedDOMMarkId: '',
        selectedSpriteMarkId: ''
      });
      this.props.viewer.registerModelEventListener(
        this.viewerEvent.ON_CLICK_PICK,
        this.clickModelListener
      );
      document.addEventListener('keydown', this.escListener);
      this.isAddingMark = true;
      window.setTimeout(() => {
        // 关闭其他模式会调用 view.render()，所以可以在两帧动画(32ms)后添加样式。比较安全。
        this.props.viewer.viewportDiv.style.cursor = `url(${redPointPng}) 4 4, pointer`;
        const INFO_MES = `请在模型上的任意位置左键点击以生成标签，按ESC可以取消`;
        toastr.info(INFO_MES, "", {
          target: `#${this.props.viewer.viewport}`
        });
      }, 32);
    }
  }

  quitAddingMark() {
    if (this.isAddingMark) {
      this.props.viewer.unregisterModelEventListener(
        this.viewerEvent.ON_CLICK_PICK,
        this.clickModelListener
      );
      document.removeEventListener('keydown', this.escListener);
      this.props.viewer.viewportDiv.style.cursor = 'auto';
      this.isAddingMark = false;
    }
  }

  addMark() {
    const mark = this.genMark();
    const type = mark.type;
    if (type !== 'error') {
      if (
        !this.props.eventEmitter.emit(EVENT.sysAddMark, type, mark, (state, newMark) => {
          if (state) {
            this._addMark(newMark || mark);
            const _type = newMark ? newMark.type || type : type;
            if (_type === 'dom') {
              this.addClickDOMMarkListener(newMark && newMark.id || mark.id);
            }
          }
        })
      ) {
        this._addMark(mark);
        if (type === 'dom') {
          this.addClickDOMMarkListener(mark.id);
        }
      }
    }
  }

  // 先清除所有焦点 清除所有高亮
  clearHighLightAndTransparentList() {
    this.props.viewer.clearTransparentList();
    this.props.viewer.clearHighlightList();
  }

  addClickDOMMarkListener(id) {
    this.props.DOMMark.addEventListener(id, "click", () => {
      if (performance.now() - this.clickDOMMarkTime < 300) {
        const dommark = this.state.dom.find(mark => mark.id === id);
        if (dommark) {
          // const { viewer } = this.props;
          // viewer.zoomToBox(viewer.getBoxByComponentsKey(dommark.componentId));
          nameEditor.addEditor(id, title => {
            const mark = this.state.dom.find(_mark => _mark.id === id);
            mark.title = title || mark.title;
            if (
              !this.props.eventEmitter.emit(
                EVENT.sysUpdateMark,
                mark.type,
                mark.id,
                mark,
                (state, id2, mark2) => {
                  if (state) {
                    _.assign(mark, mark2 || {});
                    this._updateMark({
                      ...mark,
                      id: id2 || id,
                    });
                  }
                }
              )
            ) {
              this._updateMark(mark);
            }
          });
        }
      } else {
        this.clickDOMMarkTime = performance.now();
        let index = 0;
        this.state.dom.find((mark, index1) => {
          if (mark.id === id) {
            index = index1;
            return true;
          }
          return false;
        });
        this.undoMarkInfo('dom', index, false);
      }
    });
  }

  _updateMark(mark, isUpdateView = false) {
    // sprite是异步添加，需要把添加成功后执行的方法包装一下
    const callback = () => {
      const marks = _.cloneDeep(mark.type === 'dom' ? this.state.dom : this.state.sprite);
      if (!isUpdateView) {
        // 不需要更新视图，即更新截图，只要更新文本列表
        marks.some((_mark, index) => {
          if (_mark.id === mark.id) {
            _.assign(marks[index], mark);
            return true;
          }
          return false;
        });
        this.setState({
          [mark.type]: marks
        });
        return;
      }
      // 决定用哪个方法生成截图
      let genThumbnail = this.genDOMThumbnail.bind(this);
      if (mark.type === 'sprite') {
        genThumbnail = this.genSpriteThumbnail.bind(this);
      }
      // 截图是异步的，必须先生成截图，再更新状态
      genThumbnail(mark, imgURL => {
        const found = marks.some((_mark, index) => {
          if (_mark.id === mark.id) {
            _.assign(marks[index], mark, {
              thumbnail: imgURL,
            });
            return true;
          }
          return false;
        });
        if (found) {
          this.setState({
            [mark.type]: marks
          });
        }
      });
    };

    if (mark.type === 'dom') {
      this.props.DOMMark.updateMark(mark.id, mark);
      callback();
    }
    if (mark.type === 'sprite') {
      this.props.SpriteMark.updateMark(mark.id, mark, () => callback());
    }
  }

  editMark(type, id) {
    if (type !== this.state.curMarkType) {
      toastr.info(`请将标签类型切换为${type === 'dom' ? '文字标签' : '精灵标签'}`, "", {
        target: `#${this.props.viewer.viewport}`
      });
      return;
    }
    const mark = this.genMark();
    mark.id = id;
    // return
    if (mark.type !== 'error') {
      if (
        !this.props.eventEmitter.emit(
          EVENT.sysUpdateMark,
          mark.type,
          mark.id,
          mark,
          (state, id2, mark2) => {
            if (state) {
              _.assign(mark, mark2 || {});
              this._updateMark({
                ...mark,
                id: id2 || id,
              });
            }
          }
        )
      ) {
        this._updateMark(mark);
      }
    }
  }

  _removeMark(type, id) {
    const marks = _.cloneDeep(type === 'dom' ? this.state.dom : this.state.sprite);
    marks.some((mark, index) => {
      if (mark.id === id) {
        marks.splice(index, 1);
        if (type === 'dom') {
          this.props.DOMMark.remove([id]);
        } else {
          this.props.SpriteMark.remove([id]);
        }
        this.clearHighLightAndTransparentList();
        this.setState({
          [type]: marks
        });
        return true;
      }
      return false;
    });
  }

  removeMark(type, id) {
    if (
      !this.props.eventEmitter.emit(EVENT.sysDeleteMark, type, id, state => {
        if (state) {
          const { selectedDOMMarkId, selectedSpriteMarkId } = this.state;
          this._removeMark(type, id);
          if (type === 'dom' && id === selectedDOMMarkId) {
            this.setState({
              selectedDOMMarkId: '',
            });
          }
          if (type === 'sprite' && id === selectedSpriteMarkId) {
            this.setState({
              selectedSpriteMarkId: '',
            });
          }
        }
      })
    ) {
      this._removeMark(type, id);
      const { selectedDOMMarkId, selectedSpriteMarkId } = this.state;
      if (type === 'dom' && id === selectedDOMMarkId) {
        this.setState({
          selectedDOMMarkId: '',
        });
      }
      if (type === 'sprite' && id === selectedSpriteMarkId) {
        this.setState({
          selectedSpriteMarkId: '',
        });
      }
      this.resetMarkForm();
      this.quiteEditingMark();
    }
  }

  undoMarkInfo(type, index, refreshMarkForm = true) {
    const subFormInstance = this.markComRef.current.formRef.current;
    if (type === 'dom') {
      this.setState(state => ({
        curMarkType: 'dom',
        cptKey: state.dom[index].componentId,
        startPosition: state.dom[index].startPosition,
        domColor: (state.dom[index].color[0] << 16)
          | (state.dom[index].color[1] << 8)
          | (state.dom[index].color[2]),
        domOpacity: Math.round(state.dom[index].color[3] * 255),
        selectedDOMMarkId: state.dom[index].id,
        selectedSpriteMarkId: '',
      }), () => {
        if (refreshMarkForm) {
          subFormInstance.setState({
            title: this.state.dom[index].title,
            comment: this.state.dom[index].comment
          });
        }
      });
    }
    if (type === 'sprite') {
      this.setState(state => ({
        curMarkType: 'sprite',
        startPosition: state.sprite[index].position,
        cptKey: state.sprite[index].componentId,
        selectedDOMMarkId: '',
        selectedSpriteMarkId: state.sprite[index].id,
      }), () => {
        if (refreshMarkForm) {
          subFormInstance.setState({
            title: this.state.sprite[index].title,
            comment: this.state.sprite[index].comment,
            url: this.state.sprite[index].url,
            scale: this.state.sprite[index].scale
          });
        }
      });
    }
  }

  changeCurMarkType = (markType) => {
    const cb = () => {
      this.onChangeDetailModal(false);
      this.clearHighLightAndTransparentList();
      this.resetMarkForm();
      this.quiteEditingMark();
      this.setState({
        curMarkType: markType,
        selectedDOMMarkId: '',
        selectedSpriteMarkId: ''
      });
    };
    const isNeedSave = this.judgeNeedSaveData(cb);
    if (!isNeedSave) {
      cb();
    }
  }

  // 查看详情弹窗
  onChangeDetailModal = (visible, mark = {}) => {
    this.setState({
      detailModal: {
        visible,
        data: mark
      }
    });
  }

  // 取消编辑状态
  quiteEditingMark = () => {
    this.setState({
      updateMarkObj: {
        isEdit: false,
        data: {}
      }
    });
  }

  //
  /**
   *
   * @param {*} mark
   * @param {*} index
   * @param {*} needToggleFocus  开始进入编辑状态 注意参数 needToggleFocus 是否需要切换focus状态，切换聚焦的状态
   * @returns
   */
  startEditMarkStatus = (mark, index, needToggleFocus = true) => {
    // const { selectedDOMMarkId, selectedSpriteMarkId, updateMarkObj } = this.state;
    if (!needToggleFocus) {
      // 某个状态即当前点击的标签卡片已经是聚焦，这个时候又点击编辑按钮，此时应该是聚焦不变只是只是转换成编辑状态
      this.quitAddingMark();
      this.undoMarkInfo(mark.type, index);
      this.setState({
        updateMarkObj: {
          isEdit: true,
          data: mark
        }
      });
      return;
    }
    // if ((mark.id === selectedDOMMarkId || mark.id === selectedSpriteMarkId)) {
    // 点击同一个点击是否要退出
    //   this.quiteEditingMark()
    //   this.resetMarkForm()
    //   return
    // }
    this.quitAddingMark();
    this.undoMarkInfo(mark.type, index);
    this.setState({
      updateMarkObj: {
        isEdit: true,
        data: mark
      }
    });
  }

  // 点击完成编辑
  confirmUpdateBaseInfo = () => {
    const { updateMarkObj } = this.state;
    const mark = updateMarkObj.data;
    this.editMark(mark.type, mark.id);
    toastr.success("标签修改成功！", "", {
      target: `#${this.props.viewer.viewport}`
    });
    this.setState({
      selectedDOMMarkId: '',
      selectedSpriteMarkId: ''
    });
    this.clearHighLightAndTransparentList();
    this.resetMarkForm();
    this.quiteEditingMark();
  }

  // 退出编辑
  exitEdit = () => {
    this.clearHighLightAndTransparentList();
    this.resetMarkForm();
    this.quiteEditingMark();
  }

  updateView = (mark) => {
    // 更新视图。第一步需要获取该标准的原始其实坐标，然后转换成endpostion。因为每次放大缩小的时候，endpoision都不一样。但是 startPosition 跟 startPosition 是固定的
    const originPosition = mark.type === 'dom' ? mark.startPosition : mark.position;
    const sp2d = this.props.viewer.getScreenCoordFromSceneCoord(originPosition);
    const endPosition = [
      sp2d[0] + TEXT_X_OFFSET,
      sp2d[1] + TEXT_Y_OFFSET,
    ];
    mark.endPosition = endPosition;
    mark.utime = Date.now();
    this._updateMark(mark, true);
  }

  resetMarkForm() {
    // this.setState({
    //   domColor: DOM_COLOR,
    //   domOpacity: 255,
    // });
    const subFormInstance = this.markComRef.current.formRef.current;
    subFormInstance.reset();
  }

  // 点击某个mark
  selectMark = (mark = {}) => {
    let selectedDOMMarkId = ''; let
      selectedSpriteMarkId = '';
    if (mark.type) {
      if (mark.type === 'dom') {
        selectedDOMMarkId = mark.id;
        selectedSpriteMarkId = '';
      } else {
        selectedDOMMarkId = '';
        selectedSpriteMarkId = mark.id;
      }
    }
    this.setState({
      selectedDOMMarkId, selectedSpriteMarkId
    });
  }

  onCancelMarkModal = () => {
    const cb = () => {
      this.onChangeDetailModal(false);
      this.setState({
        // selectedDOMMarkId: '',
        // selectedSpriteMarkId: '',
        modalVisible: false,
      });
    };
    const isNeedSave = this.judgeNeedSaveData(cb);
    if (!isNeedSave) {
      cb();
    }
  }

  // 判断是否有为保存的数据
  // eslint-disable-next-line consistent-return
  judgeNeedSaveData(cb) {
    const { updateMarkObj } = this.state;
    const That = this;
    if (updateMarkObj.isEdit) {
      AntdModal.confirm({
        className: style.antdConfirmModalThemeOne,
        getContainer: () => That.props.viewer.viewportDiv,
        title: '提示',
        content: '存在未保存的数据，是否保存？',
        onOk() {
          return new Promise((resolve, reject) => {
            That.confirmUpdateBaseInfo();
            reject();
          }).catch(() => { });
        },
        onCancel() {
          That.quiteEditingMark();
          if (typeof cb === "function") {
            cb();
          }
        },
        cancelText: '不保存',
        okText: '保存'
      });
      return true;
    }
  }

  // 纯方法，直接用来改变原始数据用的，不需要更新视频生成标签等等操作。
  changeDataSource = (index, mark, type) => {
    const { dom, sprite } = this.state;
    const marks = _.cloneDeep(type === 'dom' ? dom : sprite);
    marks[index] = mark;
    this.setState({
      [type]: marks
    });
  }

  render() {
    const {
      updateMarkObj,
      selectedDOMMarkId,
      selectedSpriteMarkId,
      curMarkType,
      needConfirmRemove,
      needConfirmEdit
    } = this.state;

    return (
      <div
        title="标签"
        role="button"
        tabIndex={0}
        onClick={() => {
          this.setState(state => ({
            modalVisible: !state.modalVisible,
          }));
        }}
      >
        {/* <Icon
          img={markPng}
          selected={this.state.modalVisible}
        /> */}
        <Icon
          icon={<AntdIcon type="iconlabel" className={iconstyle.icon} />}
          title="标签"
          selected={this.state.modalVisible}

        />
        <Modal
          onCancel={this.onCancelMarkModal}
          visible={this.state.modalVisible}
          title="标签"
          width={`${this.minWidth}px`}
          height="70%"
          minWidth={this.minWidth}
          minHeight={260}
          top={DEFAULT_MODAL_PLACE.mark.top}
          right={DEFAULT_MODAL_PLACE.mark.right}
          viewportDiv={this.props.viewer.viewportDiv}
        >
          <section className={style.container}>
            <MarkMgr
              curMarkType={curMarkType}
              changeCurMarkType={this.changeCurMarkType}
              ref={this.markComRef}
              viewer={this.props.viewer}
              domColor={this.state.domColor}
              domOpacity={this.state.domOpacity}
              BIMWINNER={this.props.BIMWINNER}
              DOMMark={this.props.DOMMark}
              SpriteMark={this.props.SpriteMark}
              eventEmitter={this.props.eventEmitter}
              mode={this.props.mode}
              setColor={this.setColor}
              isEdit={updateMarkObj.isEdit}
              startAddingMark={this.startAddingMark}
              confirmUpdateBaseInfo={this.confirmUpdateBaseInfo}
              exitEdit={this.exitEdit}
            />

            <MarkCardList
              curMarkType={curMarkType}
              dom={this.state.dom}
              sprite={this.state.sprite}
              selectMark={this.selectMark}
              selectedMarkId={selectedDOMMarkId || selectedSpriteMarkId}
              onRemove={(mark) => { this.removeMark(mark.type, mark.id) }}
              viewer={this.props.viewer}
              BIMWINNER={this.props.BIMWINNER}
              DOMMark={this.props.DOMMark}
              SpriteMark={this.props.SpriteMark}
              needConfirmRemove={this.state.needConfirmRemove}
              needConfirmEdit={this.state.needConfirmEdit}
              isEdit={updateMarkObj.isEdit}
              quiteEditingMark={this.quiteEditingMark}
              onNeverConfirm={(type, markType) => {
                if (type === 'remove') {
                  const _tempObj = needConfirmRemove;
                  _tempObj[markType] = false;
                  this.setState({
                    needConfirmRemove: _tempObj,
                  });
                } else {
                  const _tempObj = needConfirmEdit;
                  _tempObj[markType] = false;
                  this.setState({
                    needConfirmEdit: _tempObj,
                  });
                }
              }}
              onChangeDetailModal={this.onChangeDetailModal}
              updateBaseInfo={this.startEditMarkStatus}
              updateView={this.updateView}
              changeDataSource={this.changeDataSource}
            />

          </section>
        </Modal>

        <DetailCom
          onCancel={() => { this.onChangeDetailModal(false) }}
          viewer={this.props.viewer}
          data={this.state.detailModal.data}
          visible={this.state.detailModal.visible}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  viewer: state.system.viewer3D,
  BIMWINNER: state.system.BIMWINNER,
  DOMMark: state.system.DOMMark,
  SpriteMark: state.system.SpriteMark,
  eventEmitter: state.system.eventEmitter,
  mode: state.button.mode,
});

const mapDispatchToProps = (dispatch) => ({
  changeMode: mode => {
    dispatch(changeMode(mode));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Mark);
