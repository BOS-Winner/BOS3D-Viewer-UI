import React from "react";
import PropTypes from "prop-types";
import { Toolbar, Button } from "@material-ui/core";
import { format } from "date-fns";
import zhCN from "date-fns/locale/zh-CN";
import style from "./style.less";

// 备用，暂时不用着代码内部
function CalendarToolbar(props) {
  return (
    <Toolbar
      classes={{
        root: style.calendarToolbar,
      }}
    >
      <Button className={style.year} onClick={() => props.onChangeView(['year'])}>
        {props.date.getFullYear()}
      </Button>
      <Button className={style.date} onClick={() => props.onChangeView(['year', 'date'])}>
        {format(props.date, 'LLLLdo EEEE', { locale: zhCN })}
      </Button>
    </Toolbar>
  );
}

CalendarToolbar.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  onChangeView: PropTypes.func.isRequired,
};

export default CalendarToolbar;
