import React from "Libs/react";
import PropTypes from "prop-types";
import DateFnsUtils from '@date-io/date-fns';
import zhCN from "date-fns/locale/zh-CN";
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';
import SunCalc from "suncalc";
import Slider from "Base/Slider";
import Ranger from "Base/Ranger";
import style from "./style.less";
import settingStyle from "../../style.less";
import datePickerImg from "../datePicker.png";

const geoLocation = {
  beijing: {
    name: '北京',
    location: [39.908721, 116.397484]
  },
  shanghai: {
    name: '上海',
    location: [31.240679, 121.497009]
  },
  shenzhen: {
    name: '深圳',
    location: [22.639560, 114.020879]
  },
  wuhan: {
    name: '武汉',
    location: [30.544531, 114.302389]
  },
  wulumuqi: {
    name: '乌鲁木齐',
    location: [43.819735, 87.584035]
  },
  chengdu: {
    name: '成都',
    location: [30.659691, 104.026551]
  },
  harbin: {
    name: '哈尔滨',
    location: [45.574307, 127.829619]
  },
};

function SunLight(props) {
  const [showDatePicker, openDatePicker] = React.useState(false);
  const { time, date, city } = props.displaySetting.lightEffect;
  const showLightEffect = props.displaySetting.lightEffect.enable;

  const onChange = opt => {
    const obj = {};
    if (opt.city) {
      obj.city = opt.city;
    }
    if (opt.date) {
      obj.date = opt.date;
    }
    if (typeof opt.time === 'number') {
      obj.time = opt.time;
    }
    props.changeDisplaySetting('lightEffect', {
      ...props.displaySetting.lightEffect,
      ...obj,
    });
  };

  const hour = Math.trunc(time / 60);
  const minute = time % 60;
  const list = Object.keys(geoLocation);

  React.useUpdateEffect(() => {
    const _le = props.displaySetting.lightEffect;
    const _city = _le.city;
    const _date = _le.date;
    const _time = _le.time;
    const d = new Date(`${_date} ${Math.trunc(_time / 60)}:${_time % 60}:0`);
    const { azimuth, altitude } = SunCalc
      .getPosition(d, geoLocation[_city].location[0], geoLocation[_city].location[1]);
    const viewer = props.viewer;
    const dir = viewer.getLightDirFromAltitudeAndAzimuth(altitude, azimuth).clone();
    viewer.getRootScene().lightManager.lightDir = dir;
    if (props.displaySetting.enableShadow) {
      viewer.getRootScene().lightManager.shadowLightDir = dir.clone();
      viewer.updateShadowLight();
    }
    viewer.render();
  }, [
    props.displaySetting.lightEffect.city,
    props.displaySetting.lightEffect.date,
    props.displaySetting.lightEffect.time,
  ]);

  return (
    <>
      <div className={settingStyle.settingItem}>
        <div>光照效果</div>
        <Slider
          checked={showLightEffect}
          onClick={enable => {
            // 开启时要关闭光照效果
            if (enable) {
              props.changeDisplaySetting('enableExtraLight', false);
            }
            props.changeDisplaySetting('lightEffect', {
              ...props.displaySetting.lightEffect,
              enable,
            });
          }}
        />
      </div>
      <div className={`${style.container} ${showLightEffect ? style.show : style.hide}`}>
        <div className={style.item}>
          <div>
            选择位置
          </div>
          <select value={city} onChange={ev => onChange({ city: ev.target.value })}>
            {list.map(loc => <option key={loc} value={loc}>{geoLocation[loc].name}</option>)}
          </select>
        </div>
        <div className={style.item}>
          <div>时间</div>
          <div className={style.time}>
            <div>
              {hour.toString()
                .padStart(2, '0')}
              :
              {minute.toString()
                .padStart(2, '0')}
            </div>
            <Ranger
              min={0}
              max={1440}
              step={1}
              value={time}
              onChange={t => onChange({ time: t })}
            />
          </div>
        </div>
        <div className={style.item}>
          <div>日期</div>
          <MuiPickersUtilsProvider utils={DateFnsUtils} locale={zhCN}>
            <div
              className={style.datePickerContainer}
              aria-hidden
            >
              <DatePicker
                classes={{
                  root: style.datePicker
                }}
                value={date}
                open={showDatePicker}
                onOpen={() => openDatePicker(true)}
                inputVariant="outlined"
                onChange={d => {
                  openDatePicker(false);
                  onChange({ date: d.toLocaleDateString() });
                }}
                onClose={() => openDatePicker(false)}
                format="yyyy年MM月dd日"
                okLabel="确定"
                cancelLabel="取消"
                // views={pickerView}
                // ToolbarComponent={_p => (
                //   <CalendarToolbar date={_p.date} onChangeView={v => setPickerView(v)} />
                // )}
              />
              <img
                src={datePickerImg}
                alt="选择日期"
                onClick={() => openDatePicker(!showDatePicker)}
              />
            </div>
          </MuiPickersUtilsProvider>
        </div>
      </div>
    </>
  );
}

SunLight.propTypes = {
  viewer: PropTypes.object.isRequired,
  displaySetting: PropTypes.object.isRequired,
  changeDisplaySetting: PropTypes.func.isRequired,
};

export default SunLight;
