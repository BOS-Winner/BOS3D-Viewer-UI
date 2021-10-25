
let svgNamespace = "http://www.w3.org/2000/svg";

let createSvg = function() {
    let svg = document.createElementNS(svgNamespace, "svg");
    svg.setAttribute( "xmlns", "http://www.w3.org/2000/svg");
    svg.style.userSelect = "none";
    return svg;
}

let createImage = function() {
  let image = document.createElementNS(svgNamespace, "image");
  image.ondragstart = function (){return false;};
  return image;
}

let createLine = function () {
    let line = document.createElementNS(svgNamespace, "line");
    return line;
}

let createPath = function () {
    let path = document.createElementNS(svgNamespace, "path");
    return path;
}

let createRect = function (width, height) {
    let rect = document.createElementNS(svgNamespace, "rect");
    rect.setAttributeNS(null, "width", width ? width : 0);
    rect.setAttributeNS(null, "height", height ? height : 0);
    rect.setAttributeNS(null, "fill", "none");
    return rect;
}

let createGroup = function () {
    let group = document.createElementNS(svgNamespace, "g");
    return group;
}

let createCircle = function (radius) {
    let circle = document.createElementNS(svgNamespace, "circle");
    circle.setAttributeNS(null, "r", radius ? radius : 0);
    circle.setAttributeNS(null, "fill", "none");
    return circle;
}

let createEllipse = function () {
    let ellipse = document.createElementNS(svgNamespace, "ellipse");
    ellipse.setAttributeNS(null, "fill", "none");
    return ellipse;
}

let createPolygon = function() {
    let polygon = document.createElementNS(svgNamespace, "polygon");
    polygon.setAttributeNS(null, "fill", "none");
    return polygon;
}

let createText = function() {
    let text = document.createElementNS(svgNamespace, "text");
    return text;
}

let createTextSpan = function() {
    let ts = document.createElementNS(svgNamespace, "tspan");
    return ts;
}

let createTextArea = function() {
  let textarea = document.createElement("textarea");
  return textarea;
}

let rotateAngleWithPoint = function (x, y) {
    let doublePi = 2 * Math.PI;
    let angle = Math.atan2(y, x);
    if (angle < 0) {
        angle += doublePi;
    }
    angle = angle + 0.5 * Math.PI;
    if (angle >= doublePi) {
        angle -= doublePi;
    }
    return angle;
}

let pointToString = function (x, y) {
    let str = "";
    str = str + x + "," + y;
    return str;
}

let isTouchDevice = function () {
  return (typeof window !== "undefined" && "ontouchstart" in window);
};

export {
    createSvg,
    createImage,
    createLine,
    createPath,
    createRect,
    createGroup,
    createCircle,
    createEllipse,
    createPolygon,
    rotateAngleWithPoint,
    createText,
    createTextSpan,
    pointToString,
    createTextArea,
    isTouchDevice
};

