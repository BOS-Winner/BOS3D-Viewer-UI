import React from 'react';
import ReactDOM from "react-dom";
import PropTypes from 'prop-types';
import { Modal as AntdModal } from 'antd';
import style from "./style.less";
import mobileStyle from "./mobileStyle.less";
import { AntdIcon } from '../../utils/utils';
/**
 * 简易confirm
 * @param {object} props
 * @param {string} props.title - 标题
 * @param {function} props.onOk - 点击确定回调，传入用户是否勾选不再提示
 * @param {function} [props.onCancel = () => {}] - 点击取消回调，传入用户是否勾选不再提示
 * @return {typeof React.createElement}
 * @constructor
 */
function SmallConfirm(props) {
  const inputRef = React.useRef(null);
  function onClick(e, type) {
    switch (type) {
      case 'ok':
        props.onOk(inputRef.current.checked);
        break;
      case 'cancel':
        props.onCancel(inputRef.current.checked);
        break;
      default:
        props.onCancel();
        break;
    }
  }

  const comfirmBtnCls = ['bos-btn'];
  if (props?.type === "danger") {
    comfirmBtnCls.push('bos-btn-primary');
  } else {
    comfirmBtnCls.push('bos-btn-primary');
  }

  if (props.isMobile) {
    const MoblieJSX = (
      <div className={mobileStyle.container}>
        <div role="presentation" className={mobileStyle.close} onClick={e => onClick(e)}><AntdIcon type="iconclose" /></div>
        <div className={mobileStyle.header}>
          <AntdIcon type="iconicon_problem" />
          <span className={mobileStyle.title}>{props.title}</span>
        </div>
        <div className={mobileStyle.neverShow}>
          <input type="checkbox" ref={inputRef} />
          <label>下次不再提示此消息</label>
        </div>
        <div className={mobileStyle.actionWrap}>
          <button type="button" className="bos-btn bos-btn-default" onClick={e => onClick(e, 'cancel')}>取消</button>
          <button type="button" className={comfirmBtnCls.join(" ")} onClick={e => onClick(e, 'ok')}>确定</button>
        </div>
      </div>
    );

    return (
      <AntdModal width={280} visible getContainer={false} footer={null} maskClosable={false} closable={false} wrapClassName={mobileStyle.container}>
        {MoblieJSX}
      </AntdModal>
    );
  }

  return (
    <div
      role="presentation"
      className={style.confirm}
      onClick={ev => {
        ev.stopPropagation();
      }}
    >
      <div className={style.close} onClick={e => onClick(e)}><AntdIcon type="iconclose" /></div>
      <div className={style.header}>
        <AntdIcon type="iconicon_problem" />
        <span className={style.title}>{props.title}</span>
      </div>
      <div className={style.neverShow}>
        <input type="checkbox" ref={inputRef} />
        <label>下次不再提示此消息</label>
      </div>
      <div className={style.buttonGroup}>
        <button type="button" className="bos-btn bos-btn-default" onClick={e => onClick(e, 'cancel')}>取消</button>
        <button type="button" className={comfirmBtnCls.join(" ")} onClick={e => onClick(e, 'ok')}>确定</button>
      </div>

    </div>
  );
}

SmallConfirm.propTypes = {
  title: PropTypes.string.isRequired,
  onOk: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
};
SmallConfirm.defaultProps = {
  onCancel: () => { },
};

export default SmallConfirm;
