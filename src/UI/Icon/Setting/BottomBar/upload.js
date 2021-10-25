/**
 * 导入一个文件
 * @return {Promise<string, typeof Error>} - Promise
 */
export default function () {
  // eslint-disable-next-line compat/compat
  return new Promise((resolve, reject) => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.data';
      input.addEventListener('input', e => {
        if (e.target.value) {
          const reader = new FileReader();
          reader.onload = () => {
            // eslint-disable-next-line compat/compat
            const decoder = new TextDecoder();
            const buffer = new Uint8Array(reader.result).map(buf => buf ^ 0xff);
            resolve(decoder.decode(buffer));
          };
          reader.readAsArrayBuffer(e.target.files[0]);
        }
      });
      input.click();
    } catch (e) {
      reject(e);
    }
  });
}
