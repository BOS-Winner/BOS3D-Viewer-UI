import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Icon from "Base/Icon";
import generateUUID from "UIutils/generateUUID";
import { updateList } from "../../action";
import { ON_CLICK_ISOLATE } from "../../eventType";
import toastr from "../../../toastr";
import { AntdIcon } from '../../../utils/utils';
import iconstyle from '../../../Toolbar/bottom.less';
import style from './style.less';
import zIndexStore from "../../../zIndexStore";

const sender = "IsolateIcon";

class IsolateMobileHelper extends React.PureComponent {
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
      viewer.isolateComponentsByKey(keys);
      viewer.clearHighlightList();
      this.props.updateList({
        type: 'isolate',
        name: "构件隔离",
        keys
      });
      this.props.ee.emit(ON_CLICK_ISOLATE, {
        sender,
        payload: {
          keys,
        },
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
        <div title="构件隔离" role="button" tabIndex={0} onClick={() => { this.onClick() }}>
          <Icon
            icon={<AntdIcon type="iconcomponentisolation" className={iconstyle.icon} />}
            title="隔离"
            selected={selected}
          />
        </div>

        <section className={style.actionWrap} style={{ zIndex: zIndexStore.addZIndex(this._id), display: selected ? 'block' : 'none' }}>
          <button type="button" className="bos-btn bos-btn-primary " onClick={() => { this.onHide() }}>隔离选中对象 </button>
          <button type="button" className="bos-btn bos-btn-default" onClick={() => { this.onShow() }}>显示全部对象 </button>
        </section>

      </div>
    );
  }
}

IsolateMobileHelper.propTypes = {
  updateList: PropTypes.func.isRequired,
  viewer: PropTypes.object.isRequired,
  ee: PropTypes.object.isRequired,
};

IsolateMobileHelper.defaultProps = {

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
)(IsolateMobileHelper);

export default WrappedContainer;
