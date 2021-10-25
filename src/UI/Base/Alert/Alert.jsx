import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import style from "./Alert.less";

/**
 * 该alert会在document.body或者parent上弹出来
 */
class Alert extends React.Component {
  static _show(type, title, content, cancelAction, confirmAction, parent, zIndex) {
    const div = document.createElement('div');
    div.style.zIndex = zIndex || "auto";
    div.style.position = "relative";
    if (parent) {
      parent.appendChild(div);
    } else {
      document.body.appendChild(div);
    }
    ReactDOM.render(
      <Alert
        type={type}
        title={title}
        content={content}
        cancelAction={() => {
          if (cancelAction) {
            cancelAction();
          }
          ReactDOM.unmountComponentAtNode(div);
          div.parentNode.removeChild(div);
        }}
        confirmAction={() => {
          if (confirmAction) {
            confirmAction();
          }
          ReactDOM.unmountComponentAtNode(div);
          div.parentNode.removeChild(div);
        }}
      />,
      div
    );
  }

  static showConfirm(title, content, cancelAction, confirmAction, parent, zIndex) {
    Alert._show(1, title, content, cancelAction, confirmAction, parent, zIndex);
  }

  static showAlert(title, content, cancelAction, parent, zIndex) {
    Alert._show(0, title, content, cancelAction, undefined, parent, zIndex);
  }

  render() {
    const isConfirm = this.props.type === 1;
    return (
      <div className={style.container}>
        <div className={style.box}>
          <div className={style.title}>{this.props.title}</div>
          <div className={style.content}>{this.props.content}</div>
          <div className={style.buttonPanel}>
            <div
              role="presentation"
              className={`${style.button} ${isConfirm ? style.grayButton : style.blueButton}`}
              onClick={this.props.cancelAction}
            >
              {isConfirm ? this.props.cancelButtonTitle : "确定"}
            </div>
            { isConfirm
              ? (
                <div
                  role="presentation"
                  className={`${style.button} ${style.blueButton} ${style.buttonMargin}`}
                  onClick={this.props.confirmAction}
                >
                  {this.props.confirmButtonTitle}
                </div>
              )
              : null}

          </div>
        </div>
      </div>
    );
  }
}

Alert.propTypes = {
  // 0是alert,1是confirm
  type: PropTypes.number,
  title: PropTypes.string,
  content: PropTypes.string,
  cancelButtonTitle: PropTypes.string,
  confirmButtonTitle: PropTypes.string,
  cancelAction: PropTypes.func,
  confirmAction: PropTypes.func
};

Alert.defaultProps = {
  type: 1,
  title: "提示",
  content: "确定要关闭吗？",
  cancelButtonTitle: "取消",
  confirmButtonTitle: "确定",
  cancelAction: () => {},
  confirmAction: () => {}
};

export default Alert;
