import React, { createRef } from "react";
import PropTypes from "prop-types";
import style from "./style.less";

const INIT_DATA = [];
for (let i = -90; i <= 90; i++) {
  INIT_DATA.push(i);
}

export default class Picker extends React.Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired,
    value: PropTypes.number,
    min: PropTypes.number,
    max: PropTypes.number,
  };

  static defaultProps = {
    value: 0,
    min: 0,
    max: 180
  }

  DEFAULT_DURATION = 200;

  MIN_DISTANCE = 10;

  // 惯性滑动思路:
  // 在手指离开屏幕时，如果和上一次 move 时的间隔小于 `MOMENTUM_LIMIT_TIME` 且 move
  // 距离大于 `MOMENTUM_LIMIT_DISTANCE` 时，执行惯性滑动
  MOMENTUM_LIMIT_TIME = 30;

  MOMENTUM_LIMIT_DISTANCE = 15;

  // supportsPassive = false;

  constructor(props) {
    super(props);
    this.initValue();
    this._initValue();
    this.resetTouchStatus();
    this.initComputed();
    this.pickerColumnRef = createRef();
    this.wrapperContainerRef = createRef();
  }

  componentDidMount() {
    this.setEleStyle();
    this.onMounted();
  }

  componentWillUnmount() {
    this.unbindTouchEvent();
  }

  // 初始化--用户变量
  initValue() {
    // 可是区域子元素个数
    this.visibleItemCount = 6;
    // 子元素高度
    this.itemPxHeight = 44;
    // 初始化传入的数据列表（当前案例微用到，可结合框架使用）
    this.initOptions = INIT_DATA;
    // 初始显示元素（当前案例未使用，可结合框架扩展）
    this.defaultIndex = this.props.value;
  }

  // 私有变量
  _initValue() {
    this.offset = 0;
    this.duration = 0;
    this.options = this.initOptions;
    this.deltaX = 0;
    this.deltaY = 0;
    this.offsetX = 0;
    this.offsetY = 0;

    this.startX = 0;
    this.startY = 0;

    this.moving = false;
    this.startOffset = 0;

    this.transitionEndTrigger = null; // 滚动函数
    this.touchStartTime = 0; // 记录开始滑动时间
    this.momentumOffset = 0; // 记录开始滑动位置

    this.currentIndex = this.defaultIndex;
    if (this.currentIndex) {
      this.offset = -this.itemPxHeight * this.currentIndex;
    }
  }

  // 根据传入变量--获取计算属性
  initComputed() {
    // 外层容器高度
    this.wrapHeight = this.itemPxHeight * this.visibleItemCount;
    this.count = this.options.length;
    this.baseOffset = (this.itemPxHeight * (this.visibleItemCount - 1)) / 2;
    // 内层元素高度计算
    this.wrapperStyle = {
      transform: `translate3d(0, ${this.offset + this.baseOffset}px, 0)`,
      transitionDuration: `${this.duration}ms`,
      transitionProperty: this.duration ? 'all' : 'none',
    };
  }

  // 设置外部容器的样式及遮罩层
  setEleStyle() {
    const columnItem = this.wrapperContainerRef.current.querySelectorAll('.column-item');
    this.setUlStyle();
    this.setColumnHeight(columnItem);
  }

  // 滑动主要逻辑--动态设置容器的垂直方向偏移量
  setUlStyle() {
    const wrapperContainer = this.wrapperContainerRef.current; // document.querySelector('.wrapper-container');
    wrapperContainer.style.transform = this.wrapperStyle.transform;
    wrapperContainer.style.transitionDuration = this.wrapperStyle.transitionDuration;
    wrapperContainer.style.transitionProperty = this.wrapperStyle.transitionProperty;
  }

  setUlTransform() {
    this.initComputed();
    this.setUlStyle();
  }

  // 设置每个行元素的高度及点击事件
  setColumnHeight(columnItem) {
    columnItem.forEach((item, index) => {
      item.style.height = `${this.itemPxHeight}px`;
      item.tabindex = index;
      item.onclick = () => {
        this.onClickItem(index);
        this.setUlTransform();
      };
    });
  }

  // 点击单个行元素
  onClickItem = (index) => {
    if (this.moving) {
      return;
    }
    this.transitionEndTrigger = null;
    this.duration = this.DEFAULT_DURATION;
    this.setIndex(index, true);
  }

  // 初始化完成--执行事件绑定
  onMounted() {
    this.bindTouchEvent();
  }

  bindTouchEvent() {
    const el = this.pickerColumnRef.current; // document.querySelector('.picker-column');
    const {
      onTouchStart, onTouchMove, onTouchEnd, onTransitionEnd
    } = this;
    const wrapper = this.wrapperContainerRef.current; // document.querySelector('.wrapper-container');

    this.on(el, 'touchstart', onTouchStart);
    this.on(el, 'touchmove', onTouchMove);
    this.on(wrapper, 'transitionend', onTransitionEnd);

    if (onTouchEnd) {
      this.on(el, 'touchend', onTouchEnd);
      this.on(el, 'touchcancel', onTouchEnd);
    }
  }

  unbindTouchEvent() {
    const el = this.pickerColumnRef.current; // document.querySelector('.picker-column');
    const wrapper = this.wrapperContainerRef.current; // document.querySelector('.wrapper-container');
    const {
      onTouchStart, onTouchMove, onTouchEnd, onTransitionEnd
    } = this;
    this.off(el, 'touchstart', onTouchStart);
    this.off(el, 'touchmove', onTouchMove);
    this.off(wrapper, 'transitionend', onTransitionEnd);

    if (onTouchEnd) {
      this.off(el, 'touchend', onTouchEnd);
      this.off(el, 'touchcancel', onTouchEnd);
    }
  }

  on(target, event, handler) {
    target.addEventListener(
      event,
      handler,
      { capture: false, passive: false }
    );
  }

  off(target, event, handler) {
    target.removeEventListener(
      event,
      handler,
      { capture: false, passive: false }
    );
  }

  // 动画结束事件
  onTransitionEnd = () => {
    this.stopMomentum();
  }

  // 滑动结束后数据获取及优化处理
  stopMomentum() {
    const { min, max, type } = this.props;
    this.moving = false;
    this.duration = 0;

    if (this.transitionEndTrigger) {
      this.transitionEndTrigger();
      this.transitionEndTrigger = null;
    }
    if (type === 'min' && (this.currentIndex) >= (max)) {
      this.duration = this.DEFAULT_DURATION;
      this.setIndex(max);
      this.setUlTransform();
    }
    if (type === 'max' && (this.currentIndex) <= (min)) {
      this.duration = this.DEFAULT_DURATION;
      this.setIndex(min);
      this.setUlTransform();
    }
    // console.log('min', min);
    // console.log('max', max);
    // console.log(this.currentIndex, 'this.currentIndex');
  }

  // 开始滑动
  onTouchStart = (event) => {
    const wrapper = this.wrapperContainerRef.current; // document.querySelector('.wrapper-container');
    this.touchStart(event);

    if (this.moving) {
      const translateY = this.getElementTranslateY(wrapper);
      this.offset = Math.min(0, translateY - this.baseOffset);
      this.startOffset = this.offset;
    } else {
      this.startOffset = this.offset;
    }

    this.duration = 0;
    this.transitionEndTrigger = null;
    this.touchStartTime = Date.now();
    this.momentumOffset = this.startOffset;

    // 设置滑动
    this.setUlTransform();
  }

  touchStart(event) {
    this.resetTouchStatus();
    this.startX = event.touches[0].clientX;
    this.startY = event.touches[0].clientY;
  }

  // 重置滑动数据变量
  resetTouchStatus() {
    this.deltaX = 0;
    this.deltaY = 0;
    this.offsetX = 0;
    this.offsetY = 0;
  }

  // 动态获取元素滑动距离--关键
  getElementTranslateY(element) {
    const _style = window.getComputedStyle(element);
    const transform = _style.transform || _style.webkitTransform;
    const translateY = transform.slice(7, transform.length - 1).split(', ')[5];
    return Number(translateY);
  }

  onTouchMove = (event) => {
    this.touchMove(event);

    const { min, max } = this.props;

    this.moving = true;
    this.preventDefault(event, true);

    this.offset = this.range(this.startOffset + this.deltaY, -(this.count * this.itemPxHeight), this.itemPxHeight);

    const now = Date.now();
    if (now - this.touchStartTime > this.MOMENTUM_LIMIT_TIME) {
      this.touchStartTime = now;
      this.momentumOffset = this.offset;
    }

    // 滑动中
    this.setUlTransform();
  }

  onTouchEnd = () => {
    const distance = this.offset - this.momentumOffset;
    const duration = Date.now() - this.touchStartTime;
    const allowMomentum = duration < this.MOMENTUM_LIMIT_TIME && Math.abs(distance) > this.MOMENTUM_LIMIT_DISTANCE;

    // if (allowMomentum) {
    // // 惯性滑动卡，先隐藏
    //   this.momentum(distance, duration);
    //   return;
    // }

    const index = this.getIndexByOffset(this.offset);
    this.duration = this.DEFAULT_DURATION;
    this.setIndex(index, true);

    // 滑动结束
    this.setUlTransform();

    // compatible with desktop scenario
    // use setTimeout to skip the click event triggered after touchstart
    setTimeout(() => {
      this.moving = false;
    }, 0);
  }

  // 滑动动画函数--关键
  momentum(distance, duration) {
    const speed = Math.abs(distance / duration);

    distance = this.offset + (speed / 0.003) * (distance < 0 ? -1 : 1);

    const index = this.getIndexByOffset(distance);

    this.duration = Number(this.swipeDuration);
    this.setIndex(index, true);
  }

  // 获取当前展示的元素数据信息--关键
  setIndex = (index, emitChange) => {
    index = this.adjustIndex(index);

    const offset = -index * this.itemPxHeight;

    const trigger = () => {
      if (index !== this.currentIndex) {
        this.currentIndex = index;

        if (emitChange) {
          this.props.onChange(index, this.props.type);
          // console.log(index);
        }
      }
    };

    // trigger the change event after transitionend when moving
    if (this.moving && offset !== this.offset) {
      this.transitionEndTrigger = trigger;
    } else {
      trigger();
    }

    this.offset = offset;
  }

  // getValue() {
  //   return this.options[this.currentIndex];
  // }

  adjustIndex(index) {
    index = this.range(index, 0, this.count);

    for (let i = index; i < this.count; i++) {
      if (!this.isOptionDisabled(this.options[i])) return i;
    }

    for (let i = index - 1; i >= 0; i--) {
      if (!this.isOptionDisabled(this.options[i])) return i;
    }

    return '';
  }

  isOptionDisabled(option) {
    return this.isObject(option) && option.disabled;
  }

  isObject(val) {
    return val !== null && typeof val === 'object';
  }

  // 滑动偏移量
  getIndexByOffset(offset) {
    return this.range(Math.round(-offset / this.itemPxHeight), 0, this.count - 1);
  }

  // 阻止默认行为
  preventDefault(event, isStopPropagation) {
    /* istanbul ignore else */
    if (typeof event.cancelable !== 'boolean' || event.cancelable) {
      event.preventDefault();
    }

    if (isStopPropagation) {
      this.stopPropagation(event);
    }
  }

  stopPropagation(event) {
    event.stopPropagation();
  }

  touchMove(event) {
    const touch = event.touches[0];
    this.deltaX = touch.clientX - this.startX;
    this.deltaY = touch.clientY - this.startY;
    this.offsetX = Math.abs(this.deltaX);
    this.offsetY = Math.abs(this.deltaY);
  }

  // 滑动范围限制--关键代码
  range(num, min, max) {
    return Math.min(Math.max(num, min), max);
  }

  render() {
    return (
      <div ref={this.pickerColumnRef} className={style.pickerColumn}>
        <ul ref={this.wrapperContainerRef} className="wrapper-container">
          {
            INIT_DATA.map((item) => <li key={item} className="column-item">{item}</li>)
          }
        </ul>
      </div>

    );
  }
}
