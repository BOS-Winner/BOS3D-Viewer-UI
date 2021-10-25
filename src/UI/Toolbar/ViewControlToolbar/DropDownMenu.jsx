import React from "react";
import PropTypes from "prop-types";
import * as style from "./index.less";

class DropDownMenu extends React.Component {
  render() {
    return (
      <div
        role="presentation"
        className={style.dropDownMenu}
      >
        <div role="presentation" onClick={() => this._mainView()} className={style.dropDownMenuItem}>跳转主视图</div>
        <div role="presentation" onClick={() => this._setView()} className={style.dropDownMenuItem}>当前视图设为主视图</div>
        <div role="presentation" onClick={() => this._resetView()} className={style.dropDownMenuItem}>重置主视图</div>
        <div role="presentation" onClick={() => this._test()} className={style.dropDownMenuItem}>关闭视图控制器</div>
        <div role="presentation" onClick={() => this._test()} className={style.dropDownMenuItem}>打开轴向旋转控制</div>
      </div>
    );
  }

  _mainView() {
    if (this.props.action) {
      this.props.action(0);
    }
  }

  _setView() {
    if (this.props.action) {
      this.props.action(1);
    }
  }

  _resetView() {
    if (this.props.action) {
      this.props.action(2);
    }
  }

  _test() {

  }
}

DropDownMenu.propTypes = {
  action: PropTypes.func
};

DropDownMenu.defaultProps = {
  action: undefined
};

export default DropDownMenu;
