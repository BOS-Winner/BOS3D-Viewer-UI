let MouseDownEventWrapper = function (svg) {
  this.svg = svg;
  this.enableMultiClick = true;
  this.enableMultiClickCallback = undefined;

  this.doubleClickCallback = undefined;
  this.mouseDownCallback = undefined;
  this.mouseMoveCallback = undefined;
  this.mouseUpCallback = undefined;

  this.expectClickCount = 2;

  this._mouseDownTimer = undefined;
  this._mouseUpTimer = undefined;

  this._mouseDownEvent = undefined;
  this._mouseUpEvent = undefined;
  this._clickCount = 0;
  this.handleMouseDown = this.handleMouseDown.bind(this);
  this.handleMouseMove = this.handleMouseMove.bind(this);
  this.handleMouseUp = this.handleMouseUp.bind(this);
  this.handleTouchStart = this.handleTouchStart.bind(this);
  this.handleTouchMove = this.handleTouchMove.bind(this);
  this.handleTouchEnd = this.handleTouchEnd.bind(this);
}

MouseDownEventWrapper.prototype.handleMouseDown = function (event) {
  event = this._customedEvent(event);
  let enable = this.enableMultiClickCallback ? this.enableMultiClickCallback() : this.enableMultiClick;
  if (!enable) {
    this.mouseDownCallback(event);
    return;
  }

  this._clearMouseUpTimer();
  if (!this._mouseDownTimer) {
    this._clickCount = 0;
    let scope = this;
    this._mouseDownEvent = event;
    this._mouseDownTimer = setTimeout(function () {

      let _event = scope._mouseDownEvent;
      scope._clearMouseDownTimer();
      scope.mouseDownCallback(_event);
    }, 300);
  } else {
    if (this._clickCount > 0) {
      //延长一下
      clearTimeout(this._mouseDownTimer);
      let scope = this;
      this._mouseDownTimer = setTimeout(function () {
        let _event = scope._mouseDownEvent;
        scope._clearMouseDownTimer();
        scope._clickCount = 0;
        scope.mouseDownCallback(_event);
      }, 300);
    }
  }
}

MouseDownEventWrapper.prototype.handleMouseMove = function (event) {
  event = this._customedEvent(event);
  let enable = this.enableMultiClickCallback ? this.enableMultiClickCallback() : this.enableMultiClick;
  if (!enable) {
    this.mouseMoveCallback(event);
    return;
  }

  if (this._mouseDownTimer) {

    let _event = this._mouseDownEvent;
    this._clearMouseDownTimer();
    this.mouseDownCallback(_event);
  }

  if (this._mouseUpTimer) {

    let _event = this._mouseUpEvent;
    this._clearMouseUpTimer();
    this.mouseUpCallback(_event);
  }
  this.mouseMoveCallback(event);
}

MouseDownEventWrapper.prototype.handleMouseUp = function (event) {
  event = this._customedEvent(event);
  let enable = this.enableMultiClickCallback ? this.enableMultiClickCallback() : this.enableMultiClick;
  if (!enable) {
    this.mouseUpCallback(event);
    return;
  }

  if (this._mouseDownTimer) {
    this._clickCount += 1;
  }

  if (this._clickCount > 1) {
    this._clearMouseDownTimer();
  }


  if (this._mouseUpTimer) {
    clearTimeout(this._mouseUpTimer);
    this._mouseUpTimer = undefined;
  } else {
    this._mouseUpEvent = event;
  }

  if (this.expectClickCount === this._clickCount) {
    // 立刻执行
    this._fireClick(event);
  } else {
    let scope = this;
    this._mouseUpTimer = setTimeout(function () {
      scope._fireClick(event);
    }, 300);
  }

}

MouseDownEventWrapper.prototype.handleTouchStart = function (event) {
  if (event.touches.length === 1) {
    event._isTouchEvent = true;
    this.handleMouseDown(event);
  }
}

MouseDownEventWrapper.prototype.handleTouchMove = function (event) {
  event._isTouchEvent = true;
  this.handleMouseMove(event);
}

MouseDownEventWrapper.prototype.handleTouchEnd = function (event) {
  if (event.touches.length === 0) {
    event._isTouchEvent = true;
    this.handleMouseUp(event);
  }
}

MouseDownEventWrapper.prototype._fireClick = function(event) {
  let _event = this._mouseUpEvent;
  this._clearMouseUpTimer();
  if (this._clickCount > 1) {
    if (this._clickCount === 2) {
      this.doubleClickCallback(event);
    }
  } else {

    this.mouseUpCallback(_event);
  }
  this._clickCount = 0;
}

MouseDownEventWrapper.prototype._clearMouseDownTimer = function () {
  clearTimeout(this._mouseDownTimer);
  this._mouseDownTimer = undefined;
  this._mouseDownEvent = undefined;

}

MouseDownEventWrapper.prototype._clearMouseUpTimer = function () {
  clearTimeout(this._mouseUpTimer);
  this._mouseUpTimer = undefined;
  this._mouseUpEvent = undefined;

}

MouseDownEventWrapper.prototype._convertPointToSvgCoordinate = function(x, y) {
  let pt = this.svg.createSVGPoint();
  pt.x = x;
  pt.y = y;
  return pt.matrixTransform(this.svg.getScreenCTM().inverse());
}

MouseDownEventWrapper.prototype._customedEvent = function (event) {
  let result = {};
  if (event._isTouchEvent) {
    let touch = event.touches[0] ? event.touches[0] : event.changedTouches[0];
    result.offsetX = touch.offsetX;
    result.offsetY = touch.offsetY;
    result.clientX = touch.clientX;
    result.clientY = touch.clientY;
    result.pageX = touch.pageX;
    result.pageY = touch.pageY;
    result.screenX = touch.screenX;
    result.screenY = touch.screenY;
    // 鼠标左键
    result.button = 0;
  } else {
    result.offsetX = event.offsetX;
    result.offsetY = event.offsetY;
    result.clientX = event.clientX;
    result.clientY = event.clientY;
    result.pageX = event.pageX;
    result.pageY = event.pageY;
    result.screenX = event.screenX;
    result.screenY = event.screenY;
    result.button = event.button;
  }

  result.target = event.target;
  result.currentTarget = event.currentTarget;
  let point = this._convertPointToSvgCoordinate(result.clientX, result.clientY);
  result.offsetX = point.x;
  result.offsetY = point.y;
  return result;
}

export default MouseDownEventWrapper;

