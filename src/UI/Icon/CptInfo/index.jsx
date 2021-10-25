import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { setComponentInfoVisible, setFamilyInfoVisible } from "../action";
import Icon from "../../Base/Icon";
// import cptInfoPng from "../img/white/cptInfo.png";
import ComponentInfo from "../../ComponentInfo";
import { AntdIcon } from '../../utils/utils';
import iconstyle from '../../Toolbar/bottom.less';

class CptInfo extends React.Component {
  static propTypes = {
    componentInfoVisible: PropTypes.bool.isRequired,
    setComponentInfoVisible: PropTypes.func.isRequired,
    setFamilyInfoHidden: PropTypes.func.isRequired,
    viewer: PropTypes.object.isRequired,
    BOS3D: PropTypes.object.isRequired,
    familyKey: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.clickPick = this.clickPick.bind(this);
    this.state = {
      cptKey: '',
    };
  }

  componentDidMount() {
    const viewer3D = this.props.viewer;
    const EVENT = this.props.BOS3D.EVENTS;
    viewer3D.viewerImpl.modelManager.addEventListener(
      EVENT.ON_SELECTION_CHANGED,
      this.clickPick
    );
  }

  componentWillUnmount() {
    const viewer3D = this.props.viewer;
    const EVENT = this.props.BOS3D.EVENTS;
    viewer3D.viewerImpl.modelManager.removeEventListener(
      EVENT.ON_SELECTION_CHANGED,
      this.clickPick
    );
  }

  clickPick() {
    const keys = this.props.viewer.getHighlightComponentsKey();
    this.setState({
      cptKey: keys.length > 0 ? keys[keys.length - 1] : '',
    });
  }

  onClick() {
    this.props.setComponentInfoVisible(!this.props.componentInfoVisible);
  }

  render() {
    return (
      <div
        title="属性信息"
        role="button"
        tabIndex={0}
        onClick={() => { this.onClick() }}
      >
        {
          this.props.componentInfoVisible && (
            <ComponentInfo
              onClose={() => this.props.setComponentInfoVisible(false)}
              cptKey={this.state.cptKey}
            />
          )
        }
        {
          this.props.familyKey && (
            <ComponentInfo
              onClose={() => this.props.setFamilyInfoHidden({ cptKey: "" })}
              type="family"
              cptKey={this.props.familyKey}
            />
          )
        }
        {/* <Icon img={cptInfoPng} selected={this.props.componentInfoVisible} /> */}
        <Icon
          icon={<AntdIcon type="iconshuxingxinxi" className={iconstyle.icon} />}
          title="属性信息"
          selected={this.props.componentInfoVisible}
        />
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  setComponentInfoVisible: visible => { dispatch(setComponentInfoVisible(visible)) },
  setFamilyInfoHidden: payload => { dispatch(setFamilyInfoVisible(payload)) }
});

const mapStateToProps = (state) => ({
  componentInfoVisible: state.button.componentInfoVisible,
  familyKey: state.button.familyKey,
  viewer: state.system.viewer3D,
  BOS3D: state.system.BIMWINNER.BOS3D,
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CptInfo);
