import React from "react";
import PropTypes from "prop-types";
import _ from "lodash-es";
import { connect } from "react-redux";
import Modal from "Base/Modal";
import Empty from "Base/Empty";
import toastr from "../toastr";
import Table from "./Table";
import { getFamilyInfo } from "./api";
import style from "./index.less";
import { DEFAULT_MODAL_PLACE } from '../constant.js';

const TIPS = {
  unselected: 0,
  pending: 1,
  error: 2,
  ok: 3,
};

const TITLE = {
  component: '属性信息',
  family: '属性信息',
};

class ComponentInfo extends React.Component {
  static propTypes = {
    viewer: PropTypes.object.isRequired,
    onClose: PropTypes.func,
    cptKey: PropTypes.string,
    type: PropTypes.oneOf(['component', 'family']),
    offline: PropTypes.bool.isRequired,
    isMobile: PropTypes.bool,
  };

  static defaultProps = {
    onClose: undefined,
    cptKey: '',
    type: 'component',
    isMobile: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      data: undefined,
      tip: TIPS.unselected,
    };
    // 避免重复请求网络
    this._currentComponentKey = undefined;
  }

  componentDidMount() {
    if (this.props.cptKey) {
      this.fetchData(this.props.cptKey);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.cptKey !== this.props.cptKey) {
      this.fetchData(this.props.cptKey);
    }
  }

  fetchData(key) {
    // 避免重复访问
    if (this._currentComponentKey === key && this.state.data) {
      return;
    }
    if (this.state.tip === TIPS.pending) return;
    this._currentComponentKey = undefined;
    if (key === '') {
      this._currentComponentKey = undefined;
      this.setState({
        data: undefined,
        tip: TIPS.unselected
      });
      return;
    }
    this.setState({
      tip: TIPS.pending,
    });
    const viewer3D = this.props.viewer;
    let fn = () => { };
    if (this.props.type === 'family') {
      // const model = viewer3D.getViewerImpl().getModelByComponentKey(key); // 存在根节点不场景中，找不到所属model
      let _modelKey = "";
      const modelKey = key.split('_')[0] || "";
      // 查看是不是合并模型
      const models = _.values(viewer3D.viewerImpl.modelManager.models) || [];
      models.forEach(model => {
        if (
          _.keys(model.subModel) && _.includes(_.keys(model.subModel), modelKey) // 合并模型的子模型不为空，并且子模型列表中有当前模型key的modelkey，
        ) {
          _modelKey = model.getConfig().key;
        } else if (modelKey === model.getConfig().key) { // 如果当前的模型不是合并模型
          _modelKey = model.getConfig().key;
        }
      });
      // 考虑如果是自定义场景的，subModels中没有子模型的modelKey，没有办法分辨当前构件是属于哪一个子模型的；
      // 如果没有匹配到 且 scene中有模型
      if (_modelKey === '' && models.length) {
        _modelKey = models[0].getConfig().key;
      }
      const model = viewer3D.getViewerImpl().getModel(_modelKey);
      if (!model) {
        toastr.error("请求失败", '', {
          target: `#${viewer3D.viewport}`
        });
        this.setState({
          tip: TIPS.error,
          data: undefined
        });
        return;
      }
      // 判断是否是离线模式
      if (this.props.offline) {
        fn = () => new Promise(resolve => viewer3D
          .getComponentsAttributeByKey(key, resolve, _modelKey));
      } else {
        fn = () => getFamilyInfo(
          model.dataUrl.serverUrl,
          model.dataUrl.dbName,
          key,
          model.accessToken,
          model.shareKey,
        )
          .then(data => {
            if (data?.data?.code === 'SUCCESS') {
              return data.data.data;
            } else {
              return null;
            }
          })
          .catch(() => null);
      }
    } else {
      fn = () => new Promise(resolve => viewer3D.getComponentsAttributeByKey(key, resolve));
    }
    fn().then(data => {
      if (data) {
        const _d = _.get(data, 'attribute', {});
        const basicInfo = {
          "基本信息": {},
        };
        if (typeof data.name === 'string') {
          basicInfo["基本信息"]["名称"] = data.name;
        }
        if (typeof data.type === 'string') {
          basicInfo["基本信息"]["类型"] = data.type;
        }
        if (typeof data.layer === 'string') {
          basicInfo["基本信息"]["layer"] = data.layer;
        }
        basicInfo["基本信息"]["key"] = key;
        // 添加族信息
        if (this.props.offline) {
          basicInfo["基本信息"]['族'] = _d.familyName || '';
          basicInfo["基本信息"]['族类型'] = _d.familySymbol || '';
          // 获取后删除该字段
          // delete _d.familyName;
          // delete _d.familySymbol;
        } else {
          basicInfo["基本信息"]['族'] = data.familyName || '';
          basicInfo["基本信息"]['族类型'] = data.familySymbol || '';
        }

        // 处理族类型字段
        const tempData = _.cloneDeep(_d);
        delete tempData?.familyName;
        delete tempData?.familySymbol;

        this.setState({
          data: _.assign(basicInfo, tempData),
          tip: TIPS.ok,
        });
        this._currentComponentKey = key;
      } else {
        toastr.error("请求失败", '', {
          target: `#${viewer3D.viewport}`
        });
        this.setState({
          tip: TIPS.error,
          data: undefined
        });
      }
    });
  }

  close() {
    if (this.props.onClose) {
      this.props.onClose();
    }
  }

  render() {
    const { isMobile } = this.props;
    const modalInfo = {
      width: isMobile ? '280px' : '350px',
      height: isMobile ? 'calc(100% - 32px)' : '70%',
      top: isMobile ? '16px' : DEFAULT_MODAL_PLACE.cptInfo.top,
      left: isMobile ? '16px' : DEFAULT_MODAL_PLACE.cptInfo.left,
      right: isMobile ? 'initial' : DEFAULT_MODAL_PLACE.cptInfo.right,
    };

    let content = <></>;
    switch (this.state.tip) {
      case TIPS.unselected:
        content = (
          <Empty>
            <div>
              <div>未选择构件</div>
              <div>请选择一个构件，以查看属性</div>
            </div>
          </Empty>
        );
        break;
      case TIPS.pending:
        content = <p>加载中...</p>;
        break;
      case TIPS.error:
        content = <p>未获取到对应属性</p>;
        break;
      default:
        content = <Table data={this.state.data} />;
    }
    return (
      <Modal
        onCancel={() => {
          this.close();
        }}
        visible
        title={TITLE[this.props.type]}
        width={modalInfo.width}
        height={modalInfo.height}
        top={modalInfo.top}
        left={modalInfo.left}
        right={modalInfo.right}
        minWidth={300}
        minHeight={300}
        destroyOnClose
        viewportDiv={this.props.viewer.viewportDiv}
      >
        <div className={style.table}>
          {content}
        </div>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  viewer: state.system.viewer3D,
  offline: state.system.offline,
  isMobile: state.system.isMobile,
});

const mapDispatchToProps = () => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ComponentInfo);
