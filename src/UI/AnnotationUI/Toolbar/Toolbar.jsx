import React from "react";
import PropTypes from "prop-types";
import ToolbarItem from '../ToolbarItem/ToolbarItem';
import style from "./toolbar.less";
import Attr from "../AttributePanel/Attr";
import { ButtonAction, BUTTON_ICONS, DEF_COLOR } from '../resource';

const FIRST_LINES = [
  { title: '选择', tag: ButtonAction.Select, icon: BUTTON_ICONS.selectIcon },
  { title: '直线', tag: ButtonAction.DrawLine, icon: BUTTON_ICONS.lineIcon },
  { title: '自由画笔', tag: ButtonAction.DrawFreeLine, icon: BUTTON_ICONS.freeLineIcon },
  { title: '箭头', tag: ButtonAction.DrawArrow, icon: BUTTON_ICONS.arrowIcon },
  { title: '文本', tag: ButtonAction.DrawText, icon: BUTTON_ICONS.textIcon }
];
const SECOND_LINES = [
  { title: '矩形', tag: ButtonAction.DrawRect, icon: BUTTON_ICONS.rectIcon },
  { title: '圆', tag: ButtonAction.DrawCircle, icon: BUTTON_ICONS.circleIcon },
  { title: '椭圆', tag: ButtonAction.DrawEllipse, icon: BUTTON_ICONS.ellipseIcon },
  { title: '云线', tag: ButtonAction.DrawCloudLine, icon: BUTTON_ICONS.cloudIcon },
  { title: '自由云线', tag: ButtonAction.DrawFreeCloudLine, icon: BUTTON_ICONS.freeCloudIcon },
];

const MAP_ACTION_NAME = {
  'Line': ButtonAction.DrawLine,
  'FreeLine': ButtonAction.DrawFreeLine,
  'Arrow': ButtonAction.DrawArrow,
  'Text': ButtonAction.DrawText,
  'Rect': ButtonAction.DrawRect,
  'Circle': ButtonAction.DrawCircle,
  'Ellipse': ButtonAction.DrawEllipse,
  'CloudLine': ButtonAction.DrawCloudLine,
  'FreeCloudLine': ButtonAction.DrawFreeCloudLine,
};
class Toolbar extends React.Component {
  constructor(props) {
    super(props);
    this.buttonAction = this.buttonAction.bind(this);
  }

  componentDidMount() {
    // 默认选中画线
    this.buttonAction(ButtonAction.DrawLine);
  }

  buttonAction = (tag) => {
    if (this.props.buttonAction) {
      this.props.buttonAction(tag);
    }
  }

  isActionDisable(action) {
    return this.props.disableActions.indexOf(action) !== -1;
  }

  render() {
    const { drawableInSelectAction, isMobile } = this.props;
    // console.log(drawableInSelectAction, 'drawableInSelectAction')
    // 填充色
    const _fillColor = (this.props.fillColor === "none" && this.props.isTextAttri === true) ? DEF_COLOR : this.props.fillColor;
    let _selectedButton = this.props.selectedButton;
    let _strokeColor = this.props.strokeColor;
    let _strokeWidth = this.props.strokeWidth;

    if (this.props.selectedButton === ButtonAction.Select) {
      // 如果当前选中的移动模式，可能会选中某个形状，必须根据这些形状重新赋值
      if (drawableInSelectAction && drawableInSelectAction.type) {
        _strokeColor = drawableInSelectAction.strokeColor;
        _strokeWidth = drawableInSelectAction.strokeWidth;
        _selectedButton = MAP_ACTION_NAME[drawableInSelectAction.type];
      }
    }

    return (
      <div className={style.container}>
        <div className={style.btnGroup}>
          <div className={style.itemGroup}>
            {
              FIRST_LINES.map((item, idx) => (
                <div className={style.item} key={idx}>
                  <ToolbarItem title={item.title} tag={item.tag} selected={this.props.selectedButton === item.tag} icon={item.icon} onClick={this.buttonAction} />
                </div>
              ))
            }
          </div>
          {
            [ButtonAction.Select, ButtonAction.DrawLine, ButtonAction.DrawFreeLine, ButtonAction.DrawArrow, ButtonAction.DrawText].includes(this.props.selectedButton)
            && (
              <div className={style.attrGroup}>
                <Attr
                  disableActions={this.props.disableActions}
                  buttonAction={this.props.buttonAction}
                  selectedButton={_selectedButton}
                  fillColor={_fillColor}
                  setFillColor={this.props.setFillColor}
                  strokeColor={_strokeColor}
                  strokeWidth={_strokeWidth}
                  setStrokeColor={this.props.setStrokeColor}
                  setStrokeWidth={this.props.setStrokeWidth}
                  setFontSize={this.props.setFontSize}
                  fontSize={this.props.fontSize}
                  setText={this.props.setText}
                  isTextAttri={this.props.isTextAttri}
                  isMobile={isMobile}
                />
              </div>
            )
          }

          <div className={style.line} />
          <div className={style.itemGroup}>
            {SECOND_LINES.map((item, idx) => (
              <div className={style.item} key={idx}>
                <ToolbarItem title={item.title} tag={item.tag} selected={this.props.selectedButton === item.tag} icon={item.icon} onClick={this.buttonAction} />
              </div>
            ))}
          </div>
          {
            [ButtonAction.DrawRect, ButtonAction.DrawCircle, ButtonAction.DrawEllipse, ButtonAction.DrawCloudLine, ButtonAction.DrawFreeCloudLine].includes(this.props.selectedButton)
            && (
              <div className={style.attrGroup}>
                <Attr
                  disableActions={this.props.disableActions}
                  buttonAction={this.props.buttonAction}
                  selectedButton={_selectedButton}
                  fillColor={_fillColor}
                  setFillColor={this.props.setFillColor}
                  strokeColor={this.props.strokeColor}
                  strokeWidth={this.props.strokeWidth}
                  setStrokeColor={this.props.setStrokeColor}
                  setStrokeWidth={this.props.setStrokeWidth}
                  isTextAttri={this.props.isTextAttri}
                  isMobile={isMobile}
                />
              </div>
            )
          }
        </div>
      </div>
    );
  }
}

Toolbar.propTypes = {
  buttonAction: PropTypes.func,
  disableActions: PropTypes.array,
  selectedButton: PropTypes.string
};

Toolbar.defaultProps = {
  buttonAction: undefined,
  disableActions: [],
  selectedButton: undefined
};

export default Toolbar;
