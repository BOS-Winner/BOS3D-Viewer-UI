import React from "react";
import PropTypes from "prop-types";
import * as THREE from "THREE";
import generateUUID from "../../../utils/generateUUID";
import { dateToString, AntdIcon } from "../../../utils/utils";
import toastr from "../../../toastr";
import Confirm from "../../../Base/SmallConfirm";
import style from "./markItem.less";

class MarkItem extends React.Component {
  constructor(props) {
    super(props);
    this.viewerEvents = this.props.BIMWINNER.BOS3D.EVENTS;
    this.state = {
      focus: false,
      tipType: ''
    };
  }

  toggleShowMark(e) {
    e.preventDefault();
    e.stopPropagation();
    const { curMarkType, index } = this.props;
    const _fn = curMarkType === 'dom' ? this.props.DOMMark : this.props.SpriteMark;
    if (this.props.itemData.markIsHide) {
      // 如果当前标签是隐藏的话
      _fn.show([this.props.id]);
    } else {
      _fn.hide([this.props.id]);
    }
    const curMarkDate = this.props.itemData;
    curMarkDate.markIsHide = !curMarkDate.markIsHide;
    this.props.changeDataSource(index, curMarkDate, curMarkType);
  }

  // 构件聚焦并显示属性
  compFocus(key) {
    const box = this.props.viewer.viewerImpl.getBoundingBoxByIds([key]);
    if (box.min.x === -Infinity || box.min.x === Infinity) {
      toastr.error("该构件不存在！", "", {
        target: `#${this.props.viewer.viewport}`
      });
      return;
    }
    const center = box.getCenter(new THREE.Vector3());
    // 保存当前视角
    // camera.getWorldDirection()能获取当前的视角的方向
    const dir = this.props.viewer.viewerImpl.camera.getWorldDirection();
    // distToCenter是视点到焦点的距离，你可以取构件包围盒的体对角线  x方+y方+z方 之后开根号
    const disToCenter = box.max.distanceTo(box.min);
    const offset = new THREE.Vector3();
    offset.copy(dir); // dir就是视角方向
    offset.setLength(disToCenter);
    const position = new THREE.Vector3();
    position.subVectors(center, offset);
    this.props.viewer.flyTo({
      position,
      target: center,
      up: this.props.viewer.viewerImpl.camera.up
    }, () => {
      this.props.viewer.viewerImpl.cameraControl.dispatchEvent(this.viewerEvents.ON_CAMERA_CHANGE);
    });
    this.props.viewer.highlightComponentsByKey([key]);
    this.props.viewer.closeTransparentComponentsByKey([key]);
    this.props.viewer.transparentOtherComponentsByKey([key]);
  }

  toggleFocus(e) {
    const {
      selectedMarkId, id, isEdit
    } = this.props;
    e.preventDefault();
    e.stopPropagation();
    if (isEdit) {
      // 编辑状态，无法点击 编辑 跟 聚焦功能
      return;
    }

    if (!selectedMarkId || selectedMarkId !== id) {
      this.compFocus(this.props.componentId);
      this.props.selectMark(this.props.itemData);
      this.setState({
        focus: true
      });
      return;
    }

    this.setState(state => {
      if (state.focus) {
        this.props.viewer.clearTransparentList();
        this.props.viewer.clearHighlightList();
        this.props.selectMark();
      } else {
        this.compFocus(this.props.componentId);
        this.props.selectMark(this.props.itemData);
      }
      return {
        focus: !state.focus
      };
    });
  }

  showDetail = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.props.onChangeDetailModal(true, this.props.itemData);
  }

  onRemoveItem = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const { curMarkType, needConfirmRemove } = this.props;
    const isConfirmRemove = needConfirmRemove[curMarkType];
    console.log(isConfirmRemove, 'isConfirmRemove');
    if (isConfirmRemove) {
      this.setState({
        tipType: 'remove',
      });
    } else {
      this.props.onRemove(this.props.itemData);
    }
  }

  onUpdateView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const { curMarkType, needConfirmEdit } = this.props;
    const isConfirmEdit = needConfirmEdit[curMarkType];
    if (isConfirmEdit) {
      this.setState({
        tipType: 'edit',
      });
    } else {
      this.props.updateView(this.props.itemData);
    }
  }

  updateBaseInfo = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const { focus } = this.state;
    const { itemData, index, isEdit } = this.props;

    if (isEdit) {
      // 编辑状态，无法点击 编辑 跟 聚焦功能
      return;
    }
    this.props.updateBaseInfo(itemData, index, focus);
    this.toggleFocus(e);
  }

  render() {
    const { tipType } = this.state;
    const { selectedMarkId, itemData, curMarkType } = this.props;
    // console.log(this.props.itemData, 'itemData itemData')
    return (
      <div role="presentation" className={`${style.markItem} ${this.props.id === selectedMarkId ? style.selected : ''}`} onClick={this.toggleFocus.bind(this)}>
        <div className={style.thumbnail}>
          <img alt="thumbnail" src={this.props.thumbnail} />
        </div>
        <div className={style.markInfo}>
          <div className={style.top}>
            <div title={this.props.title}>
              标签名称：
              {' '}
              {this.props.title}
            </div>
            <div style={{ marginTop: 4 }}>
              修改时间：
              {dateToString(new Date(this.props.utime))}
            </div>
          </div>
          <div className={style.action}>
            <div
              role="presentation"
              className={style.actionItem}
              title={itemData.markIsHide ? '显示' : '隐藏'}
              onClick={e => { this.toggleShowMark(e) }}
            >
              <AntdIcon type={itemData.markIsHide ? 'iconcaozuolishibukejian-01' : 'iconcaozuolishikejian-01'} />
            </div>
            <div role="presentation" className={style.actionItem} title="更新视图" onClick={this.onUpdateView}>
              <AntdIcon type="iconswitch" />
            </div>
            <div role="presentation" className={style.actionItem} title="详情" onClick={this.showDetail}>
              <AntdIcon type="iconoperationhistory" />
            </div>
            <div role="presentation" className={style.actionItem} title="编辑名称、备注" onClick={this.updateBaseInfo}>
              <AntdIcon type="iconedit" />
            </div>
            <div role="presentation" className={style.actionItem} title="删除" onClick={this.onRemoveItem}>
              <AntdIcon type="iconicon_delete" />
            </div>
          </div>
        </div>

        {tipType && (
          <div className={style.confirm}>
            <div className={style.confirmContent}>
              <Confirm
                title={tipType === 'remove' ? '确定删除此标签吗' : '确定更新此标签吗'}
                type={tipType === 'remove' ? 'danger' : ''}
                onOk={neverConfirm => {
                  if (tipType === 'remove') {
                    this.props.onRemove(this.props.itemData);
                  } else {
                    this.props.updateView(this.props.itemData);
                  }
                  if (neverConfirm) {
                    this.props.onNeverConfirm(tipType, curMarkType);
                  }
                  this.setState({
                    tipType: '',
                  });
                }}
                onCancel={() => {
                  this.setState({
                    tipType: '',
                  });
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}

MarkItem.propTypes = {
  id: PropTypes.string,
  title: PropTypes.string,
  selectedMarkId: PropTypes.string,
  componentId: PropTypes.string.isRequired,
  thumbnail: PropTypes.string,
  curMarkType: PropTypes.string.isRequired,
  viewer: PropTypes.object.isRequired,
  BIMWINNER: PropTypes.object.isRequired,
  DOMMark: PropTypes.object.isRequired,
  SpriteMark: PropTypes.object.isRequired,
  itemData: PropTypes.object.isRequired,
  utime: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired,
  needConfirmRemove: PropTypes.object.isRequired,
  needConfirmEdit: PropTypes.object.isRequired,
  isEdit: PropTypes.bool.isRequired,
  onRemove: PropTypes.func.isRequired,
  onNeverConfirm: PropTypes.func.isRequired,
  updateView: PropTypes.func.isRequired,
  updateBaseInfo: PropTypes.func.isRequired,
  onChangeDetailModal: PropTypes.func.isRequired,
  changeDataSource: PropTypes.func.isRequired,
  selectMark: PropTypes.func.isRequired,
};

MarkItem.defaultProps = {
  id: generateUUID(),
  title: '',
  thumbnail: '',
  selectedMarkId: ''
};

export default MarkItem;
