import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import _ from "lodash-es";
import { Select } from 'antd';
import { changeModelSetting } from "../../userRedux/userSetting/action";
import toastr from "../../toastr";
import style from "./style.less";

const { Option } = Select;
class ModelSetting extends React.Component {
  static propTypes = {
    viewer: PropTypes.object.isRequired,
    BIMWINNER: PropTypes.object.isRequired,
    changeSetting: PropTypes.func.isRequired,
    modelSetting: PropTypes.object.isRequired,
    isMobile: PropTypes.bool
  };

  static defaultProps = {
    isMobile: false
  }

  constructor(props) {
    super(props);
    this.inputRefs = React.createRef();
    // this.curModel = '';
    // this.curModelCenter = new THREE.Vector3(0, 0, 0);
    // 防止用户先加载模型后加载UI，导致模型列表为空
    const allModelKeys = this.props.viewer.getViewerImpl().getAllBimModelsKey();
    const m = allModelKeys.map(_key => this.props.viewer.getViewerImpl().getModel(_key));
    const modelKeys = _.keys(m);
    const models = {};
    modelKeys.forEach(modelKey => {
      const name = _.get(m, [modelKey, 'modelConfig', 'modelName'], '');
      if (name) {
        models[modelKey] = name;
      }
    });
    this.state = {
      models,
      curModel: "",
    };
    this.initModelCount = 0;
  }

  shouldComponentUpdate(nextProps) {
    const setting = nextProps.modelSetting;
    if (!_.isEqual(this.props.modelSetting, setting)) {
      const modelKeys = _.keys(setting);
      modelKeys.forEach(key => {
        const xyz = setting[key].basePoint;
        let matrix = this.props.viewer.getViewerImpl().getModelMatrix(key);
        if (matrix) {
          matrix = matrix.clone();
          matrix.elements[12] = xyz[0];
          matrix.elements[13] = xyz[1];
          matrix.elements[14] = xyz[2];
          if (this.initModelCount === modelKeys.length) {
            this.props.viewer.getViewerImpl().setModelMatrix(matrix, key);
          } else {
            this.initModelCount += 1;
          }
          if (key === this.state.curModel) {
            this.inputRefs.current.querySelectorAll("input")
              .forEach((input, index) => {
                input.value = xyz[index];
              });
          }
        }
      });
      this.props.viewer.render();
      return false;
    }
    return true;
  }

  componentDidMount() {
    this.props.viewer.registerModelEventListener(
      this.props.BIMWINNER.BOS3D.EVENTS.ON_LOAD_COMPLETE,
      e => {
        const viewer = this.props.viewer;
        const curModel = viewer.getViewerImpl().getAllBimModelsKey()[0] || "";
        // 初始化所有模型的basePoints
        const allModelKeys = viewer.getViewerImpl().getAllBimModelsKey();
        allModelKeys.forEach(_modelKey => {
          // 获取模型
          const model = viewer.getViewerImpl().getModel(_modelKey);
          const basePoint = model.transform ? model.transform.translation : undefined;
          let xyz = [0, 0, 0];
          if (basePoint) {
            xyz = [basePoint?.x || 0, basePoint?.y || 0, basePoint?.z || 0];
          }
          this.props.changeSetting(_modelKey, "basePoint", xyz);
        });

        // 存储模型的key和名字
        this.setState(state => ({
          models: {
            ...state.models,
            [e.modelKey]: e.target.models[e.modelKey].getConfig().modelName || '',
          },
          curModel,
        }));

        this.changeModel(curModel);
      }
    );
  }

  changeModel(value) {
    const curModel = value;
    const curModelSetting = this.props.modelSetting[curModel];
    if (curModelSetting) {
      const basePoint = curModelSetting.basePoint;
      if (basePoint) {
        this.inputRefs.current.querySelectorAll("input")
          .forEach((input, index) => {
            input.value = basePoint[index];
          });
      }
    }
    this.setState({
      curModel,
    });
    /*
    const matrix = this.props.viewer.viewerImpl.getModelMatrix(this.curModel);
    this.curModelCenter = new THREE.Vector3(
      matrix.elements[12], matrix.elements[13], matrix.elements[14]
    );
     */
  }

  setBasePoint(e) {
    e.preventDefault();
    e.stopPropagation();
    const xyz = [];
    this.inputRefs.current.querySelectorAll("input").forEach(input => {
      if (/^-?[0-9]*(\.[0-9]+)?$/.test(input.value)) {
        xyz.push(Number(input.value));
      }
    });
    if (xyz.length === 3) {
      this.props.changeSetting(this.state.curModel, "basePoint", xyz);
    } else {
      toastr.error("坐标格式错误", "", {
        target: `#${this.props.viewer.viewport}`
      });
    }
  }

  /*
  rotateModel(e) {
    e.preventDefault();
    e.stopPropagation();
    this.props.viewer.viewerImpl.cameraControl.handleRotation(
      Number(e.target.value), 0, this.curModelCenter
    );
    this.props.viewer.render();
  }
  */

  render() {
    const { isMobile } = this.props;
    // console.log(this.curModel, this.state.models, _.keys(this.state.models));
    return (
      <div className={style.settingContainer}>
        <div className={`${style.settingItem} ${style.settingItemModelSelect} `}>
          <div className={style.title}>模型选择</div>
          {
            isMobile && (
              <select
                className={style.select}
                onChange={e => {
                  e.stopPropagation();
                  this.changeModel(e.target.value);
                }}
                value={this.state.curModel}
              >
                {_.keys(this.state.models).map(key => (
                  <option value={key} key={key}>
                    {this.state.models[key]}
                  </option>
                ))}
              </select>
            )
          }
          {
            !isMobile && (
              <div className="boss3d-theme-one-form-form-antd">
                <Select
                  style={{ width: 240, marginTop: 10 }}
                  placeholder="请选择模型选择"
                  onChange={e => { this.changeModel(e) }}
                  dropdownClassName="boss3d-theme-one-form-form-antd-dropdown bos3d-select-dropdown-select-single-has-anticon"
                  getPopupContainer={() => this.props.viewer.viewportDiv}
                  value={this.state.curModel}
                >
                  {
                    _.keys(this.state.models).map(key => (
                      <Option value={key} key={key}>
                        {this.state.models[key]}
                      </Option>
                    ))
                  }
                </Select>
              </div>
            )
          }

        </div>
        <div className={style.basePosition}>
          <div className={style.title}>
            设置模型基点位置：
          </div>
          <div className={style.input} ref={this.inputRefs}>
            <div className={style.basePositionInputItem}>
              <span>X:</span>
              <input type="number" step={1} defaultValue={0} />
            </div>
            <div className={style.basePositionInputItem}>
              <span>Y:</span>
              <input type="number" step={1} defaultValue={0} />
            </div>
            <div className={style.basePositionInputItem}>
              <span>Z:</span>
              <input type="number" step={1} defaultValue={0} />
            </div>
            {
              !isMobile && (
                <button
                  type="button"
                  className="bos-btn bos-btn-primary"
                  onClick={e => { this.setBasePoint(e) }}
                >
                  确定
                </button>
              )
            }
          </div>
        </div>
        {/* <div className={style.settingItem}>
          <span>模型朝向：</span>
          <input
            type="range"
            min={-180}
            max={180}
            step={1}
            defaultValue={0}
            onInput={e => this.rotateModel(e)}
          />
        </div> */}
        {
          isMobile && (
            <div className={style.mobileBtnWrap}>
              <button
                type="button"
                className="bos-btn bos-btn-primary bos-btn-block"
                onClick={e => { this.setBasePoint(e) }}
              >
                确定
              </button>
            </div>

          )
        }
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  viewer: state.system.viewer3D,
  BIMWINNER: state.system.BIMWINNER,
  modelSetting: state.userSetting.modelSetting,
});
const mapDispatchToProps = (dispatch) => ({
  changeSetting: (modelKey, name, value) => {
    dispatch(changeModelSetting(modelKey, name, value));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ModelSetting);
