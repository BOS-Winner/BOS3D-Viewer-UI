import React from 'react';
import PropTypes from "prop-types";
import { Progress } from 'antd';
import style from "./index.less";

export default function ProgressBar({
  percent = 0
}) {
  return (
    <div className={style.container}>
      <Progress
        percent={percent}
        showInfo={false}
        strokeLinecap="square"
        strokeWidth={4}
      />
    </div>
  );
}

ProgressBar.propTypes = {
  percent: PropTypes.number.isRequired,
};
