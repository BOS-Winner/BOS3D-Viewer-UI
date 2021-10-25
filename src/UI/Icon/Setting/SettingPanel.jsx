import React from "react";
import CameraSetting from "./CameraSetting";
import ModelSetting from "./ModelSetting";
import DisplayAndEffect from "./DisplayAndEffect";
import ToolbarSetting from "./ToolSetting";
import BottomBar from "./BottomBar";
import style from "./style.less";
import { AntdIcon } from '../../utils/utils';

class SettingPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      settingItem: 'model', // model模型设置，camera相机设置
    };
  }

  switchSetItem(name, e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      settingItem: name,
    });
  }

  render() {
    const { settingItem } = this.state;
    const { isMobile } = this.props;

    return (
      <div className={style.settingPanel}>
        <div
          className={style.tabsWrap}
        >
          <div
            className={style.tabs}
          >
            <div
              role="presentation"
              className={`${style.tab} ${settingItem === 'model' ? style.active : ''}`}
              onClick={e => { this.switchSetItem('model', e) }}
            >
              <AntdIcon type="iconmodelsettings" />
              {' '}
              模型设置
            </div>
            <div
              role="presentation"
              className={`${style.tab} ${settingItem === 'camera' ? style.active : ''}`}
              onClick={e => { this.switchSetItem('camera', e) }}
            >
              <AntdIcon type="iconcamerasettings" />
              {' '}
              相机设置
            </div>
            <div
              role="presentation"
              className={`${style.tab} ${settingItem === 'display' ? style.active : ''}`}
              onClick={e => { this.switchSetItem('display', e) }}
            >
              <AntdIcon type="icondisplayandeffect" />
              {' '}
              显示与效果
            </div>
            <div
              role="presentation"
              className={`${style.tab} ${settingItem === 'toolbar' ? style.active : ''}`}
              onClick={e => { this.switchSetItem('toolbar', e) }}
            >
              <AntdIcon type="icontoolconfiguration" />
              {' '}
              工具栏配置
            </div>
          </div>
        </div>
        <div className={style.tabPanel}>
          <div
            style={{
              display: this.state.settingItem === 'model' ? 'block' : 'none'
            }}
          >
            <ModelSetting isMobile={isMobile} />
          </div>
          <div
            style={{
              display: this.state.settingItem === 'camera' ? 'block' : 'none'
            }}
          >
            <CameraSetting isMobile={isMobile} />
          </div>
          <div
            style={{
              display: this.state.settingItem === 'display' ? 'block' : 'none'
            }}
          >
            <DisplayAndEffect isShown={this.state.settingItem === 'display'} isMobile={isMobile} />
          </div>
          <div
            style={{
              display: this.state.settingItem === 'toolbar' ? 'block' : 'none'
            }}
          >
            <ToolbarSetting />
          </div>
          {this.state.settingItem !== 'model' && <BottomBar isMobile={isMobile} type={this.state.settingItem} />}
        </div>

      </div>
    );
  }
}

export default SettingPanel;
