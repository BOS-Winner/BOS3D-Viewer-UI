import React from 'react';
import PropTypes from "prop-types";
import style from "./style.less";

function CoordEditor(props) {
  const [x, y, z] = props.coord;
  const xRef = React.useRef(null);
  const yRef = React.useRef(null);
  const zRef = React.useRef(null);
  const onChange = React.useCallback(ev => {
    ev.preventDefault();
    ev.stopPropagation();
    const _x = Number(xRef.current.value);
    const _y = Number(yRef.current.value);
    const _z = Number(zRef.current.value);
    props.onChange([_x, _y, _z]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={style.coordEditor} onChange={onChange}>
      <div>
        <span>X</span>
        <input type="number" value={x} ref={xRef} step={1} onChange={() => {}} />
      </div>
      <div>
        <span>Y</span>
        <input type="number" value={y} ref={yRef} step={1} onChange={() => {}} />
      </div>
      <div>
        <span>Z</span>
        <input type="number" value={z} ref={zRef} step={1} onChange={() => {}} />
      </div>
    </div>
  );
}

CoordEditor.propTypes = {
  coord: PropTypes.arrayOf(PropTypes.number).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default CoordEditor;
