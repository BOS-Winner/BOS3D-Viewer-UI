import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import upload from "./upload";
import toastr from "../../../toastr";
import { setSetting } from "../../../userRedux/userSetting/action";

class ImportSetting extends React.PureComponent {
  static propTypes = {
    setSetting: PropTypes.func.isRequired,
    viewer: PropTypes.object.isRequired,
  };

  onImport() {
    upload()
      .then(str => {
        try {
          this.props.setSetting(JSON.parse(str));
          toastr.success('配置记录文件导入成功！', '', {
            target: `#${this.props.viewer.viewport}`
          });
        } catch (e) {
          toastr.error('配置记录文件导入失败，请尝试重新导入哦', '', {
            target: `#${this.props.viewer.viewport}`
          });
        }
      })
      .catch(() => {
        toastr.error('配置记录文件导入失败，请尝试重新导入哦', '', {
          target: `#${this.props.viewer.viewport}`
        });
      });
  }

  render() {
    return (
      <button type="button" className={`bos-btn bos-btn-primary`} onClick={() => this.onImport()}>
        导入
      </button>
    );
  }
}

const mapStateToProps = (state) => ({
  viewer: state.system.viewer3D,
});
const mapDispatchToProps = (dispatch) => ({
  setSetting: setting => dispatch(setSetting(setting)),
});
const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ImportSetting);

export default WrappedContainer;
