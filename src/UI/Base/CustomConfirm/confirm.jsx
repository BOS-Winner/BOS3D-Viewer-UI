import React from 'react';
import ReactDOM from "react-dom";
import PropTypes from 'prop-types';
import { AntdIcon } from '../../utils/utils';
import style from './style.less';

class Confirm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      title, message, okText, cancelText, mode = "normal"
    } = this.props;
    let currentStyle = {};
    switch (mode) {
      case "normal":
        currentStyle = {};
        break;
      case "delete":
        currentStyle = {
          backgroundColor: "#FF2845",
        };
        break;
      default:
        break;
    }
    return ReactDOM.createPortal((
      <div className={style.container}>
        <AntdIcon type="iconclose" className={style.close} onClick={this.props.closeIconFunc} />
        <div className={style.body}>
          <div className={style.title}>
            <AntdIcon type="iconicon_problem" className={style.titleIcon} />
            <span>{title}</span>
          </div>
          <div className={style.message} title={message}>{message}</div>
        </div>
        <div className={style.footer}>
          <button type="button" className={style.cancelButton} onClick={this.props.cancelFunc}>{cancelText}</button>
          <button type="button" className={style.okButton} style={currentStyle} onClick={this.props.okFunc}>{okText}</button>
        </div>
      </div>
    ), this.props.viewportDiv);
  }
}

Confirm.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  viewportDiv: PropTypes.object,
  okText: PropTypes.string,
  cancelText: PropTypes.string,
  cancelFunc: PropTypes.func.isRequired,
  okFunc: PropTypes.func.isRequired,
  closeIconFunc: PropTypes.func.isRequired,
  mode: PropTypes.string,
};

Confirm.defaultProps = {
  viewportDiv: document.body,
  okText: '确定',
  cancelText: '取消',
  mode: "normal",
};

export default Confirm;
