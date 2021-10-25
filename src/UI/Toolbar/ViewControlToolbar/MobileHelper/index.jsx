import React from "react";
import PropTypes from "prop-types";
import Icon from "Base/Icon";
import Modal from "Base/Modal";
import { AntdIcon } from '../../../utils/utils';
import iconstyle from '../../bottom.less';
import style from './style.less';

const CAREME_BTNS = [
  {
    value: 'Top',
    lable: '上'
  },
  {
    value: 'Bottom',
    lable: '下'
  },
  {
    value: 'Left',
    lable: '左'
  },
  {
    value: 'Right',
    lable: '右'
  },
  {
    value: 'Front',
    lable: '前'
  },
  {
    value: 'Back',
    lable: '后'
  },
];

class MobileHelper extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selected: false
    };
  }

  onClick() {
    this.setState((state) => ({
      selected: !state.selected
    }));
  }

  setCameraView(place) {
    const { viewer, BIMWINNER } = this.props;
    viewer.flyToStandardView(BIMWINNER.BOS3D.standardView[place], 0, () => {
    }, () => {
    });
    // this.props.viewer.render();
  }

  render() {
    const { selected } = this.state;
    const { viewer } = this.props;
    const isMobile = true;
    const modalInfo = {
      width: isMobile ? '156px' : '350px',
      height: isMobile ? '90%' : '70%',
      top: isMobile ? '16px' : undefined,
      left: isMobile ? '16px' : undefined,
      right: isMobile ? 'initial' : undefined,
    };

    // console.log(viewer, 'viewer');

    return (
      <div>
        <div
          title="视图控制"
          role="button"
          tabIndex={0}
          onClick={() => {
            this.onClick();
          }}
        >
          <Icon
            icon={<AntdIcon type="iconicon_shitukongzhigongnengrukou" className={iconstyle.icon} />}
            title="视图控制"
            selected={selected}
          />
        </div>

        <Modal
          onCancel={() => {
            this.onClick();
          }}
          visible={selected}
          title="视图控制"
          width={modalInfo.width}
          viewportDiv={this.props.viewer.viewportDiv}
          theme="mobile-theme-one"
        >
          <div className={style.container}>
            <div className={style.top}>
              <div
                role="presentation"
                className={style.topBtn}
                onClick={() => {
                  this.props.mainView();
                }}
              >
                主视图
              </div>
            </div>
            <div className={style.middle}>
              {
                CAREME_BTNS.map(btn => (
                  <div
                    role="presentation"
                    className={style.middleBtn}
                    key={btn.value}
                    onClick={(e) => {
                      e.stopPropagation();
                      this.setCameraView(btn.value);
                    }}
                  >
                    {btn.lable}
                  </div>
                ))
              }
            </div>
            <div className={style.bottom}>
              <div
                role="presentation"
                className={`${style.btn} ${style.btnPrimary}`}
                onClick={() => {
                  this.props.resetMainView();
                }}
              >
                重置主视图

              </div>
              <div
                role="presentation"
                className={style.btn}
                onClick={() => {
                  this.props.setMainView();
                }}
              >
                重设当前为主视图

              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}

MobileHelper.propTypes = {
  mainView: PropTypes.func.isRequired,
  setMainView: PropTypes.func.isRequired,
  resetMainView: PropTypes.func.isRequired,
  viewer: PropTypes.object.isRequired,
  BIMWINNER: PropTypes.object.isRequired,
};

export default MobileHelper;
