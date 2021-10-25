import React from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import _ from "lodash-es";
import generateUUID from "UIutils/generateUUID";
import { Transition } from 'react-transition-group';
import { getNumber, AntdIcon, mobileCheck } from "UIutils/utils";
import titleIcon from 'Base/Modal/img/titleIcon.png';
import * as style from "./index.less";
import ColorPad from "./ColorPad";
import CommonColor from "./CommonColor";
import ColorBar from "./ColorBar";
import Color from "./Color.js";
import {
  convertRGBColorToHSV, convertHexColorToRGB, convertHSVColorToRGB, convertRGBColorToHex
} from "./Util";
import AlphaBar from "./AlphaBar";
import ColorInput from "./ColorInput";
import zIndexStore from "../zIndexStore";
import H5CommonColor from './mobile/CommonColor';
import H5RecentColors from './mobile/RecentColors';
import H5ColorBar from "./mobile/ColorBar";
import H5ColorPreview from "./mobile/H5ColorPreview";
import H5AlphaBar from './mobile/AlphaBar';
import * as mobileStyle from "./mobile/index.less";

const CONTENT_WIDTH = 350;
const CONTENT_HEIGHT = 530;
const IS_MOBILE = mobileCheck(); // 颜色面板直接在这个文件进行判断，会比从props传递比较好

class ColorPicker extends React.Component {
  constructor(props) {
    super(props);
    const hex = this.props.hexColor ? this.props.hexColor : "#FFFFFF";
    const color = this.createColor(hex, props.alpha);
    this.uuid = generateUUID();
    this.state = {
      color,
      commonColors: ColorPicker.commonColors,
      recentColors: ColorPicker.recentColors,
      width: `${CONTENT_WIDTH}`,
      height: 'auto',
      left: `${this.props.position.x}px`,
      right: 'initial',
      top: `160px`,
      bottom: 'initial',
    };
    this.resizeOffsetXY = {
      x: 0,
      y: 0,
    };

    if (props.restoreColor) {
      // 重置的时候用
      this._initialColor = this.createColor(props.restoreColor.hex, props.restoreColor.alpha);
    }

    this.headerRef = React.createRef();
    this.rootRef = React.createRef();
    this.beginDrag = this.beginDrag.bind(this);

    this.resizeMoveHandler = _.throttle(e => this.resizeModal(e), 10);
    this.resizeEndHandler = this.dragResizeEnd.bind(this);
  }

  static show(props, parent, zIndex) {
    const {
      x, y, hexColor, alpha, restoreColor, onConfirm, onClose, onRestore, didMount, title,
    } = { ...props };
    const div = document.createElement('div');
    div.style.position = "absolute";
    div.style.left = "0px";
    div.style.top = "0px";
    div.style.zIndex = zIndex || zIndexStore.addZIndex(this.uuid);
    // div.style.width = "248px";
    // div.style.height = "514px";
    if (parent) {
      parent.appendChild(div);
    } else {
      document.body.appendChild(div);
    }

    ReactDOM.render(
      <ColorPicker
        position={{ x, y }}
        title={title}
        alpha={alpha}
        hexColor={hexColor}
        restoreColor={restoreColor}
        onClose={() => {
          div.parentNode.removeChild(div);
          ReactDOM.unmountComponentAtNode(div);
          if (onClose) {
            onClose();
          }
        }}
        onConfirm={onConfirm}
        onRestore={onRestore}
        didMount={didMount}
        parent={parent || document.body}
        zIndex={zIndex}
      />,
      div
    );
  }

  // static showFromBottom(props, parent, zIndex) {
  //   // 内容宽高
  //   const height = CONTENT_HEIGHT;
  //   const width = CONTENT_WIDTH;
  //   let y = props.y;
  //   if (y) {
  //     y -= height;
  //   }

  //   let x = props.x;
  //   if (x) {
  //     x -= width / 2;
  //   }
  //   ColorPicker.show({ ...props, x, y }, parent, zIndex);
  // }

  // static showFromLeftBottom(props, parent, zIndex) {
  //   // 内容宽高
  //   const height = CONTENT_HEIGHT;
  //   const width = CONTENT_WIDTH;
  //   let y = props.y;
  //   if (y) {
  //     y -= height;
  //   }

  //   let x = props.x;
  //   if (x) {
  //     x -= (width + 10);
  //   }
  //   ColorPicker.show({ ...props, x, y }, parent, zIndex);
  // }

  // static showFromLeft(props, parent, zIndex) {
  //   // 内容宽高
  //   const height = CONTENT_HEIGHT;
  //   const width = CONTENT_WIDTH;
  //   let y = props.y;
  //   if (y) {
  //     y -= height / 2;
  //   }

  //   let x = props.x;
  //   if (x) {
  //     x -= (width + 10);
  //   }
  //   ColorPicker.show({ ...props, x, y }, parent, zIndex);
  // }

  /**
   * 固定显示在Body的右边
   * @param props
   */
  static showAtRight(props, parent, zIndex) {
    const rect = parent.getBoundingClientRect();
    const y = Math.max((rect.height - CONTENT_HEIGHT) / 2, 0);
    const x = rect.width - CONTENT_WIDTH - 20;
    ColorPicker.show({ ...props, x, y }, parent, zIndex);
  }

  static commonColors = ["#FFFFFF", "#D7D7D7", "#81D3F8", "#03CCD6", "#FFAD0D", "#4BB988", "#E02020", "#000000"].map((item) => {
    const color = new Color();
    color.hex = item;
    color.rgb = convertHexColorToRGB(item);
    color.hsv = convertRGBColorToHSV(color.rgb);
    return color;
  })

  static recentColors = new Array(4).fill(0).map((item) => {
    const color = new Color();
    return color;
  })

  static pushToRecentColors(color) {
    if (!ColorPicker.recentColors[0].isEqualTo(color)) {
      ColorPicker.recentColors = [color.copy()].concat(ColorPicker.recentColors.slice(0, -1));
    }
  }

  componentDidMount() {
    if (IS_MOBILE) {
      if (this.props.didMount) {
        this.props.didMount(this);
      }
      return;
    }
    if (this.props.isModal) {
      const div = this.rootRef.current;
      const dRect = this.props.parent.getBoundingClientRect();
      const rect = div.getBoundingClientRect();
      if (rect.height > dRect.height) {
        div.style.height = `${dRect.height}px`;
        div.style.top = "0px";
      } else if (rect.y < 0) {
        div.style.height = `${rect.height + rect.y}px`;
        div.style.top = "0px";
      }

      if (this.props.didMount) {
        this.props.didMount(this);
      }
    }
  }

  render() {
    const {
      width, height, left, top, bottom, right
    } = this.state;
    if (IS_MOBILE) {
      return this.renderMobile();
    }
    if (this.props.isModal) {
      return (
        <div
          role="presentation"
          ref={this.rootRef}
          className={style.container}
          style={{
            width: `${width}`,
            height: `${height}`,
            left: `${left}`,
            top: `${top}`,
            right: `${right}`,
            bottom: `${bottom}`,
          }}
          onClick={() => this.onClickPanel()}
        >
          <div
            className={style.dialogRowResize1}
            draggable={false}
            data-resize="resize"
            onMouseDown={e => {
              this.dragResizeStart(e, 'up');
            }}
          />
          <div
            className={style.dialogColResize1}
            draggable={false}
            data-resize="resize"
            onMouseDown={e => {
              this.dragResizeStart(e, 'left');
            }}
          />
          <div
            className={style.dialogColResize2}
            draggable={false}
            data-resize="resize"
            onMouseDown={e => {
              this.dragResizeStart(e, 'right');
            }}
          />
          <div
            className={style.dialogRowResize2}
            draggable={false}
            data-resize="resize"
            onMouseDown={e => {
              this.dragResizeStart(e, 'down');
            }}

          />
          <div className={style.content}>
            <div
              onMouseDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
                this.beginDrag(event);
              }}
              ref={this.headerRef}
              className={style.header}
            >
              <span className={style.headerTitle}>
                <img src={titleIcon} alt="title icon" />
                {this.props.title}
              </span>
              <div role="presentation" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); this.onClose(e) }} className={style.close} />
            </div>
            <div className={style.contentBody}>
              {this.renderMainContent()}
            </div>
          </div>
        </div>
      );
    } else {
      return this.renderMainContent();
    }
  }

  // 移动端渲染
  renderMobile() {
    const duration = 200;

    const defaultStyle = {
      transition: `all ${duration}ms`,
      opacity: 0
    };

    const transitionStyles = {
      entering: { opacity: 0 },
      entered: { opacity: 1 },
      exiting: { opacity: 0 },
      exited: { opacity: 1 },
    };

    const inProp = true;

    return (
      <Transition in={inProp} timeout={duration} appear>
        {
          (state) => (
            <div
              className={mobileStyle.mobileContainer}
              style={{
                ...defaultStyle,
                ...transitionStyles[state]
              }}
            >
              <header className={mobileStyle.mobileHeader}>
                <AntdIcon
                  type="iconclose"
                  onClick={(e) => { e.stopPropagation(); this.onClose(e) }}
                />
                <span>
                  {this.props.title}
                </span>
                <AntdIcon
                  type="iconcheck"
                  onClick={(e) => {
                    this.onConfirm();
                    this.onClose(e);
                  }}
                />
              </header>
              <section className={mobileStyle.main}>
                <div className={mobileStyle.left}>
                  <H5CommonColor
                    colors={this.state.commonColors}
                    recentColors={this.state.recentColors}
                    colorSelectCallback={(hex) => this.colorChange(hex)}
                  />
                </div>
                <div className={mobileStyle.line} />
                <div className={mobileStyle.middle}>
                  <ColorPad
                    color={this.state.color}
                    colorChangeCallback={(hsv) => this.colorChanged(hsv)}
                  />
                </div>
                <div className={mobileStyle.right}>
                  <div className={mobileStyle.rightTop}>
                    <H5ColorPreview color={this.state.color} />
                    <H5RecentColors
                      colors={this.state.commonColors}
                      recentColors={this.state.recentColors}
                      colorSelectCallback={(hex) => this.colorChange(hex)}
                    />
                  </div>
                  <H5ColorBar
                    color={this.state.color}
                    colorChangeCallback={(hsv) => this.colorChanged(hsv)}
                  />
                  <H5AlphaBar
                    color={this.state.color}
                    alphaChangeCallback={(alpha) => this.alphaChange(alpha)}
                  />
                </div>
              </section>
            </div>
          )
        }

      </Transition>
    );
  }

  renderMainContent() {
    return (
      <>
        <div className={style.commonColorContainer}>
          <CommonColor
            colors={this.state.commonColors}
            recentColors={this.state.recentColors}
            colorSelectCallback={(hex) => this.colorChange(hex)}
          />
        </div>
        <div className={style.colorPadContainer}>
          <ColorPad
            color={this.state.color}
            colorChangeCallback={(hsv) => this.colorChanged(hsv)}
          />
        </div>
        <div className={style.colorBarContainer}>
          <ColorBar
            color={this.state.color}
            colorChangeCallback={(hsv) => this.colorChanged(hsv)}
          />
        </div>

        <div className={style.colorInputContainer}>
          <ColorInput
            color={this.state.color}
            colorChangeCallback={(hsv) => this.colorChanged(hsv)}
          />
        </div>

        <div className={style.colorAlphaBarContainer}>
          <span className={style.label}>透明度</span>
          <div className={style.colorAlphaBar}>
            <AlphaBar
              color={this.state.color}
              alphaChangeCallback={(alpha) => this.alphaChange(alpha)}
            />
          </div>
        </div>

        <div className={style.bottomButtons}>
          <div
            role="presentation"
            onClick={() => this.restoreColor()}
            className={style.button}
          >
            复原
          </div>
          <div
            role="presentation"
            className={style.buttonConfirm}
            onClick={() => this.onConfirm()}
          >
            确定
          </div>
        </div>
      </>
    );
  }

  // 点击面板将自身置顶
  onClickPanel() {
    if (!this.props.zIndex) {
      this.rootRef.current.parentNode.style.zIndex = zIndexStore.addZIndex(this.uuid);
    }
  }

  createColor(hex, alpha) {
    const color = new Color();
    const rgb = convertHexColorToRGB(hex);
    if (rgb) {
      const hsv = convertRGBColorToHSV(rgb);
      color.hex = convertRGBColorToHex(rgb);
      color.rgb = rgb;
      color.hsv = hsv;
      color.alpha = alpha || rgb.a;
    }
    return color;
  }

  dismiss() {
    if (this.props.onClose) {
      this.props.onClose();
    }
  }

  beginDrag(event) {
    const box = this.rootRef.current;
    const CSS = getComputedStyle(box);
    // console.log(box, 'box');
    // console.log(event, 'event');
    const diffX = event.pageX - box.offsetLeft;
    const diffY = event.pageY - box.offsetTop;

    // console.log(diffX, 'diffX');
    // console.log(CSS.top, 'CSS');
    this.setState({
      top: CSS.top,
      bottom: 'initial'
    });
    const That = this;
    function mouseMove(event2) {
      let moveX = event2.pageX - diffX;
      let moveY = event2.pageY - diffY;
      const maxX = document.documentElement.scrollWidth - box.offsetWidth;// X轴可移动最大距离
      const maxY = document.documentElement.scrollHeight - box.offsetHeight;// Y轴可移动最大距离

      // console.log(maxX, 'maxX');
      // console.log(maxX, 'maxY');

      if (moveX < 0) {
        moveX = 0;
      } else if (moveX > maxX) {
        moveX = maxX;
      }

      if (moveY < 0) {
        moveY = 0;
      } else if (moveY > maxY) {
        moveY = maxY;
      }

      That.setState({
        left: `${moveX}px`,
        top: `${moveY}px`
      });
      // box.style.left = `${moveX}px`;
      // box.style.top = `${moveY}px`;
    }

    function mouseUp() {
      window.removeEventListener("mousemove", mouseMove, false);
      window.removeEventListener("mouseup", mouseUp, false);
    }

    window.addEventListener("mousemove", mouseMove, false);
    window.addEventListener("mouseup", mouseUp, false);
  }

  colorChanged(hsv) {
    // eslint-disable-next-line react/no-access-state-in-setstate
    const color = this.state.color;
    color.hsv = hsv;
    color.rgb = convertHSVColorToRGB(hsv);
    color.rgb.a = color.alpha;
    color.hex = convertRGBColorToHex(color.rgb);
    this.setState({
      color
    });
  }

  alphaChange(alpha) {
    // eslint-disable-next-line react/no-access-state-in-setstate
    const color = this.state.color;
    color.alpha = alpha;
    this.setState({
      color
    });
  }

  colorChange(color) {
    this.setState({
      color: color.copy()
    });
  }

  restoreColor() {
    if (this._initialColor) {
      this.setState({
        color: _.cloneDeep(this._initialColor)
      });
    }
    if (this.props.onRestore) {
      this.props.onRestore(this._initialColor);
    }
  }

  onConfirm() {
    ColorPicker.pushToRecentColors(this.state.color);
    this.setState({
      recentColors: ColorPicker.recentColors
    });
    if (this.props.onConfirm) {
      this.props.onConfirm(this.state.color.copy());
    }
  }

  onClose() {
    if (this.props.onClose) {
      this.props.onClose();
    }
  }

  dragResizeStart(e, pos) {
    console.log(pos, 'x pos dragResizeStart');
    const target = e.target || e.targetTouches[0];
    if (target && target.getAttribute("data-resize") === "resize") {
      e.stopPropagation();
      this.dragResizer = pos;
      const CSS = getComputedStyle(this.rootRef.current);
      const x = getNumber(
        e.clientX,
        e.pageX,
        _.get(e, 'targetTouches[0].clientX'),
        _.get(e, 'targetTouches[0].pageX')
      ) || 0;
      const y = getNumber(
        e.clientY,
        e.pageY,
        _.get(e, 'targetTouches[0].clientY'),
        _.get(e, 'targetTouches[0].pageY')
      ) || 0;
      // console.log(x, 'x');
      // e.dataTransfer.setDragImage(new Image(), 0, 0);
      // 用来处理ff不能拖动的bug
      // e.dataTransfer.setData('text', '');
      switch (pos) {
        case 'up':
          this.resizeOffsetXY.x = parseFloat(CSS.width || 0) + x;
          this.resizeOffsetXY.y = parseFloat(CSS.height || 0) + y;
          console.log('CSS.bottom', CSS.bottom);
          this.setState({
            top: 'initial',
            bottom: CSS.bottom,
            width: parseFloat(CSS.width || 0),
            height: parseFloat(CSS.height || 0),
          });
          break;
        case 'down':
          this.resizeOffsetXY.x = parseFloat(CSS.width || 0) - x;
          this.resizeOffsetXY.y = parseFloat(CSS.height || 0) - y;
          this.setState({
            top: CSS.top,
            bottom: 'initial',
            width: parseFloat(CSS.width || 0),
            height: parseFloat(CSS.height || 0),
          });
          break;
        case 'left':
          this.resizeOffsetXY.x = parseFloat(CSS.width || 0) + x;
          this.resizeOffsetXY.y = parseFloat(CSS.height || 0) + y;
          this.setState({
            left: 'initial',
            right: CSS.right,
            width: parseFloat(CSS.width || 0),
            height: parseFloat(CSS.height || 0),
          });
          break;
        case 'right':
          this.resizeOffsetXY.x = parseFloat(CSS.width || 0) - x;
          this.resizeOffsetXY.y = parseFloat(CSS.height || 0) - y;
          this.setState({
            left: CSS.left,
            right: 'initial',
            width: parseFloat(CSS.width || 0),
            height: parseFloat(CSS.height || 0),
          });
          break;
        default:
          break;
      }
      document.addEventListener('mousemove', this.resizeMoveHandler);
      document.addEventListener('mouseup', this.resizeEndHandler);
    }
  }

  /**
   * 改变模态框大小拖动事件处理
   * @param {object} e - event
   */
  resizeModal(e) {
    const MIN_WIDTH = 350;
    const MIN_HEIGHT = 350;
    if (this.dragResizer !== '') {
      e.stopPropagation();

      const x = getNumber(
        e.clientX,
        e.pageX,
        _.get(e, 'targetTouches[0].clientX'),
        _.get(e, 'targetTouches[0].pageX')
      ) || 0;
      let y = getNumber(
        e.clientY,
        e.pageY,
        _.get(e, 'targetTouches[0].clientY'),
        _.get(e, 'targetTouches[0].pageY')
      ) || 0;
      y = y > 0 ? y : 0;

      if (x > 0) {
        let n;
        switch (this.dragResizer) {
          case "up":
            n = `${Math.max(this.resizeOffsetXY.y - y, MIN_HEIGHT)}px`;
            this.setState({
              height: n,
            });
            break;
          case "down":
            n = `${Math.max(this.resizeOffsetXY.y + y, MIN_HEIGHT)}px`;
            this.setState({
              height: n,
            });
            break;
          case "left":
            n = `${Math.max(this.resizeOffsetXY.x - x, MIN_WIDTH)}px`;
            this.setState({
              width: n,
            });
            break;
          case "right":
            n = `${Math.max(this.resizeOffsetXY.x + x, MIN_WIDTH)}px`;
            console.log(n, 'n right');
            this.setState({
              width: n,
            });
            break;
          default:
            break;
        }
      }
    }
  }

  dragResizeEnd() {
    this.dragResizer = "";
    document.removeEventListener('mousemove', this.resizeMoveHandler);
    document.removeEventListener('mouseup', this.resizeEndHandler);
  }
}

ColorPicker.propTypes = {
  title: PropTypes.string,
  hexColor: PropTypes.string,
  alpha: PropTypes.number,
  // 复原的时候用
  // 例如 {hex: "#FFFFFF",alpha: 1.0,}
  restoreColor: PropTypes.object,
  position: PropTypes.object,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
  onRestore: PropTypes.func,
  didMount: PropTypes.func,
  parent: PropTypes.object,
  zIndex: PropTypes.number,
  isModal: PropTypes.bool, // 是否弹窗类型，如果不是，只要提取主要内容部分就行，用于显示
};

ColorPicker.defaultProps = {
  title: "颜色面板",
  hexColor: "#FFFFFF",
  // 这个默认值为undefined，因为有的hexColor会带alpha信息，如"#ffffff05"
  alpha: undefined,
  restoreColor: undefined,
  position: { x: 0, y: 0 },
  onClose: undefined,
  onConfirm: undefined,
  onRestore: undefined,
  didMount: undefined,
  parent: undefined,
  zIndex: undefined,
  isModal: true
};

export default ColorPicker;
