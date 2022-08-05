import React, { useState } from "react";
import PropTypes from "prop-types";
import { Popover } from 'antd';
import _ from "lodash-es";
import ColorPicker from "../../../ColorPicker";
import { AntdIcon } from "../../../utils/utils.js";
import style from "./SelectColor.less";
import Color from "../../../ColorPicker/Color.js";
import {
  convertRGBColorToHSV, convertHexColorToRGB, convertHSVColorToRGB, convertRGBColorToHex
} from "../../../ColorPicker/Util";

const DOM_COLOR = 0xffffff;

export default function SelectColor(props) {
  const {
    viewer,
    setColor,
    domColor,
    domOpacity,
    // color,
  } = props;
  const [visible, setVisible] = useState(false);
  function createColor(hex, alpha) {
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
  const popoverContentJSX = (
    <div>
      <ColorPicker
        isModal={false}
        onConfirm={(customColor) => {
          setVisible(false);
          setColor(customColor);
        }}
        onRestore={() => {
          let initColor = DOM_COLOR;
          initColor = `#${_.padStart(initColor.toString(16), 6, '0')}`;
          setVisible(false);
          const _initColor = createColor(initColor, 1);
          setColor(_initColor);
        }}
        hexColor={`#${_.padStart(domColor.toString(16), 6, '0')}`}
        alpha={domOpacity / 255}
      />
    </div>
  );
  return (
    <div className={style.container}>
      <Popover
        content={popoverContentJSX}
        destroyTooltipOnHide
        visible={visible}
        onVisibleChange={() => setVisible(!visible)}
        title={null}
        overlayClassName="annotation-ui-module-popver-wrap"
        trigger="click"
        placement="top"
        getPopupContainer={() => viewer.viewportDiv}
      >
        <div role="presentation" className={style.colorInputWrap} style={{ padding: 0 }}>
          <div
            style={{
              width: 36,
              backgroundColor: `#${_.padStart(domColor.toString(16), 6, '0')}`,
              opacity: domOpacity / 255
            }}
          />
          <div className={style.dropdown}><AntdIcon type="iconicon_arrowdown" /></div>
        </div>
      </Popover>
    </div>
  );
}

SelectColor.propTypes = {
  viewer: PropTypes.object.isRequired,
  setColor: PropTypes.func.isRequired,
  domColor: PropTypes.number.isRequired,
  domOpacity: PropTypes.number.isRequired,
  // color: PropTypes.string.isRequired,
};
