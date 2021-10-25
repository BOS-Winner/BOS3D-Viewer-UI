class AxisController {
  constructor(props) {
    this.viewer = props.viewer;
    this.show = false;
    this.config = {
      width: 280,
      height: 50,
      middleLineColor: 'rgba(254, 159, 10, 1)',
      start: 0,
      end: 720,
      def: 360,
      capacity: 1,
      unit: 6, // 刻度间隔5个像素
      background: '',
      scaleLineColor: '#fff',
      openUnitChange: true, // 是否开启间隔刻度变更
      fontColor: '#fff',
      fontSize: "14px"
    };
    this.dpr = 1;
    this.callBack = props.callback;
    this.pointX = 0;
    this.startValue = 0;
  }

  init() {
    // 创建容器
    this.container = document.createElement("div");
    // 挂载到需要挂载的容器中
    this.viewer.getViewerImpl().domElement.appendChild(this.container);

    // 创建title
    this.title = document.createElement("div");
    // 主标题
    this._mainTitle = document.createElement("span");
    this._mainTitle.innerText = "轴向旋转控制";
    // tip
    this._tip = document.createElement("span");
    this._tip.innerText = "拖动刻度区域可沿Z轴转动模型";
    this.title.appendChild(this._mainTitle);
    this.title.appendChild(this._tip);

    // 创建rulerContainer
    this.rulerContainer = document.createElement("div");
    this.container.appendChild(this.title);
    this.container.appendChild(this.rulerContainer);

    // 设置样式
    this._setStyle();

    // 生成尺子
    this.createRuler();
  }

  /**
   * 设置样式
   */
  _setStyle() {
    // container style
    this.container.style = `
        position: absolute;
        top: 300px;
        right: 20px;
        background: rgba(27, 27, 27, 0.9);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        display: ${this.show ? 'flex' : 'none'};
        flex-direction: column;
    `;
    // title style
    this.title.style = `
        width: 100%;
        height: 35px;
        display: flex;
        align-items: flex-end;
        padding: 0 0 2px 9px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    `;
    // main title style
    this._mainTitle.style = `
        font-size: 16px;
        font-family: PingFangSC-Medium, PingFang SC;
        font-weight: 500;
        color: #FFFFFF;
    `;
    this._tip.style = `
        font-size: 12px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #DDDDDD;
        display: inline-block;
        margin: 0 0 0 5px;
    `;
    this.rulerContainer.style = `
        height: 110px;
        width: 295px;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
  }

  /**
   * 创建尺子
   */
  createRuler() {
    this.middleLine = document.createElement("canvas");
    this.rulerContainer.appendChild(this.middleLine);
    this.ctx = this.middleLine.getContext('2d');
    this.middleLine.height = this.dpr * this.config.height;
    this.middleLine.width = this.dpr * this.config.width;
    this.ctx.scale(this.dpr, this.dpr);
    this.drawScale();
    this.drawMidLine(this.ctx);
    this.addEvent();
  }

  /**
   * 画中心刻度线
   * @param {object} ctx canvas执行上下文
   */
  drawMidLine(ctx) {
    const midX = Math.floor(this.config.width / 2);
    ctx.beginPath();
    ctx.fillStyle = this.config.middleLineColor;
    ctx.fillRect(midX - 1, this.config.height / 3, 2, this.config.height);
    ctx.stroke();
    ctx.moveTo(midX, this.config.height - 8);
    ctx.lineTo(midX - 5, this.config.height - 2);
    ctx.lineTo(midX - 5, this.config.height);
    ctx.lineTo(midX + 5, this.config.height);
    ctx.lineTo(midX + 5, this.config.height - 2);
    ctx.fill();
    ctx.closePath();
  }

  /**
   * 画刻度尺
   */
  drawScale() {
    this.scale = document.createElement("canvas");
    const scaleCtx = this.scale.getContext("2d");

    const mid = this.config.end - this.config.start + 1; // 取值范围

    const scaleLen = Math.ceil(mid / this.config.capacity); // 刻度条数
    const space = Math.floor(this.config.width / 2); // 左右两边间隙，根据该值计算整数倍刻度值画线
    const beginNum = Math.ceil(this.config.start / this.config.capacity) * this.config.capacity;
    const st = (Math.ceil(this.config.start / this.config.capacity)
      - this.config.start / this.config.capacity) * this.config.unit;

    // 设置canvas_bg宽高
    this.scale.width = (this.config.unit * (scaleLen - 1) + this.config.width) * this.dpr;
    this.scale.height = this.config.height * this.dpr;
    scaleCtx.scale(this.dpr, this.dpr);

    scaleCtx.beginPath();
    scaleCtx.fillStyle = this.config.background || 'transparent'; // 背景色
    scaleCtx.fillRect(0, 0, this.scale.width, this.config.height);
    scaleCtx.closePath();
    // 底线
    // scaleCtx.beginPath();
    // scaleCtx.moveTo(0, this.config.height);
    // scaleCtx.lineTo(this.scale.width, this.config.height);
    // scaleCtx.strokeStyle = this.config.scaleLineColor || '#9E9E9E';
    // scaleCtx.lineWidth = 1;
    // scaleCtx.stroke();
    // scaleCtx.closePath();

    // 绘制刻度线
    for (let i = 0; i < scaleLen; i++) {
      scaleCtx.beginPath();
      scaleCtx.strokeStyle = this.config.scaleLineColor || "#9E9E9E";
      scaleCtx.font = this.config.fontSize;
      scaleCtx.fillStyle = this.config.fontColor;
      scaleCtx.textAlign = 'center';
      scaleCtx.shadowBlur = 0;

      const curPoint = i * this.config.unit + space + st;
      const curNum = i * this.config.capacity + beginNum;
      if (curNum % (this.config.capacity * 10) === 0) {
        scaleCtx.moveTo(curPoint, (Number(this.config.height)) / 3);
        scaleCtx.strokeStyle = this.config.scaleLineColor || "rgba(71, 71, 74, 1)";
        scaleCtx.shadowColor = '#9e9e9e';
        scaleCtx.shadowBlur = 1;
        scaleCtx.fillText(
          curNum > 360 ? `${curNum - 360}˚` : `${curNum}˚`,
          curPoint,
          (Number(this.config.height)) / 6
        );
      } else if (curNum % (this.config.capacity * 5) === 0) {
        scaleCtx.moveTo(curPoint, (this.config.height * 2) / 5);
        scaleCtx.strokeStyle = this.config.scaleLineColor || "rgba(71, 71, 74, 1)";
        if (scaleLen <= 10) {
          scaleCtx.font = '12px Helvetica, Tahoma, Arial';
          scaleCtx.fillText(
            curNum,
            curPoint,
            (Number(this.config.height)) / 3
          );
        }
      } else {
        scaleCtx.moveTo(curPoint, (this.config.height * 4) / 7);
        if (i === 0 || i === scaleLen - 1) {
          scaleCtx.font = '12px Helvetica, Tahoma, Arial';
          scaleCtx.fillText(
            curNum,
            curPoint,
            (this.config.height * 2) / 4
          );
        }
      }
      scaleCtx.lineTo(curPoint, this.config.height - 8);
      scaleCtx.stroke();
      scaleCtx.closePath();
    }

    this.pointX = (this.config.def - this.config.start) / this.config.capacity * this.config.unit; // 初始化开始位置
    const imageData = scaleCtx.getImageData(
      this.pointX * this.dpr,
      0,
      this.config.width * this.dpr,
      this.config.height * this.dpr
    );
    this.ctx.putImageData(imageData, 0, 0);
    // this.addEvent();
  }

  // 事件交互 (第一种方案)
  addEvent() {
    let beginX = 0; // 手指x坐标
    let ifMove = false; // 是否开始交互
    let moveDistance = 0;

    // 注册事件，移动端和PC端
    const hasTouch = 'ontouchstart' in window;
    const startEvent = hasTouch ? 'touchstart' : 'mousedown';
    const moveEvent = hasTouch ? 'touchmove' : 'mousemove';
    const endEvent = hasTouch ? 'touchend' : 'mouseup';
    const moveOutEvent = 'mouseout';

    const start = (e) => {
      e.stopPropagation();
      e.preventDefault();
      ifMove = true;
      if (!e.touches) {
        beginX = e.pageX;
      } else {
        beginX = e.touches[0].pageX;
      }
      this.startValue = this.pointX * this.config.capacity / this.config.unit + this.config.start;
    };

    const move = (e) => {
      e.stopPropagation();
      e.preventDefault();
      const that = this;
      const currentX = e.touches ? e.touches[0].pageX : e.pageX;
      if (ifMove) {
        moveDistance = currentX - beginX;
        beginX = currentX;
        this.pointX -= moveDistance; // 刻度偏移量
        // const space = Math.floor(this.config.width / 2);
        // console.log(this.pointX, '指针');
        // 边界值处理
        if (this.pointX <= 0) {
          this.pointX = 0;
        } else if (this.pointX >= this.scale.width / this.dpr - this.config.width) {
          this.pointX = this.scale.getContext("2d").width / this.dpr - this.config.width;
        }

        const value = this.pointX * this.config.capacity / this.config.unit + this.config.start;

        // 旋转
        if (value >= 660) {
          this.pointX = (300 - this.config.start) * this.config.unit / this.config.capacity;
        }

        if (value <= 60) {
          this.pointX = (420 - this.config.start) * this.config.unit / this.config.capacity;
        }

        window.requestAnimationFrame(this.moveDraw.bind(that));
      }
    };

    const moveOut = e => {
      e.stopPropagation();
      e.preventDefault();
      ifMove = false;
    };

    const end = () => {
      ifMove = false;
    };

    this.middleLine.addEventListener(startEvent, start);
    this.middleLine.addEventListener(moveEvent, move);
    this.middleLine.addEventListener(endEvent, end);
    this.middleLine.addEventListener(moveOutEvent, moveOut);
  }

  /**
   * 根据模型旋转度数设置刻度尺
   * @param {number} value 旋转度数
   */
  setPoint(value) {
    this.pointX = (value - this.config.start) * this.config.unit / this.config.capacity;
    this.moveDraw();
  }

  moveDraw() {
    let nowX = this.pointX;
    // 是否刻度移动
    if (this.config.openUnitChange) {
      const st = (
        this.config.start / this.config.capacity
          - Math.floor(this.config.start / this.config.capacity)
      ) * this.config.unit;
      nowX = Math.round(this.pointX / this.config.unit) * this.config.unit - st;
    }
    this.ctx.clearRect(0, 0, this.config.width, this.config.height);
    // ctx.drawImage(this.scale.getContext("2d"), now * this.dpr, 0, this.config.width * this.dpr, this.config.height * this.dpr, 0, 0, this.config.width, this.config.height);
    const imageData = this.scale.getContext("2d").getImageData(nowX * this.dpr < this.scale.width ? nowX * this.dpr : this.scale.width, 0, this.config.width * this.dpr, this.config.height * this.dpr);
    this.ctx.putImageData(imageData, 0, 0);
    // drawMidLine();
    this.drawMidLine(this.ctx);
    // drawSign();
    const value = nowX * this.config.capacity / this.config.unit + this.config.start;
    if (typeof this.callBack === 'function') {
      this.callBack(Math.round(value));
    } else {
      throw new Error('scale函数的第二个参数，必须为正确的回调函数！');
    }
  }

  /**
   * 是否显示轴向控制器
   */
  handleVisible() {
    this.show = !this.show;
    this.container.style.display = this.show ? 'flex' : 'none';
  }
}

export default AxisController;
