import React from "react";
import PropTypes from "prop-types";
import Modal from "Base/Modal";
import { Button } from 'antd';
import FrameItem from "./FrameItem";
import style from "./frameEditor.less";
import redoImg from "../../img/redo.png";
import undoImg from "../../img/undo.png";

class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      enableEditNum: true,
      frameList: this.getFrameList(),
    };
    props.editor.onUserDrag = this.onDrag.bind(this);
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   return nextProps.title !== this.props.title || !_.isEqual(nextState, this.state);
  // }

  onAddFrame() {
    this.setState({
      enableEditNum: false,
    });
    this.props.changeMouseIcon("路径漫游添加帧");
    this.props.editor.addCube(() => {
      this.props.changeMouseIcon("");
      this.setState({
        enableEditNum: true,
        frameList: this.getFrameList(),
      });
    });
  }

  onRemoveFrame(index) {
    this.setState({
      enableEditNum: false,
    });
    this.props.editor.rmCube(index, () => {
      this.setState({
        enableEditNum: true,
        frameList: this.getFrameList(),
      });
    });
  }

  /**
   * 通过帧编辑对象获取视角间的帧列表
   */
  getFrameList() {
    return this.props.editor.getList();
  }

  onDrag() {
    this.setState({
      frameList: this.getFrameList(),
    });
  }

  onReset() {
    if (this.state.frameList.length > 0) {
      this.props.editor.reset();
      this.props.onSave(this.props.editor.getCurve());
      this.setState({
        frameList: [],
      });
      // this.props.updatePerspectiveList();
    }
  }

  onEditCoord(key, coord) {
    this.props.editor.updateCubePosition(key, coord);
    // 由于bug#9783，三维的矩阵运算存在精度不够的问题，因此更新坐标直接填入state，而不是重新获取真实坐标
    // 防止坐标小数部分变化导致整个输入框变化，进而引起光标位置异常变化
    this.setState(state => {
      const list = state.frameList;
      list.some((item, i) => {
        if (item.key === key) {
          list[i].position = [...coord];
          return true;
        }
        return false;
      });
      return {
        ...state,
        frameList: list,
      };
    });
  }

  onUndo() {
    this.props.editor.undo();
    this.setState({
      frameList: this.getFrameList(),
    });
  }

  onRedo() {
    this.props.editor.redo();
    this.setState({
      frameList: this.getFrameList(),
    });
  }

  render() {
    // 获取偏移量
    const frameList = [];
    this.state.frameList.forEach((item, index) => {
      frameList.push(
        <FrameItem
          key={item.key}
          name={`帧${index + 1}`}
          coord={item.position}
          onEdit={coord => this.onEditCoord(item.key, coord)}
          onRemove={() => this.onRemoveFrame(index)}
          onPreview={() => this.props.editor.preview(index)}
        />
      );
    });
    const canUndo = this.props.editor.canUndo();
    const canRedo = this.props.editor.canRedo();

    // 获取漫游Modal, 计算弹框初始位置。
    const roamDom = document.querySelector("#roamDom");
    const top = roamDom.offsetTop;
    const { right, width } = roamDom.getBoundingClientRect();
    const viewportDivWidth = parseFloat(getComputedStyle(this.props.viewer.viewportDiv).width);

    return (
      <Modal
        visible
        onCancel={
          () => this.props.onClose()
        }
        title={this.props.title}
        width="350px"
        height="623px"
        top={`${top}px`}
        right={`${viewportDivWidth - right + width - 1}px`}
        minWidth={350}
        minHeight={500}
        viewportDiv={this.props.viewer.viewportDiv}
        id="editorModal"
      >
        <div className={style.content}>
          <button
            type="button"
            className={`${style.addFrame} ${this.state.enableEditNum ? '' : style.disabled}`}
            onClick={() => this.onAddFrame()}
          >
            +&nbsp;&nbsp;添加帧
          </button>
          <div className={style.frameListTitle}>帧列表</div>
          <div className={style.frameListContainer}>
            {frameList}
          </div>
        </div>

        {/*  */}
        <div className={style.footer}>
          <div>
            <div
              className={`${style.smallBtn} ${canUndo ? '' : style.disabled}`}
              role="button"
              tabIndex={-1}
              onClick={() => this.onUndo()}
            >
              <img alt="撤销" title="撤销" src={undoImg} />
            </div>
            <div
              className={`${style.smallBtn} ${canRedo ? '' : style.disabled}`}
              role="button"
              tabIndex={-1}
              onClick={() => this.onRedo()}
            >
              <img alt="恢复" title="恢复" src={redoImg} />
            </div>
          </div>
          <div>
            <Button
              className={`${frameList.length === 0 ? style.disabled : ''}`}
              style={{ backgroundColor: '#666' }}
              onClick={() => this.onReset()}
            >
              重置
            </Button>
            <Button type="primary" onClick={() => this.props.onSave(this.props.editor.getCurve())}>
              保存
            </Button>
          </div>
        </div>
        {/* </div> */}
      </Modal>

    );
  }
}

Editor.propTypes = {
  editor: PropTypes.object.isRequired,
  title: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  // isViewManager: PropTypes.bool,
  // updatePerspectiveList: PropTypes.func.isRequired,
  viewer: PropTypes.object.isRequired,
  changeMouseIcon: PropTypes.func.isRequired,
};

Editor.defaultProps = {
  title: '帧编辑',
  // isViewManager: false,
};

export default Editor;
