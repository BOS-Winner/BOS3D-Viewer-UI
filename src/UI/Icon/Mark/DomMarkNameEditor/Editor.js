class Editor {
  constructor() {
    this.markSpanList = {};
  }

  addEditor(id, callback) {
    const dom = document.getElementById(id);
    this.markSpanList[id] = dom.childNodes[0].cloneNode(true);
    dom.removeChild(dom.childNodes[0]);
    const input = document.createElement('input');
    input.setAttribute('maxlength', 10);
    input.addEventListener('focusout', e => {
      e.stopPropagation();
      this.rmEditor(id);
      callback(input.value);
    });
    input.addEventListener('click', e => {
      e.stopPropagation();
    });
    dom.appendChild(input);
    input.focus();
  }

  rmEditor(id) {
    if (this.markSpanList[id]) {
      const dom = document.getElementById(id);
      dom.removeChild(dom.childNodes[0]);
      dom.appendChild(this.markSpanList[id]);
      this.markSpanList[id] = undefined;
    }
  }
}

export default Editor;
