import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Modal from "Base/Modal";
import toastr from "customToastr";
import { Tabs } from 'antd';
import style from "./style.less";
import AiSearch from './components/AiSearch';
import GeneralSearch from "./components/GeneralSearch";
import MobileSearch from './MobileHelper/GeneralSearch';
import { DEFAULT_MODAL_PLACE } from "../../constant";

class Dialog extends React.Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    viewer: PropTypes.object.isRequired,
    ee: PropTypes.object.isRequired,
    offline: PropTypes.bool.isRequired,
    isMobile: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      offline: props.offline,
      tabKey: props.offline ? "2" : "1",
      modalHeight: props.offline ? '300px' : '180px'
    };
  }

  // 处理tab切换
  handleTabChange = (key) => {
    const { offline, viewer } = this.props;
    // 兼容离线包模式，离线包模式下不支持智能搜索
    if (offline && key === "1") {
      toastr.warning("离线包暂不支持智能搜索！", "", {
        target: `#${viewer.viewport}`
      });
      return;
    }
    this.setState({
      tabKey: key
    });
  }

  // 处理modal高度
  handleModalHeight = (number) => {
    this.setState({
      modalHeight: `${number}px`
    });
  }

  // 关闭modal
  closeModal = () => {
    this.props.onCancel();
  }

  render() {
    const { isMobile, viewer } = this.props;
    const props = this.props;
    const { TabPane } = Tabs;
    const viewportHeight = parseFloat(getComputedStyle(viewer.viewportDiv).height);
    const currentModalHeight = parseFloat(this.state.modalHeight);
    const customHeight = viewportHeight < currentModalHeight ? {
      height: `${currentModalHeight * 0.5}px`
    } : { height: this.state.modalHeight };
    const {
      offline,
      tabKey
    } = this.state; // 搜索数据的长度；

    if (isMobile) {
      const modalInfo = {
        width: isMobile ? '340px' : '350px',
        height: isMobile ? 'calc(100% - 32px)' : '70%',
        top: isMobile ? '16px' : undefined,
        left: isMobile ? '16px' : undefined,
        right: isMobile ? 'initial' : undefined,
      };
      return (
        <Modal
          title="构件查找"
          visible={props.visible}
          onCancel={this.closeModal}
          width={modalInfo.width}
          height={modalInfo.height}
          top={modalInfo.top}
          left={modalInfo.left}
          right={modalInfo.right}
          minWidth={200}
          minHeight={200}
          viewportDiv={props.viewer.viewportDiv}
          className={style.container}
          destroyOnClose
        >
          <MobileSearch
            tabKeys={tabKey}
            viewer3D={props.viewer}
            ee={this.props.ee}
            handleModalHeight={this.handleModalHeight}
            offline={offline}
          />
        </Modal>
      );
    }
    return (
      <Modal
        title="构件查找"
        visible={props.visible}
        onCancel={this.closeModal}
        width="500px"
        maxWidth="600px"
        {...customHeight}
        top={DEFAULT_MODAL_PLACE.cptsearch.top}
        right={DEFAULT_MODAL_PLACE.cptsearch.right}
        left={DEFAULT_MODAL_PLACE.cptsearch.left}
        viewportDiv={props.viewer.viewportDiv}
        className={style.container}
        destroyOnClose
      >
        <Tabs className={style.customTabs} defaultActiveKey={offline ? "2" : "1"} activeKey={tabKey} onChange={this.handleTabChange}>
          <TabPane tab="智能搜索" key="1">
            <AiSearch
              tabKeys={tabKey}
              viewer={props.viewer}
              ee={this.props.ee}
              handleModalHeight={this.handleModalHeight}
            />
          </TabPane>
          <TabPane tab="常规搜索" key="2">
            <GeneralSearch
              tabKeys={tabKey}
              viewer3D={props.viewer}
              ee={this.props.ee}
              handleModalHeight={this.handleModalHeight}
              offline={offline}
            />
          </TabPane>
        </Tabs>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  viewer: state.system.viewer3D,
  ee: state.system.eventEmitter,
  offline: state.system.offline,
  isMobile: state.system.isMobile,
});
const mapDispatchToProps = () => ({});
const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Dialog);
export default WrappedContainer;
