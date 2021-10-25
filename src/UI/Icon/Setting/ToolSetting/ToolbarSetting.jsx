import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Header from 'Base/Header';
import { changeToolbarState } from "../../../userRedux/userSetting/action";
import ToolSettingItem from "./ToolSettingItem";
import settingStyle from "../style.less";
import style from "./style.less";

class ToolbarSetting extends React.PureComponent {
  static propTypes = {
    changeToolState: PropTypes.func.isRequired,
    checkedObj: PropTypes.object.isRequired,
    isMobile: PropTypes.bool.isRequired,
    modelDetail: PropTypes.object,
  };

  static defaultProps = {
    modelDetail: {}
  }

  render() {
    const { isMobile, modelDetail } = this.props;
    const cts = this.props.changeToolState;
    const checkedObj = this.props.checkedObj;
    const isPicker = false; // 是否是新数据，是就隐藏
    return (
      <div className={`${settingStyle.settingContainer} ${style.toolSettingContainer}`}>
        {!isMobile && <Header title="基础工具栏" />}
        {isMobile && <div className={style.mobileTitleOne}>基础工具栏</div>}
        <div className={`${settingStyle.settingItem} ${style.settingGroup} ${style.settingMobileItem} `}>
          <div style={{ flexGrow: 1 }}>
            <ToolSettingItem
              name="聚焦"
              type="fit"
              alt="fit logo"
              checked={checkedObj.fit}
              onClick={enable => { cts('fit', enable) }}
            />
            <ToolSettingItem
              name="漫游"
              type="roam"
              alt="roam logo"
              checked={checkedObj.roam}
              onClick={enable => { cts('roam', enable) }}
            />
            {
              !isPicker && (
                <ToolSettingItem
                  name="框选"
                  type="pickByRect"
                  alt="pickByRect logo"
                  checked={checkedObj.pickByRect}
                  onClick={enable => { cts('pickByRect', enable) }}
                />
              )
            }
            <ToolSettingItem
              name="隐藏"
              type="hide"
              alt="hide logo"
              checked={checkedObj.hide}
              onClick={enable => { cts('hide', enable) }}
            />
            <ToolSettingItem
              name="隔离"
              type="isolate"
              alt="isolate logo"
              checked={checkedObj.isolate}
              onClick={enable => { cts('isolate', enable) }}
            />
            <ToolSettingItem
              name="剖切"
              type="section"
              alt="section logo"
              checked={checkedObj.section}
              onClick={enable => { cts('section', enable) }}
            />
            <ToolSettingItem
              name="分解"
              type="scatter"
              alt="scatter logo"
              checked={checkedObj.scatter}
              onClick={enable => { cts('scatter', enable) }}
            />
            {
              !isPicker && (
                <ToolSettingItem
                  name="构件线框化"
                  type="wireFrame"
                  alt="wireFrame logo"
                  checked={checkedObj.wireFrame}
                  onClick={enable => { cts('wireFrame', enable) }}
                />
              )
            }
            {
              !isPicker
              && (
                <ToolSettingItem
                  name="构件上色"
                  type="changeColor"
                  alt="changeCptColor logo"
                  checked={checkedObj.changeCptColor}
                  onClick={enable => { cts('changeCptColor', enable) }}
                />
              )
            }
          </div>
        </div>
        {!isMobile && <Header title="高级工具栏" />}
        {isMobile && <div className={style.mobileTitleOne}>高级工具栏</div>}
        <div className={`${settingStyle.settingItem} ${style.settingGroup} ${style.settingMobileItem}`}>
          <div style={{ flexGrow: 1 }}>
            <ToolSettingItem
              name="模型测量"
              type="measure"
              alt="measure logo"
              checked={checkedObj.measure}
              onClick={enable => { cts('measure', enable) }}
            />
            <ToolSettingItem
              name="属性信息"
              type="cptInfo"
              alt="cptInfo logo"
              checked={checkedObj.cptInfo}
              onClick={enable => { cts('cptInfo', enable) }}
            />
            {
              !isPicker && (
                <ToolSettingItem
                  name="模型树"
                  type="infoTree"
                  alt="infoTree logo"
                  checked={checkedObj.infoTree}
                  onClick={enable => { cts('infoTree', enable) }}
                />
              )
            }
            <ToolSettingItem
              name="标签"
              type="mark"
              alt="mark logo"
              checked={checkedObj.mark}
              onClick={enable => { cts('mark', enable) }}
            />
            {
              !isPicker && (
                <ToolSettingItem
                  name="快照"
                  type="snapshot"
                  alt="snapshot logo"
                  checked={checkedObj.snapshot}
                  onClick={enable => { cts('snapshot', enable) }}
                />
              )
            }
            {
              !isPicker && (
                <ToolSettingItem
                  name="批注"
                  type="annotation"
                  alt="annotation logo"
                  checked={checkedObj.annotation}
                  onClick={enable => { cts('annotation', enable) }}
                />
              )
            }

            {this.props.linkage && this.props.linkage.emitter
              && (
                <ToolSettingItem
                  name="2D"
                  type="open2d"
                  alt="open2d logo"
                  checked={checkedObj.open2d}
                  onClick={enable => { cts('open2d', enable) }}
                />
              )}
            {
              !isPicker && (
                <ToolSettingItem
                  name="构件查找"
                  type="cptsearch"
                  alt="cptsearch logo"
                  checked={checkedObj.cptsearch}
                  onClick={enable => { cts('cptsearch', enable) }}
                />
              )
            }
            <ToolSettingItem
              name="模型信息"
              type="modelinfo"
              alt="modelinfo logo"
              checked={checkedObj.modelinfo}
              onClick={enable => { cts('modelinfo', enable) }}
            />
            {
              !isPicker && (
                <ToolSettingItem
                  name="小地图"
                  type="minimap"
                  alt="minimap logo"
                  checked={checkedObj.minimap}
                  onClick={enable => { cts('minimap', enable) }}
                />
              )
            }
            {
              !isPicker && (
                <ToolSettingItem
                  name="操作历史"
                  type="undo"
                  alt="undo logo"
                  checked={checkedObj.undo}
                  onClick={enable => { cts('undo', enable) }}
                />
              )
            }
            {
              !isPicker && (
                <ToolSettingItem
                  name="复位"
                  type="reset"
                  alt="reset logo"
                  checked={checkedObj.reset}
                  onClick={enable => { cts('reset', enable) }}
                />
              )
            }
            {/* <ToolSettingItem
              name="更多"
              type={'moreMenu'}
              alt="moreMenu logo"
              checked={checkedObj.moreMenu}
              onClick={enable => { cts('moreMenu', enable) }}
            /> */}
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  checkedObj: state.userSetting.toolState,
  linkage: state.system.linkage,
  isMobile: state.system.isMobile,
  HorizontalorVerticalScreen: state.system.HorizontalorVerticalScreen,
  modelDetail: state.system.model,
});
const mapDispatchToProps = (dispatch) => ({
  changeToolState: (name, enable) => dispatch(changeToolbarState(name, enable)),
});

const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ToolbarSetting);

export default WrappedContainer;
