import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import style from "./CustomContentAlert.less";

const closeIcon = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4NCjxzdmcgd2lkdGg9IjExcHgiIGhlaWdodD0iMTFweCIgdmlld0JveD0iMCAwIDExIDExIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPg0KICAgIDwhLS0gR2VuZXJhdG9yOiBTa2V0Y2ggNDguMiAoNDczMjcpIC0gaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoIC0tPg0KICAgIDx0aXRsZT5saWdodF9ob3Zlcl9wYW5lbGNsb3NlPC90aXRsZT4NCiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4NCiAgICA8ZGVmcz48L2RlZnM+DQogICAgPGcgaWQ9IkxJR0hULVRIRU1FRC1QQU5FTFMtLS1Ib3ZlcnMtLS1MTVYiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0xMDYxLjAwMDAwMCwgLTE5OS4wMDAwMDApIj4NCiAgICAgICAgPGcgaWQ9ImxpZ2h0X2hvdmVyX3BhbmVsY2xvc2UiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEwNjEuMDAwMDAwLCAxOTkuMDAwMDAwKSIgZmlsbD0iIzRBNTU1QiI+DQogICAgICAgICAgICA8ZyBpZD0iR3JvdXAiPg0KICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0wLjQ1NDk0ODUwNiwxMC45OTcwNTcyIEMwLjI2MjA3ODM5OCwxMC45Nzk2MDI3IDAuMDk2NjMxODM1NCwxMC44NTIzNDM3IDAuMDMwMjc4NjIzNywxMC42NzA0MDc0IEMtMC4wMzYwNzQ1ODgxLDEwLjQ4ODQ3MTIgMC4wMDg1OTk0OTU0OSwxMC4yODQ1Nzk5IDAuMTQ0OTQ4NTA2LDEwLjE0NzA1NzIgTDEwLjE0NDk0ODUsMC4xNDcwNTcyNDkgQzEwLjI3MTc3NzgsMC4wMjAyMjc5NjUxIDEwLjQ1NjYzNTUsLTAuMDI5MzA0NTA4OSAxMC42Mjk4ODc1LDAuMDE3MTE4MjMxMiBDMTAuODAzMTM5NSwwLjA2MzU0MDk3MTIgMTAuOTM4NDY0OCwwLjE5ODg2NjIwNyAxMC45ODQ4ODc1LDAuMzcyMTE4MjMxIEMxMS4wMzEzMTAzLDAuNTQ1MzcwMjU2IDEwLjk4MTc3NzgsMC43MzAyMjc5NjUgMTAuODU0OTQ4NSwwLjg1NzA1NzI0OSBMMC44NTQ5NDg1MDYsMTAuODU3MDU3MiBDMC43NDg5NjM1MjQsMTAuOTYwNzE2MSAwLjYwMjQ0MzQwNSwxMS4wMTE5OTgyIDAuNDU0OTQ4NTA2LDEwLjk5NzA1NzIgWiIgaWQ9IlNoYXBlIj48L3BhdGg+DQogICAgICAgICAgICAgICAgPHBhdGggZD0iTTEwLjQ1NzA0NTgsMTEuMDA3MDQ1OCBDMTAuMzM5MjEwMiwxMC45OTUzMzI0IDEwLjIyOTM1NjUsMTAuOTQyMTc3MyAxMC4xNDcwNDU4LDEwLjg1NzA0NTggTDAuMTQ3MDQ1ODA5LDAuODU3MDQ1ODA5IEMtMC4wNDkwMTUyNzE5LDAuNjYwOTg0NzIyIC0wLjA0OTAxNTI2OTUsMC4zNDMxMDY4OTkgMC4xNDcwNDU4MTUsMC4xNDcwNDU4MTUgQzAuMzQzMTA2ODk5LC0wLjA0OTAxNTI2OTUgMC42NjA5ODQ3MjIsLTAuMDQ5MDE1MjcxOSAwLjg1NzA0NTgwOSwwLjE0NzA0NTgwOSBMMTAuODU3MDQ1OCwxMC4xNDcwNDU4IEMxMS4wMTMyODI4LDEwLjI5NDg3OTcgMTEuMDU3NDY1OSwxMC41MjYwNjc0IDEwLjk2Njc1NDcsMTAuNzIxMDk2NSBDMTAuODc2MDQzNSwxMC45MTYxMjU1IDEwLjY3MDc2ODIsMTEuMDMxMjg2IDEwLjQ1NzA0NTgsMTEuMDA3MDQ1OCBaIiBpZD0iU2hhcGUiPjwvcGF0aD4NCiAgICAgICAgICAgIDwvZz4NCiAgICAgICAgPC9nPg0KICAgIDwvZz4NCjwvc3ZnPg==";

/**
 * 该alert会在document.body上弹出来
 */
class CustomContentAlert extends React.Component {
  constructor(props) {
    super(props);
    this.draggableBoxRef = React.createRef();
    this.dragAreaRef = React.createRef();
  }

  static show(content, title, cancelButtonTitle, confirmButtonTitle, cancelAction,
    confirmAction,
    parent) {
    const div = document.createElement('div');
    if (parent) {
      parent.appendChild(div);
    } else {
      document.body.appendChild(div);
    }
    ReactDOM.render(
      <CustomContentAlert
        title={title}
        cancelButtonTitle={cancelButtonTitle}
        confirmButtonTitle={confirmButtonTitle}
        content={content}
        closeAction={() => {
          ReactDOM.unmountComponentAtNode(div);
          div.parentNode.removeChild(div);
        }}
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

  componentDidMount() {
    const element = this.dragAreaRef.current;
    const box = this.draggableBoxRef.current;
    if (element) {
      element.addEventListener("mousedown", (ev) => {
        const diffX = ev.clientX - box.offsetLeft;
        const diffY = ev.clientY - box.offsetTop;

        function mouseMove(event) {
          let moveX = event.clientX - diffX;
          let moveY = event.clientY - diffY;
          const maxX = document.documentElement.clientWidth - box.offsetWidth;// X轴可移动最大距离
          const maxY = document.documentElement.clientHeight - box.offsetHeight;// Y轴可移动最大距离

          if (moveX < 0) {
            moveX = 0;
          } else if (moveX > maxX) {
            moveX = maxX;
          }

          if (moveY < 0) {
            moveY = 0;
          } else if (moveY > maxY) {
            moveY = maxY;
          }

          box.style.left = `${moveX}px`;
          box.style.top = `${moveY}px`;
        }

        function mouseUp() {
          element.removeEventListener("mousemove", mouseMove, false);
          element.removeEventListener("mouseup", mouseUp, false);
        }

        element.addEventListener("mousemove", mouseMove, false);
        element.addEventListener("mouseup", mouseUp, false);
      });
    }
  }

  render() {
    return (
      <div className={style.container}>
        <div ref={this.draggableBoxRef} className={style.box}>
          <div ref={this.dragAreaRef} className={style.title}>
            <div className={style.titleText}>{this.props.title}</div>
            <div
              role="presentation"
              className={style.close}
              style={{ backgroundImage: `url(${closeIcon})` }}
              onClick={this.props.closeAction}
            />
          </div>
          <div className={style.content}>
            {
              this.props.content
            }
          </div>
          <div className={style.buttonPanel}>
            <div
              role="presentation"
              className={`${style.button} ${style.redButton}`}
              onClick={this.props.cancelAction}
            >
              {this.props.cancelButtonTitle}
            </div>
            <div
              role="presentation"
              className={`${style.button} ${style.blueButton} ${style.buttonMargin}`}
              onClick={this.props.confirmAction}
            >
              {this.props.confirmButtonTitle}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

CustomContentAlert.propTypes = {
  content: PropTypes.object,
  title: PropTypes.string,
  cancelButtonTitle: PropTypes.string,
  confirmButtonTitle: PropTypes.string,
  cancelAction: PropTypes.func,
  confirmAction: PropTypes.func,
  closeAction: PropTypes.func
};

CustomContentAlert.defaultProps = {
  content: undefined,
  title: "",
  cancelButtonTitle: "取消",
  confirmButtonTitle: "确定",
  cancelAction: () => {},
  confirmAction: () => {},
  closeAction: () => {}
};

export default CustomContentAlert;
