import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import download from "UIutils/download";
import ExportMenu from "./ExportMenu";

class ExportSetting extends React.Component {
  static propTypes = {
    setting: PropTypes.object.isRequired,
    viewer: PropTypes.object.isRequired,
    isMobile: PropTypes.bool
  };

  static defaultProps = {
    isMobile: false
  }

  constructor(props) {
    super(props);
    this.state = {
      showExportMenu: false,
    };
  }

  onClickExport() {
    this.setState({
      showExportMenu: true,
    });
  }

  onExport(data) {
    this.setState({
      showExportMenu: false,
    });
    if (data) {
      const setting = {};
      data.forEach(key => {
        setting[key] = this.props.setting[key];
      });
      // eslint-disable-next-line compat/compat
      const buffer = new TextEncoder()
        .encode(JSON.stringify(setting))
        .map(buf => buf ^ 0xff);
      const blob = new Blob(
        [buffer],
        { type: "application/octet-stream" }
      );
      download(blob, 'BOS三维系统配置记录.data');
    }
  }

  render() {
    return (
      <>
        <ExportMenu
          visible={this.state.showExportMenu}
          viewportDiv={this.props.viewer.viewportDiv}
          onConfirm={data => this.onExport(data)}
          isMobile={this.props.isMobile}
        />
        <button type="button" className="bos-btn bos-btn-default" onClick={() => this.onClickExport()}>
          导出
        </button>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  setting: state.userSetting,
  viewer: state.system.viewer3D,
});
const mapDispatchToProps = () => ({});
const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ExportSetting);

export default WrappedContainer;
