import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Icon from "Base/Icon";
import generateUUID from "UIutils/generateUUID";
import { updateList } from "../../action";
import { ON_HIDE_COMPONENT } from "../../eventType";
import toastr from "../../../toastr";
import { AntdIcon } from '../../../utils/utils';
import iconstyle from '../../../Toolbar/bottom.less';
import style from './style.less';
import zIndexStore from "../../../zIndexStore";

const SENDER = "HideIcon";

class HideMobileHelper extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selected: false
    };
    // 生成唯一标识，记录zIndex;
    this._id = generateUUID();
  }

  onClick() {
    this.setState((state) => ({
      selected: !state.selected
    }));
  }

  onHide() {
    const viewer = this.props.viewer;
    const keys = viewer.getHighlightComponentsKey();
    if (keys.length === 0) {
      toastr.error("未选中构件", "", {
        target: `#${viewer.viewport}`
      });
    } else {
      // 隐藏前先取消高亮列表
      viewer.clearModelHighlightList();
      viewer.hideComponentsByKey(keys);
      this.props.updateList({
        name: "隐藏构件",
        type: "hide",
        keys
      });
      this.props.ee.emit(ON_HIDE_COMPONENT, {
        sender: SENDER,
        payload: {
          keys,
        }
      });
    }
  }

  onShow() {
    this.props.viewer.clearTransparentList();
    this.props.viewer.clearHighlightList();
    this.props.viewer.resetScene({
      visible: true
    });
  }

  render() {
    const { selected } = this.state;
    return (
      <div>
        <div title="隐藏" role="button" tabIndex={0} onClick={() => { this.onClick() }}>
          <Icon
            icon={<AntdIcon type="iconconceal" className={iconstyle.icon} />}
            title="隐藏"
            selected={selected}
          />
        </div>
        <section className={style.actionWrap} style={{ zIndex: zIndexStore.addZIndex(this._id), display: selected ? 'block' : 'none' }}>
          <button type="button" className="bos-btn bos-btn-primary" onClick={() => { this.onHide() }}>隐藏选中对象 </button>
          <button type="button" className="bos-btn bos-btn-default" onClick={() => { this.onShow() }}>显示全部对象 </button>
        </section>
      </div>
    );
  }
}

HideMobileHelper.propTypes = {
  updateList: PropTypes.func.isRequired,
  viewer: PropTypes.object.isRequired,
  ee: PropTypes.object.isRequired,
};

HideMobileHelper.defaultProps = {

};

const mapStateToProps = (state) => ({
  viewer: state.system.viewer3D,
  ee: state.system.eventEmitter,
  isMobile: state.system.isMobile,
});
const mapDispatchToProps = (dispatch) => ({
  updateList: item => { dispatch(updateList(item)) }
});

const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(HideMobileHelper);

export default WrappedContainer;
