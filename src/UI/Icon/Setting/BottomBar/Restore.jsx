import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import toastr from "../../../toastr";
import { restoreSetting } from "../../../userRedux/userSetting/action";

class Restore extends React.PureComponent {
  static propTypes = {
    restore: PropTypes.func.isRequired,
    type: PropTypes.oneOf([
      "display",
      'camera',
      'toolbar',
    ]).isRequired,
    viewer: PropTypes.object.isRequired,
  };

  render() {
    return (
      <button
        type="button"
        className={`bos-btn bos-btn-default bos-btn-block `}
        onClick={() => {
          this.props.restore(this.props.type);
          toastr.success('恢复本页默认设置成功！', '', {
            target: `#${this.props.viewer.viewport}`
          });
        }}
      >
        恢复本页默认设置
      </button>
    );
  }
}

const mapStateToProps = (state) => ({
  viewer: state.system.viewer3D,
});
const mapDispatchToProps = (dispatch) => ({
  restore: settingType => dispatch(restoreSetting(settingType)),
});
const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Restore);

export default WrappedContainer;
