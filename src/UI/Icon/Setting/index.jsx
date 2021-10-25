import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Icon from "Base/Icon";
import Modal from "Base/Modal";
import SettingPanel from "./SettingPanel";
// import setPng from "../img/white/setting.png";
import { AntdIcon } from '../../utils/utils';
import iconstyle from '../../Toolbar/bottom.less';

class Setting extends React.Component {
  static propTypes = {
    viewer: PropTypes.object.isRequired,
    mode: PropTypes.string.isRequired,
    isMobile: PropTypes.bool
  };

  static defaultProps = {
    isMobile: false
  }

  constructor(props) {
    super(props);
    this.state = {
      showPanel: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.mode !== this.props.mode && this.props.mode === "漫游模式") {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        showPanel: false,
      });
    }
  }

  changeModalShow(show) {
    this.setState({
      showPanel: show,
    });
  }

  render() {
    const { } = this.state;
    const { isMobile } = this.props;

    return (
      <div
        title="系统设置"
        role="button"
        tabIndex={0}
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          this.changeModalShow(!this.state.showPanel);
        }}
      >
        <Modal
          visible={this.state.showPanel}
          onCancel={() => { this.changeModalShow(false) }}
          title="系统设置"
          top="20%"
          right="calc(50% - 220px)"
          width="440px"
          height="60%"
          minWidth={465}
          minHeight={350}
          viewportDiv={this.props.viewer.viewportDiv}
          theme={isMobile ? "mobile-full-theme-one" : ''}
        >
          <SettingPanel isMobile={isMobile} />
        </Modal>
        {/* <Icon img={setPng} selected={this.state.showPanel} /> */}
        <Icon
          icon={<AntdIcon type="iconsetup" className={iconstyle.icon} />}
          title="设置"
          selected={this.state.showPanel}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  viewer: state.system.viewer3D,
  mode: state.button.mode,
  isMobile: state.system.isMobile,
  HorizontalorVerticalScreen: state.system.HorizontalorVerticalScreen,
});
const mapDispatchToProps = () => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Setting);
