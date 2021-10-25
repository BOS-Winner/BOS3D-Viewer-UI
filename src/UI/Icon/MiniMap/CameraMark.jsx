import React from "react";
import PropTypes from "prop-types";
import eye from "../img/white/camera_eye.png";
import area from "../img/white/camera_area.png";
import bg from "../img/white/camera_bg.png";

const initialImageSize = 200;
const maxImageWidth = 1024;
const minImageWidth = 100;

class CameraMark extends React.Component {
  constructor(props) {
    super(props);
    this.circleRadius = 8;
    this.viewArea = undefined;
    this.cameraDom = undefined;
    this.position = { x: 0, y: 0 };
    this.angle = 0;

    this.mapRef = React.createRef();
    this.svgRef = React.createRef();

    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this);
    this.onMouseClick = this.onMouseClick.bind(this);

    this.onMouseMoveRightButton = this.onMouseMoveRightButton.bind(this);
    this.onMouseUpRightButton = this.onMouseUpRightButton.bind(this);
    this.onMouseOutRightButton = this.onMouseOutRightButton.bind(this);
    this._isDragging = false;
    this._lastPoint = undefined;
    this._isFirstLoadMap = true;

    // 触摸事件参数
    this.preTouchPosition = {};
    this.translateX = 0;
    this.translateY = 0;
    this.scaleRatio = 1;
    this.scaleOrigin = {
      x: 0,
      y: 0
    };
    this.preTouchesClientx1y1x2y2 = [];
    this.originHaveSet = false;
  }

  componentDidMount() {
    this._initDom();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.cameraPositionInScene !== this.props.cameraPositionInScene) {
      this.updateCameraMarkPosition();
    }
    if (this.viewArea) {
      if (this.props.viewAreaVisible) {
        this.viewArea.style.display = "";
      } else {
        this.viewArea.style.display = "none";
      }
    }
  }

  render() {
    return (
      <svg
        ref={this.svgRef}
        onClick={e => this.onMapClick(e)}
        xmlns="http://www.w3.org/2000/svg"
        onWheel={(e) => this.onZoom(e)}
      >
        <image
          xlinkHref={this.props.currentMap ? this.props.currentMap.image : undefined}
          ref={this.mapRef}
          onLoad={() => this.onMapLoad()}
        />
      </svg>
    );
  }

  _initDom() {
    const svgNamespace = "http://www.w3.org/2000/svg";
    const group = document.createElementNS(svgNamespace, "g");

    const image3 = document.createElementNS(svgNamespace, "image");
    image3.ondragstart = function () { return false };
    image3.setAttributeNS('http://www.w3.org/1999/xlink', 'href', bg);
    image3.setAttributeNS(null, "x", -60);
    image3.setAttributeNS(null, "y", -60);
    image3.setAttributeNS(null, "width", 120);
    image3.setAttributeNS(null, "height", 120);
    group.appendChild(image3);

    const image2 = document.createElementNS(svgNamespace, "image");
    image2.ondragstart = function () { return false };
    image2.setAttributeNS('http://www.w3.org/1999/xlink', 'href', area);
    image2.setAttributeNS(null, "x", 0);
    image2.setAttributeNS(null, "y", -23);
    image2.setAttributeNS(null, "width", 36);
    image2.setAttributeNS(null, "height", 47);
    group.appendChild(image2);
    this.viewArea = image2;

    const image = document.createElementNS(svgNamespace, "image");
    image.ondragstart = function () { return false };
    image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', eye);
    image.setAttributeNS(null, "x", -15);
    image.setAttributeNS(null, "y", -15);
    image.setAttributeNS(null, "width", 30);
    image.setAttributeNS(null, "height", 30);
    image.style.pointerEvents = "none";
    group.appendChild(image);

    this.viewArea.addEventListener(this.props.isMobile ? "touchstart" : "mousedown", () => {
      this.svgRef.current.addEventListener(this.props.isMobile ? "touchmove" : "mousemove", this.onMouseMove);
      this.svgRef.current.addEventListener(this.props.isMobile ? "touchend" : "mouseup", this.onMouseUp);
      this.svgRef.current.addEventListener(this.props.isMobile ? "touchend" : "mouseleave", this.onMouseOut);

      this.svgRef.current.removeEventListener("mousemove", this.onMouseMoveRightButton);
      this.svgRef.current.removeEventListener("mouseup", this.onMouseUpRightButton);
      this.svgRef.current.removeEventListener("mouseleave", this.onMouseOutRightButton);
    });
    this.cameraDom = group;
    this.svgRef.current.appendChild(this.cameraDom);

    const recordPreTouchPosition = (touch) => {
      this.preTouchPosition = {
        x: touch.clientX,
        y: touch.clientY
      };
    };

    const getTranslate = (target) => {
      const cx = parseInt(target.getAttributeNS(null, "x"), 10);
      const cy = parseInt(target.getAttributeNS(null, "y"), 10);
      return {
        left: cx,
        top: cy
      };
    };

    const mapImg = this.mapRef.current;
    const svgBox = this.svgRef.current;

    const relativeCoordinate = (x, y, rect) => {
      const cx = (x - rect.left) / this.scaleRatio;
      const cy = (y - rect.top) / this.scaleRatio;
      return {
        x: cx,
        y: cy
      };
    };

    const setStyle = (key, value) => {
      mapImg.setAttributeNS(null, key, value);
    };

    // 触摸开始
    svgBox.addEventListener('touchstart', (event) => {
      const touches = event.touches;

      if (this._isDragging) {
        return;
      }
      if (touches.length > 1) {
        const one = touches[0];
        const two = touches[1];
        this.preTouchesClientx1y1x2y2 = [one.clientX, one.clientY, two.clientX, two.clientY];
        this.originHaveSet = false;
      }
      recordPreTouchPosition(touches[0]);
    });

    // 移动
    svgBox.addEventListener('touchmove', (e) => {
      if (this._isDragging) {
        return;
      }
      e.preventDefault();

      const touches = e.touches;
      if (touches.length === 1) { // 单手移动
        const oneTouch = touches[0];
        const translated = getTranslate(mapImg);
        this.translateX = oneTouch.clientX - this.preTouchPosition.x + translated.left;
        this.translateY = oneTouch.clientY - this.preTouchPosition.y + translated.top;
        setStyle('x', this.translateX);
        setStyle('y', this.translateY);
        setStyle('transform', `scale(${this.scaleRatio})`);
        recordPreTouchPosition(oneTouch);
        this.updateCameraMarkPosition();
      } else {
        const one = touches['0'];
        const two = touches['1'];
        const distance = (x1, y1, x2, y2) => {
          const a = x1 - x2;
          const b = y1 - y2;
          return Math.sqrt(a * a + b * b);
        };
        this.scaleRatio = distance(one.clientX, one.clientY, two.clientX, two.clientY)
          / distance(...this.preTouchesClientx1y1x2y2) * this.scaleRatio || 1;
        if (!this.originHaveSet) {
          this.originHaveSet = true;
          // 移动视线中心
          const origin = relativeCoordinate((
            one.clientX + two.clientX) / 2,
          (one.clientY + two.clientY) / 2,
          mapImg.getBoundingClientRect());
          // 修正视野变化带来的平移量
          this.translateX = (this.scaleRatio - 1) * (origin.x - this.scaleOrigin.x)
          + this.translateX;
          this.translateY = (this.scaleRatio - 1) * (origin.y - this.scaleOrigin.y)
          + this.translateY;
          setStyle('transform-origin', `${origin.x}px ${origin.y}px`);
          this.scaleOrigin = origin;
        }
        setStyle('x', this.translateX);
        setStyle('y', this.translateY);
        setStyle('transform', `scale(${this.scaleRatio})`);
        this.preTouchesClientx1y1x2y2 = [one.clientX, one.clientY, two.clientX, two.clientY];
        this.updateCameraMarkPosition();
      }
      e.preventDefault();
    });

    // 触摸完成
    svgBox.addEventListener('touchend', (e) => {
      const touches = e.touches;
      if (touches.length === 1) {
        recordPreTouchPosition(touches[0]);
      }
    });

    // 触摸取消
    svgBox.addEventListener('touchcancel', (e) => {
      const touches = e.touches;
      if (touches.length === 1) {
        recordPreTouchPosition(touches['0']);
      }
    });

    this.svgRef.current.addEventListener("mousedown", (e) => {
      if (e.button === 2) {
        this._lastPoint = {
          x: e.clientX,
          y: e.clientY
        };
        this.svgRef.current.addEventListener("mousemove", this.onMouseMoveRightButton);
        this.svgRef.current.addEventListener("mouseup", this.onMouseUpRightButton);
        this.svgRef.current.addEventListener("mouseleave", this.onMouseOutRightButton);
      }
    });
  }

  onMapLoad() {
    if (this._isFirstLoadMap) {
      const svg = this.svgRef.current;
      const rect = svg.getBoundingClientRect();
      const image = this.mapRef.current;
      image.setAttributeNS(null, "x", (rect.width - initialImageSize) / 2);
      image.setAttributeNS(null, "y", (rect.height - initialImageSize) / 2);
      image.setAttributeNS(null, "width", initialImageSize);
      image.setAttributeNS(null, "height", initialImageSize);
      this.updateCameraMarkPosition();
      this._isFirstLoadMap = false;
    }
  }

  onMouseClick(e) {
    e.stopPropagation();
    this.svgRef.current.removeEventListener("click", this.onMouseClick);
  }

  onZoom(e) {
    const delta = e.deltaY;
    const x = e.nativeEvent.clientX;
    const y = e.nativeEvent.clientY;
    const image = this.mapRef.current;
    const rect = image.getBoundingClientRect();
    const svgRect = this.svgRef.current.getBoundingClientRect();
    let offsetX = x - rect.left;
    let offsetY = y - rect.top;
    let width = parseInt(image.getAttributeNS(null, "width"), 10);
    const mag = 1.05;
    const min = 0.95;
    if (delta < 0 && width < maxImageWidth) {
      width *= mag;
      offsetX *= mag;
      offsetY *= mag;
    } else if (delta > 0 && width > minImageWidth) {
      width *= min;
      offsetX *= min;
      offsetY *= min;
    }
    image.setAttributeNS(null, "x", x - offsetX - svgRect.left);
    image.setAttributeNS(null, "y", y - offsetY - svgRect.top);
    image.setAttributeNS(null, "width", width);
    image.setAttributeNS(null, "height", width);
    this.updateCameraMarkPosition();
  }

  onMouseMove(e) {
    e.stopPropagation();
    e.preventDefault();

    this._isDragging = true;
    const { isMobile } = this.props;
    let x = 0;
    let y = 0;
    if (isMobile) {
      const [touch] = e.touches;
      x = touch.clientX;
      y = touch.clientY;
    } else {
      x = e.offsetX;
      y = e.offsetY;
    }

    const dx = x - this.position.x;
    const dy = y - this.position.y;
    let angle = Math.atan2(dy, dx);
    if (angle < 0) {
      angle += 2 * Math.PI;
    }
    this.update(this.position, angle * 180 / Math.PI);
  }

  onMouseMoveRightButton(e) {
    // 右键移动
    let x = e.clientX;
    let y = e.clientY;
    if (!this._lastPoint) {
      this._lastPoint = {
        x,
        y
      };
      return;
    }
    x -= this._lastPoint.x;
    y -= this._lastPoint.y;
    const image = this.mapRef.current;

    let cx = parseInt(image.getAttributeNS(null, "x"), 10);
    let cy = parseInt(image.getAttributeNS(null, "y"), 10);

    cx += x;
    cy += y;
    image.setAttributeNS(null, "x", cx);
    image.setAttributeNS(null, "y", cy);
    this._lastPoint = {
      x: e.clientX,
      y: e.clientY
    };
    this.updateCameraMarkPosition();
  }

  onMouseUpRightButton() {
    this.svgRef.current.removeEventListener("mousemove", this.onMouseMoveRightButton);
    this.svgRef.current.removeEventListener("mouseup", this.onMouseUpRightButton);
    this.svgRef.current.removeEventListener("mouseleave", this.onMouseOutRightButton);
  }

  onMouseOutRightButton() {
    this._lastPoint = undefined;
    this.svgRef.current.removeEventListener("mousemove", this.onMouseMoveRightButton);
    this.svgRef.current.removeEventListener("mouseup", this.onMouseUpRightButton);
    this.svgRef.current.removeEventListener("mouseleave", this.onMouseOutRightButton);
  }

  onMouseUp(e) {
    e.stopPropagation();
    this.svgRef.current.removeEventListener(this.props.isMobile ? "touchmove" : "mousemove", this.onMouseMove);
    this.svgRef.current.removeEventListener("mouseup", this.onMouseUp);
    // “mouseleave”比“mouseout”好使
    this.svgRef.current.removeEventListener("mouseleave", this.onMouseOut);
    if (this._isDragging) {
      // 主要是为了禁止click事件传播到react组件中
      this.svgRef.current.addEventListener("click", this.onMouseClick);
      if (this.props.onCameraRotate) {
        this.props.onCameraRotate(this.angle);
      }
    }
    this._isDragging = false;
    this._lastPoint = undefined;
  }

  onMouseOut(e) {
    e.stopPropagation();
    if (e.target === e.currentTarget) {
      this.svgRef.current.removeEventListener("mousemove", this.onMouseMove);
      this.svgRef.current.removeEventListener("mouseup", this.onMouseUp);
      // “mouseleave”比“mouseout”好使
      this.svgRef.current.removeEventListener("mouseleave", this.onMouseOut);
      if (this._isDragging) {
        if (this.props.onCameraRotate) {
          this.props.onCameraRotate(this.angle);
        }
      }
    }
  }

  updateCameraMarkPosition() {
    // 思路：先求出3D世界里相机相对于楼层包围盒最小点的相对位置
    // 然后转换为相对图片左下角的相对位置，最后得出相对svg的位置
    const map = this.props.currentMap;
    if (map) {
      // map属性 (x1,y1,z1)位于图片左下角，(x2,y2,z2)位于右上角
      let deltaX = this.props.cameraPositionInScene.x - (map.box.x1 - map.box.offsetX);
      let deltaY = this.props.cameraPositionInScene.y - (map.box.y1 - map.box.offsetY);
      const rect = this.mapRef.current.getBoundingClientRect();
      const factor = map.sceneWidth / rect.width;
      // 3D世界大小转换为css大小
      deltaX /= factor;
      deltaY /= factor;

      const svgRect = this.svgRef.current.getBoundingClientRect();
      const x = rect.left + deltaX - svgRect.left;
      const y = rect.bottom - deltaY - svgRect.top;
      this.update({
        x: Math.max(this.circleRadius,
          Math.min(x, svgRect.width - this.circleRadius)
        ),
        y: Math.max(this.circleRadius,
          Math.min(y, svgRect.height - this.circleRadius)
        )
      }, this.props.cameraPositionInScene.angle);
    }
  }

  onMapClick(e) {
    const map = this.props.currentMap;
    if (map) {
      // map属性 (x1,y1,z1)位于图片左下角，是包围盒最小坐标，(x2,y2,z2)位于右上角，是包围盒最大坐标
      const rect = this.mapRef.current.getBoundingClientRect();
      const factor = map.sceneWidth / rect.width;
      let deltaX = e.nativeEvent.clientX - rect.left;
      let deltaY = e.nativeEvent.clientY - rect.bottom;
      deltaX *= factor;
      deltaY *= factor;
      const x = map.box.x1 - map.box.offsetX + deltaX;
      const y = map.box.y1 - map.box.offsetY - deltaY;
      // 1650表示人的高度
      const z = Math.min(map.box.z1 + 1650,
        (map.box.z1 + map.box.z2) / 2);
      if (this.props.onMapClick) {
        this.props.onMapClick({ x, y, z });
      }
    }
  }

  update(position, angle) {
    if (position) {
      this.position = position;
    }

    if (angle) {
      this.angle = angle;
    }

    const transform = `rotate(${this.angle}, ${this.position.x}, ${this.position.y}) translate(${this.position.x},${this.position.y})`;
    this.cameraDom.setAttributeNS(null, "transform", transform);
  }
}

CameraMark.propTypes = {
  onCameraRotate: PropTypes.func,
  currentMap: PropTypes.object,
  cameraPositionInScene: PropTypes.object,
  onMapClick: PropTypes.func,
  viewAreaVisible: PropTypes.bool,
  isMobile: PropTypes.bool,
};

CameraMark.defaultProps = {
  onCameraRotate: undefined,
  currentMap: undefined,
  cameraPositionInScene: undefined,
  onMapClick: undefined,
  viewAreaVisible: true,
  isMobile: false,
};

export default CameraMark;
