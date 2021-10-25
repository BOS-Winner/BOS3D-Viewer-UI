import html2canvas from "html2canvas";

/**
 * 剪裁图片
 * @param {HTMLImageElement} img - image element
 * @param {number} cropX - 要剪裁的左上角的x
 * @param {number} cropY - 要剪裁的左上角的y
 * @param {number} cropWidth - 要剪裁的宽度
 * @param {number} cropHeight - 要剪裁的高度
 * @return {string} image dataURL
 */
export function cropPlusExport(img, cropX, cropY, cropWidth, cropHeight) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = cropWidth;
  canvas.height = cropHeight;
  ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
  return (canvas.toDataURL());
}

/**
 * 获取dommark的截图
 * @param {HTMLImageElement} modelImg - model image element
 * @param {Node} markDOM - mark node
 * @param {number} dx - 要剪裁的markDOM左上角的x
 * @param {number} dy - 要剪裁的markDOM左上角的y
 * @param {number} sw - 要剪裁的markDOM宽度
 * @param {number} sh - 要剪裁的markDOM高度
 * @return {Promise<{imgURL: string, code: "success"} | {msg: string | typeof Error, code: "error"}>}
 */
export function getMarkShot(modelImg, markDOM, dx, dy, sw, sh) {
  return html2canvas(
    markDOM,
    {
      x: dx,
      y: dy,
      width: sw,
      height: sh,
      backgroundColor: null,
    }
  )
    .then(canvas => {
      const _canvas = document.createElement('canvas');
      _canvas.width = sw;
      _canvas.height = sh;
      const ctx = _canvas.getContext('2d');
      ctx.drawImage(modelImg, 0, 0, sw, sh);
      ctx.drawImage(canvas, 0, 0, sw, sh);
      return {
        code: 'success',
        imgURL: _canvas.toDataURL()
      };
    })
    .catch(err => ({
      code: 'error',
      msg: err,
    }));
}
