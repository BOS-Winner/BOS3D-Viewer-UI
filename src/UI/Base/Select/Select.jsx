import React from "react";
import PropTypes from "prop-types";
import {
  Select as MuiSelect, MenuList, Popper, ClickAwayListener, Fade,
} from "@material-ui/core";
import { KeyboardArrowDown } from "@material-ui/icons";
import _ from "lodash-es";
import style from "./style.less";

/**
 * Select
 * @desc 这个Select是在左下方弹出
 * @desc 接口参考 https://material-ui.com/zh/api/select
 * @return {ReturnType<React.FunctionComponent>}
 * @constructor
 */
function Select(props) {
  const ref = React.useRef(null);
  const [open, setOpen] = React.useState(false);
  const [val, setVal] = React.useState(props.defaultValue || props.value);

  const _setVal = React.useCallback(e => {
    if (props.onChange) {
      props.onChange(e);
    } else {
      const v = e.target.value || e.target.getAttribute('data-value');
      setVal(v);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.onChange]);

  return (
    <div className={style.selectContainer}>
      <MuiSelect
        ref={ref}
        inputProps={{
          classes: {
            select: style.select,
          }
        }}
        value={val}
        variant="outlined"
        IconComponent={KeyboardArrowDown}
        {...props}
        open={false}
        onOpen={() => setOpen(!open)}
      />
      <Popper
        className={style.popper}
        open={open}
        anchorEl={ref.current}
        transition
        disablePortal
        placement="bottom-start"
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps}>
            <div>
              <ClickAwayListener
                onClickAway={ev => {
                  if (ref.current && ref.current.contains(ev.target)) {
                    return;
                  }
                  setOpen(false);
                }}
              >
                <MenuList
                  classes={{
                    root: style.selectList,
                  }}
                  onClick={ev => {
                    _setVal(ev);
                    setOpen(false);
                  }}
                  {..._.get(props, 'MenuProps.MenuListProps', {})}
                >
                  {props.children}
                </MenuList>
              </ClickAwayListener>
            </div>
          </Fade>
        )}
      </Popper>
    </div>
  );
}

Select.propTypes = {
  children: PropTypes.node.isRequired,
  defaultValue: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.oneOfType([PropTypes.func, () => undefined])
};

Select.defaultProps = {
  defaultValue: '',
  value: '',
  onChange: undefined,
};

export default Select;
