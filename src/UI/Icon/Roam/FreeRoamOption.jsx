import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Switch, InputNumber } from 'antd';
// import CheckBox from "Base/CheckBox";
import style from "./style.less";

/**
 * 自定义开关
 * @param {object} props 参数
 * @param {string} title 开关名称
 * @param {bool} status 开关状态
 * @param {function} onChange 开关函数
 * @returns {HTMLElements} 自定义开关
 */
function SwitchItem(props) {
  const { title, status, onChange } = props;
  return (
    <div className={style.roamSettingItem}>
      <span>{title}</span>
      <Switch checked={status} onChange={onChange} className={style.customSwitch} />
    </div>
  );
}

SwitchItem.propTypes = {
  title: PropTypes.string.isRequired,
  status: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

function FreeRoamOption(props) {
  const [hitStatus, setHitStatus] = useState(false);
  const [enableGravity, setGravity] = useState(false);
  const [manHeightVisible, showManHeight] = useState(false);
  // const [manHeight, setManHeight] = useState(props.realManHeight);
  const [immersion, setImmersion] = useState(false);
  const [viewLock, setViewLock] = useState(
    props.BOS3D.GlobalData.WalkingWithViewLock
  );

  useEffect(() => {
    const EVENT_NAME = props.BOS3D.EVENTS.ON_POINTERLOCK_EXIST;
    const fn = (ev) => {
      if (ev.type === EVENT_NAME) {
        setImmersion(false);
      }
    };
    props.viewer.registerControlEventListener(EVENT_NAME, fn);

    return () => props.viewer.unregisterControlEventListener(EVENT_NAME, fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleManHeight(value) {
    props.onChange("manHeight", true, {
      value: Number(value),
    });
  }

  const { modelDetail } = props;
  const isPicker = false; // 是否是新数据，是就隐藏
  const settingItemList = [
    //  5.0 新数据先隐藏
    ...isPicker ? [] : [{
      title: '碰撞',
      status: hitStatus,
      onChange: () => {
        setHitStatus(!hitStatus);
        props.onChange('hit', !hitStatus);
      },
      show: true
    }],
    {
      title: '俯仰锁定',
      status: viewLock,
      onChange: () => {
        props.onChange("viewLock", !viewLock);
        setViewLock(!viewLock);
      },
      show: true
    },
    {
      title: '视角跟随',
      status: immersion,
      onChange: () => {
        props.onChange("immersion", !immersion);
        setImmersion(!immersion);
      },
      show: true
    },
    //  5.0 新数据先隐藏
    ...isPicker ? [] : [
      {
        title: '重力',
        status: enableGravity,
        onChange: () => {
          setGravity(!enableGravity);
          props.onChange("gravity", !enableGravity);
        },
        show: true
      },
      {
        title: '镜头高度',
        status: manHeightVisible,
        onChange: () => {
          showManHeight(!manHeightVisible);
        },
        show: enableGravity
      },
    ]
  ];

  return (
    <div
      role="presentation"
      onClick={(e) => e.stopPropagation()}
      className={style.roamSetting}
    >
      {
        settingItemList.map(
          item => (
            item.show ? (
              <SwitchItem
                title={item.title}
                status={item.status}
                onChange={item.onChange}
                key={item.title}
              />
            ) : null
          ))
      }
      {/* 镜头高度设置 */}
      {
        manHeightVisible && enableGravity
          ? (
            <div className={style.customNumberInputWrap}>
              <InputNumber
                size="small"
                className={style.customNumberInput}
                min={0}
                max={999}
                value={props.realManHeight}
                step={0.1}
                onChange={handleManHeight}
                stringMode
                onBlur={() => {
                  props.BOS3D.Plugins.Roam.Roam.changeRoamConfig(props.viewer, true, "manHeight", {
                    value: props.realManHeight
                  });
                }}
              />
              <span className={style.customNumberInputUnit}>m</span>
            </div>
          ) : null
      }
      {/* 无用的占位 */}
      {!manHeightVisible || !enableGravity ? (
        <div style={{ width: '84px' }} />
      ) : null}
      {!enableGravity ? (
        <div style={{ width: '84px' }} />
      ) : null}
    </div>
  );
}

FreeRoamOption.propTypes = {
  onChange: PropTypes.func.isRequired,
  realManHeight: PropTypes.number.isRequired,
  BOS3D: PropTypes.object.isRequired,
  viewer: PropTypes.object.isRequired,
  modelDetail: PropTypes.object.isRequired,
};

export default FreeRoamOption;
