import React, { createRef } from 'react';
import style from './style.less';
import IconItem from './IconItem/IconItem';

const BUTTON_ICONS = {
  zoomOutIcon: 'iconnarrow',
  zoomInIcon: 'iconenlarge',
  dragIcon: 'iconhand',
};

const MAX_SCALE = 3;
const MIN_SCALE = 0.1;

export default class ImgPreview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scale: 1,
      isDrag: false// 正在拖动
    };
    this._dragStart = null;
    this.previewWrapRef = createRef();
    this.background = '';
  }

  componentDidMount() {
    const $viewDom = document.getElementById('viewport');
    if ($viewDom) {
      this.background = $viewDom.style.background || '';
    }
  }

  onToggleDrag() {
    if (this.state.scale <= 1) return;
    this.setState({
      isDrag: !this.state.isDrag
    });
  }

  // 滚轮缩放
  wheelScale = (e) => {
    // e.preventDefault()
    if (this.state.isDrag) return;
    if (e.deltaY > 0) {
      this.toggleScale('plus');
    } else {
      this.toggleScale('sub');
    }
  }

  toggleScale(type) {
    this.setState({
      isDrag: false
    });
    const increment = type === 'plus' ? 0.1 : -0.1;
    let scale = this.state.scale + increment;
    if (scale < MIN_SCALE) {
      scale = MIN_SCALE;
    }
    if (scale > MAX_SCALE) {
      scale = MAX_SCALE;
    }
    this.setState({
      scale
    });
  }

  onMouseUp = () => {
    this._dragStart = null;
  }

  onMouseDown = (event) => {
    this._dragStart = { x: event.nativeEvent.offsetX, y: event.nativeEvent.offsetY };
  }

  onMouseMove = (event) => {
    if (!this.state.isDrag) return;
    const { _dragStart } = this;
    // 拖动画布
    if (_dragStart) {
      const x = event.nativeEvent.offsetX;
      const y = event.nativeEvent.offsetY;
      const deltaX = x - _dragStart.x;
      const deltaY = y - _dragStart.y;
      const parent = this.previewWrapRef.current;
      parent.scrollLeft -= deltaX;
      parent.scrollTop -= deltaY;
    }
  }

  render() {
    const { scale, isDrag } = this.state;
    const {
      visible, width, height, imgSrc
    } = this.props;
    // console.log(this.props, 'this.props')
    // console.log(scale, 'scale')
    const contentStyle = { transform: `scale(${scale})`, background: this.background };

    const MAIN_DOM = imgSrc ? <img src={imgSrc} alt="预览" /> : this.props.children;

    return (
      <div
        className={style.container}
        onWheel={this.wheelScale}
        onMouseDown={(event) => {
          // 此方法可以阻止双击模式下，导致某些文字被选中的问题
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        <div ref={this.previewWrapRef} className={style.previewWrapper}>
          <div
            className="contentRef"
            ref={this.contentRef}
            onMouseDown={this.onMouseDown}
            onMouseMove={this.onMouseMove}
            onMouseUp={this.onMouseUp}
            style={contentStyle}
          >
            {MAIN_DOM}
          </div>
        </div>
        <div className={style.footer}>
          <div onClick={this.onToggleDrag.bind(this)}>
            <IconItem
              title="移动"
              selected={isDrag}
              disabled={scale <= 1}
              icon={BUTTON_ICONS.dragIcon}
            />
          </div>
          <div onClick={this.toggleScale.bind(this, 'plus')}>
            <IconItem
              title="放大"
              disabled={scale >= MAX_SCALE}
              icon={BUTTON_ICONS.zoomInIcon}
            />
          </div>
          <div onClick={this.toggleScale.bind(this, 'sub')}>
            <IconItem
              title="缩小"
              disabled={scale <= MIN_SCALE}
              icon={BUTTON_ICONS.zoomOutIcon}
            />
          </div>
        </div>
      </div>
    );
  }
}
