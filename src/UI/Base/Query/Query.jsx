import React from 'react';
import PropTypes from "prop-types";
import { Paper, InputBase } from "@material-ui/core";
import { KeyboardArrowUp, KeyboardArrowDown } from "@material-ui/icons";
// import searchPng from "./search.png";
import style from "./style.less";
import { AntdIcon } from "../../utils/utils";

function Query(props) {
  const sRef = React.useRef(null);
  const [content, setContent] = React.useState("");
  function onSearch(e) {
    e.preventDefault();
    e.stopPropagation();
    props.onSearch(sRef.current.value);
  }

  function onKeyPress(e) {
    if (e.key === "Enter") {
      onSearch(e);
    }
  }

  const clickSearchArrow = React.useCallback(dir => {
    const canClick = dir === 'up' ? props.upValid : props.downValid;
    if (canClick) {
      if (dir === 'up') {
        props.onSearchPrev();
      } else {
        props.onSearchNext();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.upValid, props.downValid]);

  /**
   * 监听用户输入变化
   * @param {object} e 输入框输入变化事件
   */
  function contentChange(e) {
    const value = e.target.value;
    setContent(value);
  }

  /**
   * 清空输入框内容
   */
  function clean() {
    sRef.current.value = "";
    setContent("");
    props.onSearch("");
  }

  return (
    <div className={`${style.query} ${props.showSearchArrow ? '' : style.hideArrow}`}>
      <Paper
        classes={{
          root: style.inputContainer
        }}
      >
        <InputBase
          inputRef={sRef}
          classes={{
            root: style.input
          }}
          onChange={contentChange}
          placeholder={props.placeholder}
          onKeyPress={ev => onKeyPress(ev)}
        />
        {content ? <AntdIcon type="iconclose" onClick={() => clean()} className={style.cleanIcon} /> : null}
        <AntdIcon type="iconsearch" onClick={ev => { onSearch(ev) }} className={style.searchIcon} />
      </Paper>
      <Paper classes={{ root: style.arrow }}>
        <KeyboardArrowUp
          classes={{ root: `${style.icon} ${props.upValid ? '' : style.invalid}` }}
          onClick={() => clickSearchArrow('up')}
        />
        <KeyboardArrowDown
          classes={{ root: `${style.icon} ${props.downValid ? '' : style.invalid}` }}
          onClick={() => clickSearchArrow('down')}
        />
      </Paper>
    </div>
  );
}

Query.propTypes = {
  onSearch: PropTypes.func.isRequired,
  upValid: PropTypes.bool,
  downValid: PropTypes.bool,
  onSearchPrev: PropTypes.func,
  onSearchNext: PropTypes.func,
  showSearchArrow: PropTypes.bool,
  placeholder: PropTypes.string,
};

Query.defaultProps = {
  upValid: false,
  downValid: false,
  onSearchPrev: () => {},
  onSearchNext: () => {},
  showSearchArrow: false,
  placeholder: '',
};

export default Query;
