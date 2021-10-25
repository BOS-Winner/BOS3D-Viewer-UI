import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Icon from "../../Base/Icon";
import Modal from "../../Base/Modal";
import ShotManager from "./ShotManager";
// import snapshotPng from "../img/white/snapshot.png";
import fuckIE from "../../theme/fuckIE.less";
import { AntdIcon } from '../../utils/utils';
import iconstyle from '../../Toolbar/bottom.less';
import { DEFAULT_MODAL_PLACE } from "../../constant";

class Snapshots extends React.Component {
  static propTypes = {
    viewer: PropTypes.object.isRequired,
    mode: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
    this.minWidth = this.props.viewer.viewerImpl.domElement.clientWidth < 760 ? 240 : 330;
  }

  componentDidUpdate(prevProps) {
    if (prevProps.mode !== this.props.mode && this.props.mode === "漫游模式") {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        visible: false,
      });
    }
  }

  render() {
    const { visible } = this.state;
    const { isMobile, HorizontalorVerticalScreen } = this.props;
    const modalInfo = {
      width: isMobile ? '176px' : '350px',
      height: isMobile ? '100%' : '70% ',
      top: isMobile ? undefined : DEFAULT_MODAL_PLACE.snapshot.top,
      left: isMobile ? 'initial' : DEFAULT_MODAL_PLACE.snapshot.left,
      right: isMobile ? undefined : DEFAULT_MODAL_PLACE.snapshot.right,
      bottom: isMobile ? undefined : DEFAULT_MODAL_PLACE.snapshot.bottom,
      minWidth: isMobile ? 176 : 320,
      minHeight: isMobile ? 200 : 320,
    };
    return (
      <div
        role="button"
        tabIndex={0}
        title="快照"
        // className={this.state.visible ? fuckIE.select : ''}
        onClick={() => {
          this.setState(state => ({
            visible: !state.visible
          }));
        }}
      >
        <Icon
          icon={<AntdIcon type="iconkuaizhao" className={iconstyle.icon} />}
          title="快照"
          selected={visible}
        />
        <Modal
          onCancel={() => {
            this.setState({
              visible: false
            });
          }}
          visible={this.state.visible}
          title="快照"
          width={modalInfo.width}
          height={modalInfo.height}
          minWidth={modalInfo.minWidth}
          minHeight={modalInfo.minHeight}
          top={modalInfo.top}
          right={modalInfo.right}
          left={modalInfo.left}
          viewportDiv={this.props.viewer.viewportDiv}
          theme={isMobile ? "mobile-theme-one" : ''}
        >
          <ShotManager />
        </Modal>
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
)(Snapshots);
