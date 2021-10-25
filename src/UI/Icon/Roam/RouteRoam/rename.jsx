import React, { useState } from 'react';
import PropTypes from 'prop-types';
import style from "./style.less";

const Rename = props => {
  const [textError, setTextError] = React.useState(false);
  const [value, setValue] = useState(props.name);

  function handleName() {
    if (!textError) {
      const inputText = value || props.name;
      props.setData(inputText);
      setTextError(false);
      const tag = props.okAfterCancel && typeof props.okAfterCancel === 'function';
      if (tag) props.okAfterCancel();
    }
  }

  function onChangeInput(content) {
    const re = /^([\u4E00-\uFA29]|[\uE7C7-\uE7F3]|[a-zA-Z0-9_.]){0,50}$/g;
    const inputText = content;
    if (re.test(inputText)) {
      setValue(inputText);
    }
  }

  return (
    <div className={style.renameContainer}>
      <div className={style.inputItem}>
        <span className={style.label}>名称：</span>
        <input name="name" value={value} maxLength={50} onChange={e => onChangeInput(e.target.value)} />
        {/* {
          textError && <span className={style.tip}>只能输入中文、英文、数字和下划线</span>
        } */}
      </div>

      <div className={style.optionContainer}>
        <div role="button" tabIndex={0} onClick={() => props.cancel()}>取消</div>
        <div role="button" tabIndex={0} onClick={handleName}>确定</div>
      </div>
    </div>
  );
};

Rename.propTypes = {
  setData: PropTypes.func.isRequired,
  okAfterCancel: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  cancel: PropTypes.func.isRequired,
};

export default Rename;
