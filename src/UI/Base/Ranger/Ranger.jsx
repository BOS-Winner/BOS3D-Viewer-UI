import React from 'Libs/react';
import PropTypes from 'prop-types';
import _ from "lodash-es";
import { getNumber } from "UIutils/utils";
import style from "./style.less";

function getMouseX(e) {
  return getNumber(
    e.clientX,
    e.pageX,
    _.get(e, 'targetTouches[0].clientX'),
    _.get(e, 'targetTouches[0].pageX')
  );
}

/**
 * 范围滑动条
 * @constructor
 * @param {object} props
 * @param {number} props.min - 最小值
 * @param {number} props.max - 最大值
 * @param {number} props.step - 步进
 * @param {function} [props.onChange] - 值发生变化触发回调，回传变化后的值
 * @param {function} [props.onChangeEnd] - 用户松开鼠标后触发，回传变化后的值
 * @param {number} [props.value] - 当前值，用于受控场景
 * @param {number} [props.defaultValue] - 默认值
 */
function Ranger(props) {
  // 是否触发过onChange，用来控制onChangeEnd
  const hasChanged = React.useRef(false);
  const initLeft = React.useRef(0);
  const railRef = React.useRef(null);
  const [num, setNum] = React.useState(
    props.defaultValue === Infinity ? props.min : props.defaultValue
  );
  const _num = props.value === Infinity ? num : props.value;

  let acc = 0;
  const stepSplit = props.step.toString().split(".");
  if (stepSplit.length === 2) {
    acc = stepSplit[1].length;
  }

  // delta = nextValue - props.min
  const getCurNumberByDelta = delta => {
    let curNum = parseFloat((props.min + delta).toFixed(acc));
    if (curNum > props.max) curNum = props.max;
    if (curNum < props.min) curNum = props.min;
    return curNum;
  };

  const getCurNumber = curY => {
    let delta = (curY - initLeft.current)
      * (props.max - props.min)
      / parseFloat(getComputedStyle(railRef.current).width);
    delta = Math.round(delta / props.step) * props.step;
    return getCurNumberByDelta(delta);
  };

  const onKeyboardArrowPressed = ev => {
    if (ev.key === 'ArrowLeft') {
      ev.stopPropagation();
      setNum(n => getCurNumberByDelta(n - props.step - props.min));
    }
    if (ev.key === 'ArrowRight') {
      ev.stopPropagation();
      setNum(n => getCurNumberByDelta(n + props.step - props.min));
    }
  };

  const onMouseMove = _.throttle(e => {
    e.preventDefault();
    e.stopPropagation();
    const curY = getMouseX(e);
    setNum(getCurNumber(curY));
  }, 16);

  const onMouseUp = e => {
    e.preventDefault();
    e.stopPropagation();
    // prevStep.current = getMouseX(e);
    document.removeEventListener('mousemove', onMouseMove);
    if (hasChanged.current) {
      props.onChangeEnd(_num);
      hasChanged.current = false;
    }
  };

  const onMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // prevStep.current = getMouseX(e);
    initLeft.current = railRef.current.getBoundingClientRect().left;
    const curY = getMouseX(e);
    setNum(getCurNumber(curY));
    // 拖动滑动按钮要监听移动事件和键盘按下箭头事件，并在点击其它位置时移除按下箭头事件
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener(
      'mouseup',
      e2 => onMouseUp(e2),
      {
        once: true,
      }
    );
    document.addEventListener('keydown', onKeyboardArrowPressed);
    document.addEventListener(
      'mousedown',
      () => document.removeEventListener('keydown', onKeyboardArrowPressed),
      {
        once: true,
      }
    );
  };

  // 用来触发onChange
  React.useUpdateEffect(() => {
    props.onChange(num);
  }, [num]);

  // 触发onChangeEnd
  React.useUpdateEffect(() => {
    hasChanged.current = true;
  }, [_num]);

  return (
    <div
      className={style.container}
      role="presentation"
      onClick={ev => {
        ev.stopPropagation();
      }}
      onMouseDown={e => onMouseDown(e)}
    >
      <div
        ref={railRef}
        className={style.rail}
      />
      <div
        className={style.track}
        style={{
          width: `${100 * (_num - props.min) / (props.max - props.min)}%`
        }}
      />
      <div
        className={style.step}
        style={{
          left: `${100 * (_num - props.min) / (props.max - props.min)}%`
        }}
      />
    </div>
  );
}

Ranger.propTypes = {
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  step: PropTypes.number.isRequired,
  onChange: PropTypes.func,
  onChangeEnd: PropTypes.func,
  value: PropTypes.number,
  defaultValue: PropTypes.number,
};

Ranger.defaultProps = {
  value: Infinity,
  onChange: () => {},
  onChangeEnd: () => {},
  defaultValue: Infinity,
};

export default Ranger;
