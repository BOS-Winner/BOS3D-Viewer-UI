import React from 'react';
import PropTypes from 'prop-types';
import { Menu, Dropdown } from 'antd';
import CustomConfirm from 'Base/CustomConfirm';
import CoordEditor from "./CoordEditor";
import Modal from '../../../Base/Modal';
import Rename from './rename';
import style from "./style.less";
import toastr from "../../../toastr";
import { AntdIcon } from '../../../utils/utils';

class PerspectiveItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showCoordEditor: false,
      coord: this.getCurrentWorldCoord(),
      reNameVisible: false,
      isEditFrame: false,
    };
  }

  // 获取当前帧的坐标
  getCurrentWorldCoord() {
    const coord = this.props.perspective.position;
    return [Math.round(coord.x), Math.round(coord.y), Math.round(coord.z)];
  }

  // 切换显示编辑视角坐标
  onSwitchShowEditor() {
    if (!this.props.enableOpt) return;
    this.setState(state => {
      if (state.showCoordEditor) {
        return {
          showCoordEditor: false,
        };
      } else {
        return {
          showCoordEditor: true,
          coord: this.getCurrentWorldCoord(),
        };
      }
    });
  }

  onChange(coord) {
    // 更新视角坐标
    this.props.perspective.editPerspectiveCoord(coord);
    this.setState({
      coord
    });
  }

  // 开始拖动
  dragStart = ev => {
    if (!this.dragAble()) return;
    const el = ev.currentTarget;
    el.style = "opacity: 0.1";
    window.currentIndex = Number(el.getAttribute("data-index"));
    ev.dataTransfer.setData("text/html", "我就试试");
    ev.dataTransfer.dropEffect = "move";
    toastr.info('排序后会删除帧编辑信息，请谨慎操作！', '', {
      target: `#${this.props.viewer.viewport}`,
    });
  }

  // 结束拖拽
  dragEnd = ev => {
    if (!this.dragAble()) return;
    ev.preventDefault();
    const el = ev.currentTarget;
    el.style = "opacity: 1";
  }

  dragEnter = ev => {
    if (!this.dragAble()) return;
    ev.preventDefault();
    const el = ev.currentTarget;
    // 获取target的index；
    const index = Number(el.getAttribute("data-index"));
    // 横线样式
    if (window.currentIndex < index) {
      el.classList.add(`${style.after}`);
    } else if (window.currentIndex > index) {
      el.classList.add(`${style.before}`);
    }
  }

  // 进入一个可释放的区域
  dragOver = ev => {
    if (!this.dragAble()) return;

    ev.preventDefault();
    ev.dataTransfer.dropEffect = "move";
  }

  dragLeave = ev => {
    if (!this.dragAble()) return;
    ev.preventDefault();

    const el = ev.currentTarget;
    const index = Number(el.getAttribute("data-index"));
    if (window.currentIndex < index) {
      el.classList.remove(`${style.after}`);
    } else if (window.currentIndex > index) {
      el.classList.remove(`${style.before}`);
    }
  }

  // 释放
  drop = ev => {
    if (!this.dragAble()) return;
    const { updatePerspectiveList, data, perspList } = this.props;
    ev.preventDefault();
    const el = ev.currentTarget;
    const index = Number(el.getAttribute("data-index"));
    const tempData = data;
    // 去除样式
    el.classList.remove(`${style.before}`, `${style.after}`);
    // 排序逻辑
    if (window.currentIndex < index) {
      tempData.splice(index + 1, 0, tempData[window.currentIndex]);
      tempData.splice(window.currentIndex, 1);
    }
    if (window.currentIndex > index) {
      tempData.splice(index, 0, tempData[window.currentIndex]);
      tempData.splice(window.currentIndex + 1, 1);
    }

    tempData.forEach(item => {
      item.editor = null;
      item.frameList = null;
    });
    perspList.resetPerspectiveListOrder(tempData);
    updatePerspectiveList();
  }

  // 判断当前视角的插入帧帧是否存在
  frameExist = index => {
    const { data } = this.props;
    if (
      data[index].editor || (
        data[index + 1] && data[index + 1].editor
      )
    ) {
      return true;
    }
    return false;
  }

  /**
   * 插入视角
   * @param {number}} order 在视角前还是后插入，0:前，1:后
   */
  insertView = (order) => {
    const {
      index, updatePerspectiveList, perspList
    } = this.props;

    // 判断当前视角和下一个视角是否存在帧编辑数据
    const exist = perspList.existEditFrameData(index, order);

    if (exist) {
      CustomConfirm({
        title: '请确认',
        message: "插入新视角会清空视角间已添加的帧，是否继续？",
        viewportDiv: document.getElementById('roam'),
        okFunc: () => {
          perspList.insertPerspective(index, order);
          // 保存视角
          updatePerspectiveList();
        }
      });
    } else {
      perspList.insertPerspective(index, order);
      // 保存视角
      updatePerspectiveList();
    }
  }

  /**
     * 清除当前帧的帧编辑器和插入的帧列表
     * @param {number} index 清除当前帧的帧编辑器和插入的帧列表的索引
     * @param {array} perspList 当前所有视角
     * @returns {array} perspList 返回清空插入帧的视角列表
     */
   _clearFrameEditorAndFrameList = (index, perspList) => {
     // 如果当前帧存在
     if (perspList[index]) {
       perspList[index].editor = null;
       perspList[index].frameList = null;
     }
     return perspList;
   }

  // rename
  handleReName = () => {
    const { reNameVisible } = this.state;
    this.setState({
      reNameVisible: !reNameVisible,
    });
  }

  /**
   * 帧编辑功能
   */
  handleEditFrame = () => {
    const { onEditFrame } = this.props;
    this.setState({
      isEditFrame: true
    });
    onEditFrame();
  }

  /**
   * 获取拖动状态
   */
  dragAble = () => {
    const { draggable, enableOpt } = this.props;
    const { showCoordEditor, isEditFrame } = this.state;
    return draggable && enableOpt && !showCoordEditor && !isEditFrame;
  }

  /**
   * 激活更多按钮
   */
   moreActive = e => {
     const { id } = this.props;
     if (e) {
       this.props.handleCurrentPersp(id);
     }
   }

   render() {
     const {
       showCoordEditor, coord, reNameVisible
     } = this.state;
     const {
       perspectiveItemActive, id, enableOpt, index, data, perspective, perspList
     } = this.props;
     const menu = (
       <Menu className={style.insertContainer} style={{ background: '#1b1b1b' }}>
         <Menu.Item>
           <div tabIndex={0} role="button" onClick={() => this.insertView(0)}>在该视角前插入新的视角</div>
         </Menu.Item>
         <Menu.Item>
           <div tabIndex={0} role="button" onClick={() => this.insertView(1)}>在该视角后插入新的视角</div>
         </Menu.Item>
       </Menu>
     );
     return (
       <div
         className={perspectiveItemActive === id ? `${style.perspItem} ${style.perspItemActive}` : `${style.perspItem}`}
         draggable={this.dragAble()}
         onDragStart={this.dragStart}
         onDragEnd={this.dragEnd}
         onDragEnter={this.dragEnter}
         onDragOver={this.dragOver}
         onDragLeave={this.dragLeave}
         onDrop={this.drop}
         data-index={this.props.index}
         ref={this.container}
         role="table"
         onClick={() => this.props.handleCurrentPersp(id)}
       >
         <div className={style.perspTools}>
           <div>
             <AntdIcon title="拖拽" type="iconmove" className={!this.dragAble() ? `${style.perspToolIcon} ${style.perspToolIconDragForbiden}` : `${style.perspToolIcon} ${style.perspToolIconDrag}`} />
             <span title={this.props.name} className={style.perspName}>{this.props.name}</span>
             <AntdIcon title="编辑" type="iconedit" className={style.perspToolIcon} onClick={this.handleReName} />
             <Modal
               visible={reNameVisible}
               title="重命名"
               onCancel={() => this.setState({ reNameVisible: false })}
               top="30%"
               width="354px"
               height="213px"
               allowDrag
               viewportDiv={document.querySelector('#roamDom')}
               destroyOnClose
             >
               <Rename
                 name={this.props.name}
                 setData={(name) => {
                   perspective.rename(name);
                   this.props.updatePerspectiveList(data);
                 }}
                 cancel={() => this.setState({ reNameVisible: false })}
                 okAfterCancel={() => this.setState({ reNameVisible: false })}
               />
             </Modal>
           </div>
           <div>
             {this.props.onEditFrame && (
               <AntdIcon
                 type="iconframeediting"
                 className={style.perspToolFuncIcon}
                 title="帧编辑"
                 onClick={() => this.props.onEditFrame()}
               />
             )}
             {!!this.props.index && (
               <AntdIcon
                 type="iconplay"
                 className={style.perspToolFuncIcon}
                 title="播放"
                 onClick={() => perspList.onPlay(index)}
               />
             )}
             <AntdIcon
               type="iconfocusing1"
               className={style.perspToolFuncIcon}
               title="查看"
               onClick={() => perspective.focus()}
             />
             <AntdIcon
               type="iconicon_edit"
               className={this.props.enableOpt ? style.perspToolFuncIcon : style.disabled}
               title="编辑"
               onClick={() => this.props.enableOpt && this.onSwitchShowEditor()}
             />
             <AntdIcon
               type="iconswitch"
               className={this.props.enableOpt ? style.perspToolFuncIcon : style.disabled}
               title="更新"
               onClick={() => this.props.onChangePersp(
                 () => this.props.perspective.updatePosition())}
             />
             <AntdIcon
               type="icondelete"
               className={style.perspToolFuncIcon}
               title="删除"
               onClick={() => this.props.onRemovePersp(index)}
             />
             <Dropdown overlay={menu} placement="bottomRight" disabled={!enableOpt} onVisibleChange={this.moreActive}>
               <AntdIcon
                 type="iconicon_more_1"
                 className={enableOpt ? style.perspToolFuncIcon : style.disabled}
                 title="更多"
               />
             </Dropdown>
           </div>
         </div>
         {showCoordEditor && (
           <div className={style.coordContainer}>
             <CoordEditor coord={coord} onChange={c => this.onChange(c)} />
           </div>
         )}
       </div>
     );
   }
}

PerspectiveItem.propTypes = {
  name: PropTypes.string.isRequired,
  viewer: PropTypes.object.isRequired,
  onChangePersp: PropTypes.func.isRequired,
  onRemovePersp: PropTypes.func.isRequired,
  onPlay: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.oneOf([false]),
  ]),
  enableOpt: PropTypes.bool, // 在帧编辑的情况下禁用一些功能
  onEditFrame: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.oneOf([false]),
  ]),
  draggable: PropTypes.bool.isRequired,
  index: PropTypes.number.isRequired, // 其实就是每个视角的key
  data: PropTypes.array.isRequired,
  perspectiveItemActive: PropTypes.string.isRequired,
  handleCurrentPersp: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  perspective: PropTypes.object.isRequired,
  updatePerspectiveList: PropTypes.func.isRequired,
  perspList: PropTypes.object.isRequired
};

PerspectiveItem.defaultProps = {
  onPlay: false,
  onEditFrame: false,
  enableOpt: true,
};

export default PerspectiveItem;
