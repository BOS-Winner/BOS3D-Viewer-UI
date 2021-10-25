import React from "react";
import PropTypes from "prop-types";
import _ from "lodash-es/lodash.default";
import { connect } from "react-redux";
import toastr from "customToastr";
import Modal from "Base/Modal";
import Table from "InfoTable/Table";
import style from "InfoTable/index.less";
import { showCptInfo } from "../../redux/bottomRedux/action";
import { getCptInfo } from "./ajax";
import { mobileCheck } from '../../../UI/utils/utils';

const TIPS = {
  unselected: 0,
  pending: 1,
  error: 2,
  ok: 3,
};

class ComponentInfo extends React.Component {
  static propTypes = {
    viewer: PropTypes.object.isRequired,
    BOS2D: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      data: undefined,
      tip: TIPS.unselected,
    };
    // 避免重复请求网络
    this._currentComponentKey = undefined;
    this.clickPick = this.clickPick.bind(this);
    this.isMobile = mobileCheck();
  }

  componentDidMount() {
    const viewer2D = this.props.viewer;
    const EVENT = this.props.BOS2D.EVENTS;
    viewer2D.registerDrawEventListener(
      EVENT.ON_SELECTION_CHANGED,
      this.clickPick
    );
    this.clickPick();
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.show && this.props.show) {
      this.clickPick();
    }
  }

  componentWillUnmount() {
    const viewer2D = this.props.viewer;
    const EVENT = this.props.BOS2D.EVENTS;
    viewer2D.unregisterDrawEventListener(
      EVENT.ON_CLICK_PICK,
      this.clickPick
    );
  }

  clickPick() {
    if (!this.props.show) {
      return;
    }
    const keys = this.props.viewer.getSelectedComponentPartKeys();
    if (keys.length >= 1) {
      this.fetchData(keys[0]);
    } else {
      this._currentComponentKey = undefined;
      this.setState({
        data: undefined,
        tip: TIPS.unselected
      });
    }
  }

  fetchData(key) {
    // 避免重复访问
    if (this._currentComponentKey === key && this.state.data) {
      return;
    }
    if (this.state.tip === TIPS.pending) return;
    this._currentComponentKey = undefined;
    this.setState({
      tip: TIPS.pending,
    });
    const viewer2D = this.props.viewer;
    const draw = viewer2D.getViewerImpl().drawManager.getCurrentDraw();
    const modelKey = draw.modelKey;
    const drawPackage = viewer2D.getViewerImpl().drawManager.drawPackages[modelKey];
    const serverUrl = drawPackage.serverUrl;
    const dbName = drawPackage.dbName;
    const share = drawPackage.shareToken;
    const accessToken = drawPackage.accessToken;
    const url = `${serverUrl}/api/${dbName}`;
    const splitKey = key.split('/');
    getCptInfo(url, `${splitKey[2]}_${splitKey[1]}_${splitKey[3]}`, accessToken, share)
      .then(rsp => {
        const data = _.get(rsp, 'data.data.Property', undefined);
        if (rsp.data.code === 'SUCCESS' && data) {
          this.setState({
            data,
            tip: TIPS.ok,
          });
          this._currentComponentKey = key;
        } else {
          toastr.error("请求失败", '', {
            target: `#${viewer2D.viewport}`
          });
          this.setState({
            tip: TIPS.error,
            data: undefined
          });
        }
      });
  }

  close() {
    this.props.onClose();
  }

  render() {
    let content = <></>;
    switch (this.state.tip) {
      case TIPS.unselected:
        content = (
          <div>
            <p>未选择图元/图块</p>
            <p>请选择一个图元/图块以查看其特性</p>
          </div>
        );
        break;
      case TIPS.pending:
        content = <p>正在获取特性...</p>;
        break;
      case TIPS.error:
        content = <p>未查询到图元/图块属性</p>;
        break;
      default:
        content = <Table data={this.state.data} />;
    }
    const customMobile = this.isMobile ? {
      top: '10px',
      right: '70px'
    } : {};
    return (
      <Modal
        onCancel={() => {
          this.close();
        }}
        visible={this.props.show}
        title="特性"
        width="260px"
        height="70%"
        minWidth={260}
        minHeight={200}
        {...customMobile}
        viewportDiv={this.props.viewer.getViewerImpl().domElement}
      >
        <div className={style.table}>
          {content}
        </div>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  viewer: state.system.viewer2D,
  BOS2D: state.system.BOS2D,
  show: state.bottom.showCptInfo,
});

const mapDispatchToProps = (dispatch) => ({
  onClose: () => dispatch(showCptInfo(false)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ComponentInfo);
