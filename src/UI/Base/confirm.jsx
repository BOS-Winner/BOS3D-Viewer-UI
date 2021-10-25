import React from "react";
import ReactDOM from "react-dom";
import Modal from "./Modal";

/**
 * 快速弹出确认提示框
 * @desc 多数参数和Modal相同
 * @desc 默认开启了visible和footer
 * @param {any} props - 参数
 * @param {any} props.content - 提示框内容
 */
function confirm(props) {
  const div = document.createElement("div");
  document.body.appendChild(div);
  const left = props.viewportDiv.clientWidth / 2 - 150;
  ReactDOM.render(
    <Modal
      visible
      top="20%"
      left={`${left}px`}
      right="initial"
      minWidth={260}
      minHeight={140}
      {...props}
      onOk={() => {
        ReactDOM.unmountComponentAtNode(div);
        document.body.removeChild(div);
        if (props && props.onOk) {
          props.onOk();
        }
      }}
      onCancel={() => {
        ReactDOM.unmountComponentAtNode(div);
        document.body.removeChild(div);
        if (props && props.onCancel) {
          props.onCancel();
        }
      }}
      footer
    >
      <div>
        {props.content}
      </div>
    </Modal>,
    div
  );
}

export default confirm;
