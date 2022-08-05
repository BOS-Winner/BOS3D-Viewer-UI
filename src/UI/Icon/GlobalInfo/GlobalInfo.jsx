import ReactDOM from "react-dom";
import React from "react";
import { AntdIcon } from "../../utils/utils";
import style from "./GlobalInfo.less";

class GlobalInfo {
  constructor(props) {
    this.viewer = props.viewer;
    this.children = props.children || "";
    this.parentNode = props.parentNode;
    this.title = props.title || "";
    this.showState = false;
    this.config = {
      width: 378,
      root: "globalInfo238972"
    };
    // 初始化
    this.init();
  }

  destroy() {
    this.hide();
    const tipDom = document.querySelector(`#${this.config.root}`);
    setTimeout(() => {
      if (tipDom) {
        tipDom.remove();
      }
    }, 1000);
  }

  init() {
    if (document.querySelector(`#${this.config.root}`)) {
      ReactDOM.render(this.children, document.querySelector(`#globalContent839721`));
      return;
    }

    const parentDom = this.parentNode;

    parentDom.style.display = "flex";
    parentDom.style.overflow = "hidden";
    parentDom.style.position = "relative";

    this.viewer.viewportDiv.style.transition = "all .5s ease-in-out";
    this.viewer.viewportDiv.style.display = "flex";

    const tipDom = document.createElement("div");
    tipDom.setAttribute("id", this.config.root);

    parentDom.appendChild(tipDom);
    tipDom.setAttribute("style", `
      width: ${this.config.width}px;
      height: 100%;
      background: #1F1F1F;
      transition: right .5s ease-in-out;
      position: absolute;
      top:0px;
      right: -${this.config.width}px
    `);
    tipDom.classList.add("bos3dui");

    const headerContainer = document.createElement("div");
    tipDom.appendChild(headerContainer);
    const header = (
      <div className={style.headerContainer}>
        <AntdIcon type="iconclose" onClick={() => this.hide()} />
        <span>{this.title}</span>
      </div>
    );
    ReactDOM.render(header, headerContainer);

    const content = document.createElement("div");
    content.id = "globalContent839721";
    content.setAttribute("style", `
      height: 100%;
      overflow: auto;
    `);

    tipDom.appendChild(content);

    ReactDOM.render(this.children, content);
  }

  show() {
    if (this.showState) return;
    this.viewer.viewportDiv.style.width = `calc(100% - ${this.config.width}px)`;
    const tipDom = document.querySelector(`#${this.config.root}`);
    tipDom.style.right = 0;
    this.showState = true;
  }

  hide() {
    this.viewer.viewportDiv.style.width = "100%";
    const tipDom = document.querySelector(`#${this.config.root}`);
    if (tipDom) {
      tipDom.style.right = `-${this.config.width}px`;
    }
    this.showState = false;
  }
}

export default GlobalInfo;
