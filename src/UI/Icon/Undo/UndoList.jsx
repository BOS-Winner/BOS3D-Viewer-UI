import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import _ from "lodash-es";
import { movePointer } from "../action";
import style from "./style.less";
import Modal from "../../Base/Modal";
import { AntdIcon } from '../../utils/utils';
import Empty from '../../Base/Empty';
import { DEFAULT_MODAL_PLACE } from "../../constant";

class UndoList extends React.PureComponent {
  constructor(props) {
    super(props);
    const viewer3D = this.props.viewer;
    this.viewerFunc = {
      undo: {
        hide: viewer3D.showComponentsByKey.bind(viewer3D),
        isolate: keyObj => {
          viewer3D.resetScene({
            visible: true
          });
          if (keyObj.isolate.length > 0) {
            viewer3D.isolateComponentsByKey(keyObj.isolate);
          }
          viewer3D.hideComponentsByKey(keyObj.hide);
        },
        colorful: viewer3D.closeColorfulComponentsByKey.bind(viewer3D),
        wireframe: viewer3D.closeWireFrameComponentsByKey.bind(viewer3D),
        transparent: viewer3D.clearTransparentList.bind(viewer3D), // 显示所有构件
      },
      redo: {
        hide: viewer3D.hideComponentsByKey.bind(viewer3D),
        isolate: viewer3D.isolateComponentsByKey.bind(viewer3D),
        colorful: viewer3D.colorfulComponentsByKey.bind(viewer3D),
        wireframe: viewer3D.wireFrameComponentsByKey.bind(viewer3D),
        transparent: viewer3D.transparentOtherComponentsByKey.bind(viewer3D)
      }
    };
    this.hotKeyLner = this.hotKeyEvent.bind(this);
  }

  componentDidMount() {
    document.addEventListener("keypress", this.hotKeyLner);
  }

  componentWillUnmount() {
    document.removeEventListener("keypress", this.hotKeyLner);
  }

  hotKeyEvent(ev) {
    const pointer = this.props.pointer;
    if (ev.ctrlKey && ev.key === "z" && pointer > 0) {
      this.undoOrRedo("undo", this.props.pointer - 1, this.props.pointer);
      this.props.movePointer(this.props.pointer - 1);
    }
    if (ev.ctrlKey && ev.key === "Z" && pointer < this.props.history.length) {
      this.undoOrRedo("redo", this.props.pointer, this.props.pointer + 1);
      this.props.movePointer(this.props.pointer + 1);
    }
  }

  onClick(e, key) {
    e.preventDefault();
    e.stopPropagation();
    if (key < this.props.pointer) {
      this.undoOrRedo('undo', key, this.props.pointer);
    } else if (key > this.props.pointer) {
      this.undoOrRedo('redo', this.props.pointer, key);
    }
    this.props.movePointer(key);
  }

  /**
   * 撤销或重做i-j步
   * @desc 包括i不包括j
   * @param {"undo" | "redo"} type - 类型
   * @param {number} i
   * @param {number} j
   */
  undoOrRedo(type, i, j) {
    if (type === 'undo') {
      let hasIsolate = false;
      for (let x = j - 1; x >= i; x--) {
        const item = this.props.history[x];
        if (item.type === 'isolate') {
          hasIsolate = true;
        } else {
          this.viewerFunc['undo'][item.type](item.keys);
        }
      }
      // 撤销隔离需要找到前置操作的所有隔离和隐藏操作，然后使用操作重放
      if (hasIsolate) {
        const keyObj = {
          hide: [],
          isolate: []
        };
        for (let x = i - 1; x >= 0; x--) {
          const item = this.props.history[x];
          if (item.type === 'hide') {
            keyObj.hide.push(...item.keys);
          }
          if (item.type === 'isolate') {
            keyObj.isolate.push(...item.keys);
          }
        }
        keyObj.hide = _.uniq(keyObj.hide);
        keyObj.isolate = _.uniq(keyObj.isolate);
        this.viewerFunc['undo'].isolate(keyObj);
      }
    } else {
      for (let x = i; x < j; x++) {
        const item = this.props.history[x];
        this.viewerFunc['redo'][item.type](item.keys, item.color, item.opacity);
      }
    }
  }

  render() {
    const historyContent = [];
    const dataSource = this.props.history.length > 0 ? this.props.history : [];

    const len = dataSource.length;
    // console.log(this.props.pointer, 'this.props.pointer ')

    for (let i = 0; i < len; i++) {
      historyContent.push(
        <div
          role="button"
          tabIndex={0}
          className={`${style.item} ${i < this.props.pointer ? style.itemVisiable : style.item}`}
          key={i + 1}
          onClick={e => { this.onClick(e, i + 1) }}
        >
          <div className={style.iconWrap}>
            <AntdIcon type={i < this.props.pointer ? 'iconcomponentvisible' : 'iconconceal'} className={style.icon} />
          </div>
          <div className={style.title}>
            {dataSource[i].name}
          </div>
        </div>
      );
    }

    return (
      <Modal
        title="操作历史"
        visible={this.props.visible}
        onCancel={() => this.props.onHide()}
        viewportDiv={this.props.viewer.viewportDiv}
        top={DEFAULT_MODAL_PLACE.undo.top}
        right={DEFAULT_MODAL_PLACE.undo.right}
        left={DEFAULT_MODAL_PLACE.undo.left}

        width="350px"
        height="600px"
        minWidth={200}
        minHeight={400}
      >
        <div className={style.undoContainer}>
          <div className={style.list}>
            {historyContent.length > 0 ? historyContent : (
              <Empty>
                <div>暂无操作记录</div>
              </Empty>
            )}
          </div>
          <div className={style.footer}>
            <div className={style.line} />
            <button
              type="button"
              className="bos-btn bos-btn-primary bos-btn-block"
              onClick={e => { this.onClick(e, 0) }}
            >
              撤销列表操作
            </button>
          </div>
        </div>

      </Modal>
    );
  }
}

UndoList.propTypes = {
  pointer: PropTypes.number.isRequired,
  history: PropTypes.arrayOf(PropTypes.object).isRequired,
  movePointer: PropTypes.func.isRequired,
  viewer: PropTypes.object.isRequired,
  visible: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  pointer: state.button.pointer,
  history: state.button.history,
  viewer: state.system.viewer3D,
});
const mapDispatchToProps = (dispatch) => ({
  movePointer: pointer => { dispatch(movePointer((pointer))) }
});
const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(UndoList);

export default WrappedContainer;
