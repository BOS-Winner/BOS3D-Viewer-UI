import React from "Libs/react";
import PropTypes from "prop-types";
import Loading from "./Loading";
import toastr from "../../../../toastr";
import config from "./config";
import settingStyle from "../../style.less";
import style from "./style.less";

function SkyBox(props) {
  const [loading, setLoading] = React.useState(false);
  const [currentSkyBox, setCurrentSkyBox] = React.useState(props.displaySetting.skybox);

  React.useUpdateEffect(() => {
    const box = props.displaySetting.skybox;
    if (box !== 'none') {
      setLoading(true);
      // 左、右、后、前、上、下
      props.viewer.setSkyBox(
        [
          `${config[box].path}/left.jpg`,
          `${config[box].path}/right.jpg`,
          `${config[box].path}/back.jpg`,
          `${config[box].path}/front.jpg`,
          `${config[box].path}/up.jpg`,
          `${config[box].path}/down.jpg`,
        ],
        // onLoad
        () => {
          props.viewer.render();
          setCurrentSkyBox(box);
          setLoading(false);
        },
        // onProgress
        () => { },
        // onError
        () => {
          setLoading(false);
          toastr.error('', '获取天空盒失败', {
            target: `#${props.viewer.viewport}`,
          });
        }
      );
    } else {
      props.viewer.setSkyBox();
      props.viewer.render();
      setCurrentSkyBox(box);
    }
  }, [
    props.displaySetting.skybox,
  ]);

  const switchSkyBox = box => {
    props.changeDisplaySetting('skybox', box);
  };

  const MOBILE_IMG_JSX = [];
  Object.keys(config).forEach(t => {
    MOBILE_IMG_JSX.push((
      <div className={`${style.mobileThumbItem} ${t === currentSkyBox ? style.selected : ''}`} key={t}>
        {
          config[t].src ? (
            <img
              alt="img"
              className={`${style.thumbImg}`}
              style={config[t].src ? {} : { background: '#2E2F30' }}
              onClick={() => switchSkyBox(t)}
              src={config[t].src}
            />
          )
            : (
              <div
                role="img"
                className={`${style.thumbImg}`}
                style={{ background: '#2E2F30' }}
                onClick={() => switchSkyBox(t)}
              />
            )
        }
        <div className={`${style.mobileTitleWrap}`}>
          <span className={`${style.mobileTitle}`}>
            {config[t].name}
          </span>
        </div>
      </div>

    ));
  });

  if (props.isMobile) {
    return (
      <section>
        <div className={settingStyle.settingItem} style={{ borderBottom: 'none' }}>
          <div>天空盒</div>
        </div>
        <div className={style.thumbContainer}>
          {MOBILE_IMG_JSX}
        </div>
        <Loading open={loading} />
      </section>
    );
  }

  const imgs = [];
  Object.keys(config).forEach(t => {
    imgs.push((
      <div
        role="img"
        key={t}
        className={`${style.thumbItem} ${t === currentSkyBox ? style.selected : ''}`}
        style={config[t].thumbnail ? { backgroundImage: config[t].thumbnail } : { background: '#2E2F30' }}
        onClick={() => switchSkyBox(t)}
      >
        {config[t].name}
      </div>
    ));
  });

  return (
    <div className={settingStyle.settingItem}>
      <div>天空盒</div>
      <div className={style.thumbContainer}>
        {imgs}
      </div>
      <Loading open={loading} />
    </div>
  );
}

SkyBox.propTypes = {
  viewer: PropTypes.object.isRequired,
  displaySetting: PropTypes.object.isRequired,
  changeDisplaySetting: PropTypes.func.isRequired,
};

export default SkyBox;
