/**
 * 下载文件到用户电脑
 * @param {Blob} blob - blob
 * @param {string} fileName - 文件名
 */
export default function (blob, fileName) {
  if (navigator.msSaveOrOpenBlob) {
    navigator.msSaveBlob(blob, fileName);
  } else {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  }
}
