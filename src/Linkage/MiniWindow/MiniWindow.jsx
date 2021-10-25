import React, {
  useRef, useImperativeHandle, forwardRef
} from 'react';
import PropTypes from "prop-types";
import Toolbar from "Base/Toolbar";
import Icon from "Base/Icon";
import titleimg from "Base/Modal/img/titleIcon.png";
import CONSTANTS from "../constant";
import icon3D from "../img/3D.png";
import icon2D from "../img/2D.png";
import style from "./style.less";
import { AntdIcon, mobileCheck } from '../../UI/utils/utils';
import iconStyle from '../../BOS2DUI/Theme/icon.less';

const TITLE_HEIGHT = CONSTANTS.TITLE_HEIGHT;

/**
 * 显示小窗口
 * @param {object} props
 * @param {string} [props.className=''] - className
 * @param {CSSStyleDeclaration} [props.style={}] - style
 * @param {string} [props.title=''] - title
 * @param {HTMLElement} props.children - 子元素
 * @param {'' | '3D' | '2D'} [props.icon=''] - 底部需要什么图标
 * @param {boolean} props.showTitle - 是否显示标题栏
 * @param {boolean} [props.showCloseIcon = true] - 是否显示关闭按钮
 * @param {function} [props.onClose = () => {}] - 点击关闭按钮的回调
 * @return {object}
 * @constructor
 */
function MiniWindow(props, ref) {
  let img = icon2D;
  if (props.icon === '3D') {
    img = icon3D;
  }
  const isMobile = mobileCheck();
  const dom = useRef(null);

  useImperativeHandle(ref, () => ({
    reset: () => {
      dom.current.style.zIndex = 1;
      if (isMobile) document.querySelector('#mobileToolbar').style.display = 'block';
    }
  }));

  // PC端工具条
  const PCTool = (
    <Toolbar className={style.toolbar}>
      {props.icon === '2D' && (
        <div title="框选">
          <Icon
            className={iconStyle.icon}
            icon={<AntdIcon type="iconboxselection" />}
            title="框选"
            onClick={() => props.onClickPick()}
          />
        </div>
      )}
      {props.icon === '2D' && (
        <div title="图层">
          <Icon
            className={iconStyle.icon}
            icon={<AntdIcon type="icontuceng2-01" />}
            title="图层"
            onClick={() => props.onLayer()}
          />
        </div>
      )}
      {props.icon && (
        <div title={props.icon === '3D' ? '切换3D视图' : "切换2D视图"}>
          <Icon
            className={iconStyle.icon}

            icon={<AntdIcon type="icona-2dshituquanping-01" />}
            title={props.icon === "3D" ? '2D' : '3D'}
            onClick={() => props.onClickMainIcon()}
          />
        </div>
      )}
      {props.icon === '2D' && (
        <div title="分屏">
          <Icon
            className={iconStyle.icon}
            icon={<AntdIcon type="iconfenping2-01" />}
            title="分屏"
            onClick={() => props.onClickSideIcon()}
          />
        </div>
      )}
    </Toolbar>
  );
  const MobileTool = (
    <div>
      <Toolbar className={style.mobileToolbar}>
        {/* {props.icon === '2D' && (
          <div title="图层">
            <Icon
              className={iconStyle.icon}
              icon={<AntdIcon type="icontuceng2-01" />}
              onClick={() => props.onLayer()}
            />
          </div>
        )} */}
        {props.icon && (
          <div title={props.icon === '3D' ? '切换3D视图' : "切换2D视图"}>
            <Icon
              className={iconStyle.icon}
              icon={<AntdIcon type="icona-2dshituquanping-01" />}
              onClick={() => {
                props.onClickMainIcon();
                if (props.icon === '3D') document.querySelector('#mobileToolbar').style.display = 'block';
              }}
            />
          </div>
        )}
        {props.icon === '2D' && (
          <div title="分屏">
            <Icon
              className={iconStyle.icon}
              icon={<AntdIcon type="iconfenping2-01" />}
              onClick={() => props.onClickSideIcon()}
            />
          </div>
        )}
      </Toolbar>
    </div>
  );
  return (
    <div
      className={`${style.miniWindow} ${props.className}`}
      style={props.style}
      ref={dom}
    >
      {props.showTitle && (
        <div
          className={style.title}
        >
          {
            isMobile && props.showCloseIcon && props.icon !== '3D' && props.title === "二维图纸" && props.icon !== "2D" ? (
              <span className={style.centerTitle}>{props.title}</span>
            ) : (
              <div className={style.name}>
                <img src={titleimg} alt="图片" />
                {props.title}
              </div>
            )
          }

          {isMobile && props.showCloseIcon && props.icon !== '3D' && props.title === "二维图纸" && props.icon !== "2D" ? (
            <AntdIcon
              type="iconback"
              className={style.iconClose}
              style={{
                position: 'absolute',
                left: '12px'
              }}
              onClick={ev => {
                ev.stopPropagation();
                props.onClose();
              }}
            />
          ) : (
            isMobile && props.icon === "2D" && props.title === "二维图纸" && (
              <AntdIcon
                type="iconclose"
                className={style.iconClose}
                onClick={ev => {
                  ev.stopPropagation();
                  props.onClose();
                }}
              />
            )
          )}
          {!isMobile && props.title === "二维图纸" && (
            <AntdIcon
              type="iconclose"
              className={style.iconClose}
              onClick={ev => {
                ev.stopPropagation();
                props.onClose();
              }}
            />
          )}
          {props.icon === '3D' && isMobile && (
            <AntdIcon
              type="iconclose"
              className={style.iconClose}
              onClick={ev => {
                ev.stopPropagation();
                // setShow(false);
                dom.current.style.zIndex = -1;
              }}
            />
          )}
        </div>
      )}
      <div
        className={style.container}
        style={{
          height: props.showTitle ? `calc(100% - ${TITLE_HEIGHT})` : '100%',
        }}
      >
        {props.children}

        {/* 工具条 */}
        {
          !isMobile ? PCTool : MobileTool
        }

      </div>
    </div>
  );
}

MiniWindow.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  icon: PropTypes.oneOf(['', '2D', '3D']),
  showTitle: PropTypes.bool.isRequired,
  showCloseIcon: PropTypes.bool,
  onClose: PropTypes.func,
  onClickMainIcon: PropTypes.func,
  onClickSideIcon: PropTypes.func,
  onClickPick: PropTypes.func,
  onLayer: PropTypes.func,
};

MiniWindow.defaultProps = {
  className: '',
  title: '',
  style: {},
  icon: '',
  showCloseIcon: true,
  onClose: () => { },
  onClickMainIcon: () => { },
  onClickSideIcon: () => { },
  onClickPick: () => { },
  onLayer: () => {},
};

export default forwardRef(MiniWindow);
