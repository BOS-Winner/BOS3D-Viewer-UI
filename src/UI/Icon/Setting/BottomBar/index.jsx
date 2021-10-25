import React from "react";
import PropTypes from "prop-types";
import ImportSetting from "./ImportSetting";
import ExportSetting from "./ExportSetting";
import Restore from "./Restore";
import style from "./style.less";

class BottomBar extends React.PureComponent {
  static propTypes = {
    type: PropTypes.oneOf([
      "display",
      'camera',
      'toolbar',
    ]).isRequired,
    isMobile: PropTypes.bool
  };

  static defaultProps = {
    isMobile: false
  }

  render() {
    return (
      <div className={style.footer}>
        <div className={style.top}>
          <div>配置记录</div>
          <div className={style.bottomGroup}>
            <ImportSetting />
            <span style={{ marginLeft: 10 }} />
            <ExportSetting isMobile={this.props.isMobile} />
          </div>
        </div>
        <div className={style.bottom}>
          <Restore type={this.props.type} />
        </div>
      </div>
    );
  }
}

export default BottomBar;
