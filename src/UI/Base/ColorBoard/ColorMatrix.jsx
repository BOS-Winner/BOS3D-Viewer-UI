import React from "react";
import PropTypes from "prop-types";
import style from "./style.less";

function ColorMatrix({ onClick }) {
  const baseColor = ["00", "55", "aa", "ff"];
  const content = [];
  let r = 0;
  let g = 0;
  let b = 0;
  let i = 0;
  let row = [];
  while (i < 64) {
    row.push((
      <div
        key={i}
        className={style["color-square"]}
        data-name="color-square"
        style={{
          backgroundColor: `#${baseColor[r]}${baseColor[g]}${baseColor[b]}`
        }}
      />
    ));
    i += 1;
    if (i % 8 === 0) {
      content.push((
        <div key={i} className={style.row}>{row}</div>
      ));
      row = [];
    }
    r = Math.round(i / 16 - 0.5);
    g = Math.round(i / 4 - 0.5) % 4;
    b = i % 4;
  }
  return ((
    <div
      className={style.colorMatrix}
      role="button"
      tabIndex={0}
      onClick={
        e => {
          if (e.target.getAttribute("data-name") === 'color-square') {
            const colorArr = e.target.style.backgroundColor
              .match(/\d+/g)
              .map(c => parseInt(c, 10));
            onClick(colorArr);
          }
        }
      }
    >
      {content}
    </div>
  ));
}

ColorMatrix.propTypes = {
  onClick: PropTypes.func,
};

ColorMatrix.defaultProps = {
  onClick: () => {}
};

export default ColorMatrix;
