import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Icon from "Base/Icon";
import Modal from "Base/Modal";
import { Statistic } from 'antd';
import style from "./style.less";
// import iconImg from "../img/white/modelInfo.png";
import { AntdIcon } from '../../utils/utils';
import iconstyle from '../../Toolbar/bottom.less';
import { DEFAULT_MODAL_PLACE } from "../../constant";

class ModelInfo extends React.Component {
  static propTypes = {
    viewer: PropTypes.object.isRequired,
    mode: PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      trianglesCount: 0,
      componentCount: 0,
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.visible && this.state.visible) {
      const info = this.props.viewer.getViewerImpl().modelManager.getStatisticsInfo();
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        trianglesCount: info.trianglesCount,
        componentCount: info.componentCount,
      });
    }
    if (prevProps.mode !== this.props.mode && this.props.mode === "漫游模式") {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        visible: false,
      });
    }
  }

  switchVisible(visible) {
    this.setState({
      visible,
    });
  }

  render() {
    const { visible, trianglesCount, componentCount } = this.state;

    return (
      <div
        title="模型信息"
        role="button"
        tabIndex={0}
        onClick={() => this.switchVisible(!visible)}
      >
        <Icon
          icon={<AntdIcon type="iconmodelinformation" className={iconstyle.icon} />}
          title=""
          selected={visible}
          showTitle={false}
        />
        <Modal
          title="模型信息"
          visible={visible}
          top={DEFAULT_MODAL_PLACE.modelinfo.top}
          right={DEFAULT_MODAL_PLACE.modelinfo.right}
          left={DEFAULT_MODAL_PLACE.modelinfo.left}
          width="350px"
          height="160px"
          minWidth={300}
          minHeight={160}
          onCancel={() => this.switchVisible(false)}
          viewportDiv={this.props.viewer.viewportDiv}
        >
          <div className={style.modelInfo}>
            <div className={style.item}>
              <div className={style.name}>三角面数：</div>
              {/* {trianglesCount} */}
              <Statistic value={trianglesCount} title={null} valueStyle={{ color: "#fff" }} />
            </div>
            <div className={style.item}>
              <div className={style.name}>构件数：</div>
              {/* {componentCount} */}
              <Statistic value={componentCount} title={null} valueStyle={{ color: "#fff" }} />
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  viewer: state.system.viewer3D,
  mode: state.button.mode,
});
const mapDispatchToProps = () => ({});
const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ModelInfo);
export default WrappedContainer;
