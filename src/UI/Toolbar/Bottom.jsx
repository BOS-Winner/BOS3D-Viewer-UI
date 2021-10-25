import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Popup from "Base/Popup";
import Toolbar from "../Base/Toolbar";
import Fit from "../Icon/Fit";
import Undo from "../Icon/Undo";
import Reset from "../Icon/Reset";
import Roam from "../Icon/Roam";
import PickByRect from "../Icon/PickByRect";
import Hide from "../Icon/Hide";
import Isolate from "../Icon/Isolate";
import Section from "../Icon/Section";
import WireFrame from "../Icon/WireFrame";
import Scatter from "../Icon/Scatter";
import ChangeCptColor from "../Icon/ChangeCptColor";
import Roadnet from "../Icon/Roadnet";
import style from "./bottom.less";
import { EVENT } from "../constant";
import Measure from "../Icon/Measure";
import CptInfo from "../Icon/CptInfo";
import InfoTree from "../Icon/InfoTree";
import Mark from "../Icon/Mark";
import Snapshot from "../Icon/Snapshot";
import Open2D from "../Icon/Open2D";
import Setting from "../Icon/Setting";
import CptSearch from "../Icon/CptSearch";
import ModelInfo from "../Icon/ModelInfo";
import Annotation from "../AnnotationUI/AnnotationIcon";
import MiniMap from "../Icon/MiniMap/MiniMap";
import { AntdIcon } from '../utils/utils';
import ViewControlToolbar from './ViewControlToolbar/index';

const MORE_ITEM_ICON = { marginTop: 4, marginBottom: 4 };
class Bottom extends React.Component {
  static propTypes = {
    funcOption: PropTypes.object.isRequired,
    eventEmitter: PropTypes.object.isRequired,
    openAnnotationUI: PropTypes.func,
    viewer: PropTypes.object.isRequired,
    linkage: PropTypes.object,
    isMobile: PropTypes.bool,
    modelLoad: PropTypes.bool.isRequired,
    modelDetail: PropTypes.object,
    // HorizontalorVerticalScreen: PropTypes.number
  };

  static defaultProps = {
    openAnnotationUI: () => { },
    linkage: {},
    isMobile: false,
    modelDetail: {}
    // HorizontalorVerticalScreen: 0
  };

  constructor(props) {
    super(props);
    this.toolbarRef = React.createRef();
    this.userJSX = [];
    this.state = {
      mode: 'only3D', // only3D, main3D, main2D, 2D3D
      mobileToolbarIsExpand: true
    };
  }

  componentDidMount() {
    this.props.eventEmitter.on(EVENT.addIconToBottom, dom => {
      if (dom.$$typeof) {
        this.userJSX.push(dom);
        this.forceUpdate();
      } else {
        this.toolbarRef.current.appendChild(dom);
      }
    });

    if (this.props.linkage.emitter) {
      this.props.linkage.emitter.on(
        this.props.linkage.EVENTS.ON_SWITCH_ONLY3D,
        () => {
          // 必须先等三维resize完毕后再调用
          setTimeout(() => {
            this.setState({
              mode: 'only3D',
            });
          }, 5);
        }
      );
      this.props.linkage.emitter.on(
        this.props.linkage.EVENTS.ON_SWITCH_MAIN3D,
        () => {
          // 必须先等三维resize完毕后再调用
          setTimeout(() => {
            this.setState({
              mode: 'main3D',
            });
          }, 5);
        }
      );
      this.props.linkage.emitter.on(
        this.props.linkage.EVENTS.ON_SWITCH_MAIN2D,
        () => {
          this.setState({
            mode: 'main2D',
          });
        }
      );
      this.props.linkage.emitter.on(
        this.props.linkage.EVENTS.ON_SWITCH_BOTH,
        () => {
          this.setState({
            mode: '2D3D',
          });
        }
      );
    }
  }

  saveRef(ref) {
    this.toolbarRef = ref;
  }

  render() {
    const { isMobile, funcOption, modelDetail } = this.props;
    if (isMobile) {
      return this.renderMobileToolbar();
    }
    const isPicker = false; // 是否是新数据，是就隐藏
    const TOOLBAR_LEFT_SHOW = funcOption.fit || funcOption.roam;
    const ToolbarLeft = TOOLBAR_LEFT_SHOW && (
      <Toolbar>
        {this.props.funcOption.fit && <Fit />}
        {this.props.funcOption.roam && <Roam />}
      </Toolbar>
    );

    const TOOLBAR_MIDDLE_SHOW = funcOption.pickByRect || funcOption.hide
      || funcOption.isolate || funcOption.section || funcOption.scatter
      || funcOption.wireFrame || funcOption.changeCptColor;
    const ToolbarMiddle = (
      <div>
        {
          TOOLBAR_MIDDLE_SHOW && (
            <Toolbar>
              {!isPicker && this.props.funcOption.pickByRect && <PickByRect modelLoad={this.props.modelLoad} />}
              {this.props.funcOption.hide && <Hide />}
              {this.props.funcOption.isolate && <Isolate />}
              {this.props.funcOption.section && <Section />}
              {this.props.funcOption.scatter && <Scatter />}
              {
                !isPicker && (this.props.funcOption.wireFrame || this.props.funcOption.changeCptColor) && (
                  <Popup
                    icon={<AntdIcon type="iconcomponentoperation" className={style.icon} />}
                    title="构件操作"
                  >
                    {this.props.funcOption.wireFrame && <div style={MORE_ITEM_ICON}><WireFrame /></div>}
                    {this.props.funcOption.changeCptColor && <div style={MORE_ITEM_ICON}><ChangeCptColor /></div>}
                  </Popup>
                )
              }
            </Toolbar>
          )
        }
        {/* 没有UI，只响应事件 */}
        <Roadnet />
      </div>
    );

    const TOOLBAR_RIGHT_SHOW = funcOption.measure || funcOption.cptInfo
      || funcOption.infoTree || funcOption.mark || funcOption.snapshot
      || funcOption.annotation || (this.props.linkage.emitter && funcOption.open2d)
      || (funcOption.cptsearch || funcOption.modelinfo
        || funcOption.minimap || funcOption.undo || funcOption.reset);
    const ToolbarRight = TOOLBAR_RIGHT_SHOW && (
      <Toolbar
        getRef={ref => {
          this.saveRef(ref);
        }}
      >
        {this.props.funcOption.measure && <Measure />}
        {this.props.funcOption.cptInfo && <CptInfo />}
        {!isPicker && this.props.funcOption.infoTree && <InfoTree />}
        {this.props.funcOption.mark && <Mark />}
        {!isPicker && this.props.funcOption.snapshot && <Snapshot />}
        {!isPicker && this.props.funcOption.annotation && (
          <Annotation
            openAnnotationUI={this.props.openAnnotationUI}
          />
        )}
        {this.props.linkage.emitter && funcOption.open2d && (
          <Open2D
            linkage={this.props.linkage}
            selected={this.state.mode === 'main3D'}
          />
        )}
        {(funcOption.cptsearch || funcOption.modelinfo || funcOption.minimap || funcOption.undo || funcOption.reset) && (
          <Popup
            icon={<AntdIcon type="iconmore" className={style.icon} />}
            title="更多"
          >
            {!isPicker && this.props.funcOption.cptsearch && <div style={MORE_ITEM_ICON}><CptSearch /></div>}
            {this.props.funcOption.modelinfo && <div style={MORE_ITEM_ICON}><ModelInfo /></div>}
            {!isPicker && this.props.funcOption.minimap && <div style={MORE_ITEM_ICON}><MiniMap /></div>}
            {!isPicker && this.props.funcOption.undo && <div style={MORE_ITEM_ICON}><Undo /></div>}
            {!isPicker && this.props.funcOption.reset && <div style={MORE_ITEM_ICON}><Reset /></div>}
          </Popup>
        )}
        {this.userJSX}
      </Toolbar>
    );

    const ToolbarLast = (
      <Toolbar>
        <Setting />
      </Toolbar>
    );

    const width = parseFloat(getComputedStyle(this.props.viewer.viewportDiv).width);
    const mode = this.state.mode;
    const isWideScreen = width >= 935 && mode !== '2D3D';
    return (
      <div
        className={`${style.bottom} bos3dui-bottom`}
        style={{
          display: mode === 'main2D' ? 'none' : '',
          flexWrap: isWideScreen ? 'nowrap' : 'wrap',
        }}
      >
        {ToolbarLeft}
        <div
          className={style.blank}
          style={{
            display: isWideScreen ? 'block' : 'none',
          }}
        />
        <div className={isWideScreen ? '' : style.middleToTop}>
          <div
            style={{
              display: isWideScreen ? 'none' : 'block',
              width: '200px',
            }}
          />
          {ToolbarMiddle}
          <div
            style={{
              display: isWideScreen ? 'none' : 'block',
              width: '200px',
            }}
          />
        </div>
        <div className={style.blank} />
        {ToolbarRight}
        <div className={style.blank} />
        {ToolbarLast}
      </div>
    );
  }

  renderMobileToolbar() {
    const { mobileToolbarIsExpand } = this.state;
    const { funcOption, modelDetail } = this.props;
    const isPicker = false; // 是否是新数据，是就隐藏
    return (
      <div id="mobileToolbar" className={`${style.mobileToolbarWrap} ${mobileToolbarIsExpand ? style.mobileToolbarOpen : ''} `}>
        <section className={style.mobileToolbarList}>
          <div className={style.mobileToolbarItem}><ViewControlToolbar /></div>
          {this.props.funcOption.roam && <div className={style.mobileToolbarItem}><Roam /></div>}
          {this.props.funcOption.isolate && <div className={style.mobileToolbarItem}><Isolate /></div>}
          {this.props.funcOption.hide && <div className={style.mobileToolbarItem}><Hide /></div>}
          {this.props.funcOption.section && <div className={style.mobileToolbarItem}><Section /></div>}
          {!isPicker && this.props.funcOption.changeCptColor && (
            <div className={style.mobileToolbarItem}>
              <ChangeCptColor />
            </div>
          )}
          {this.props.funcOption.measure && (
            <div className={style.mobileToolbarItem}>
              <Measure />
            </div>
          )}
          {this.props.funcOption.cptInfo && <div className={style.mobileToolbarItem}><CptInfo /></div>}
          {!isPicker && this.props.funcOption.infoTree && <div className={style.mobileToolbarItem}><InfoTree /></div>}
          {!isPicker && this.props.funcOption.snapshot && <div className={style.mobileToolbarItem}><Snapshot /></div>}
          {this.props.linkage.emitter && funcOption.open2d && <div className={style.mobileToolbarItem}><Open2D linkage={this.props.linkage} selected={this.state.mode === 'main3D'} /></div>}
          {!isPicker && funcOption.cptsearch && <div className={style.mobileToolbarItem}><CptSearch /></div>}
          {!isPicker && funcOption.minimap && <div className={style.mobileToolbarItem}><MiniMap /></div>}
          {!isPicker && this.props.funcOption.annotation && (
            <div className={style.mobileToolbarItem}>
              <Annotation
                openAnnotationUI={this.props.openAnnotationUI}
              />
            </div>
          )}
          <div className={style.mobileToolbarItem}>
            <Setting />
          </div>
        </section>
        {/* 收起菜单按钮 start  1）收起菜单只有当没有点击任何构建的时候才显示此按钮 */}
        <section
          role="presentation"
          className={style.smallIcon}
          onClick={
            (e) => {
              e.preventDefault();
              e.stopPropagation();
              this.setState({
                mobileToolbarIsExpand: !mobileToolbarIsExpand
              });
            }
          }
        >
          <AntdIcon
            type="iconicon_arrowleft-01"
          />
        </section>
        {/* 收起菜单按钮 end */}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  eventEmitter: state.system.eventEmitter,
  viewer: state.system.viewer3D,
  linkage: state.system.linkage,
  funcOption: state.userSetting.toolState,
  isMobile: state.system.isMobile,
  HorizontalorVerticalScreen: state.system.HorizontalorVerticalScreen,
  mode: state.button.mode,
  modelDetail: state.system.model,
});
const mapDispatchToProps = () => ({});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Bottom);
