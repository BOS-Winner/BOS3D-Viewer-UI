import React from 'react';
import { Input } from 'antd';
import PropTypes from 'prop-types';
import style from './GeneralInputItem.less';

/**
 * 常规搜索输入框
 * @param {object} props props
 * @param {string} label 标签
 * @param {string} placeholder 输入框的提示语
 * @param {string} inputValue 输入框中的值
 * @param {Function} handleVaule 输入框中的值有变化时函数
 * @param {number} relation 当前条件的逻辑关系, 1: and, 2: or
 * @param {boolean} show 是否显示逻辑关系单选框
 * @param {Funciton} handleRadio 处理逻辑关系的函数
 * @param {bool} offline 是否是离线模式，默认为false
 * @returns {null} null
 */
export default function InputItem(props) {
  const {
    label,
    placeholder,
    inputValue,
    handleVaule,
  } = props;

  function handleInputItem(e) {
    const { value: content } = e.target;
    handleVaule(content);
  }

  return (
    <div className={style.inputItem}>
      <div className={style.label}>{label}</div>
      <div className={style.input}>
        <Input size="" placeholder={placeholder} value={inputValue} onChange={handleInputItem} />
      </div>
    </div>
  );
}

InputItem.defaultProps = {
  placeholder: '',
};

InputItem.propTypes = {
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  inputValue: PropTypes.string.isRequired,
  handleVaule: PropTypes.func.isRequired,
};
