import React, { } from "react";
import _ from "lodash-es";
import style from "./Detail.less";
import { AntdIcon, dateToString } from '../../../utils/utils';
import Modal from "../../../Base/Modal";

// 详情相关
function Detail(props) {
  const { data, visible } = props;
  if (!visible) return null;
  const position = data.startPosition || data.position || [];
  const color = data.color;
  let domColor = '';
  let domOpacity = 1;
  if (color) {
    domColor = (color[0] << 16) | (color[1] << 8) | (color[2]);
    domOpacity = Math.round(color[3] * 255);
  }

  return (
    <Modal
      visible={props.visible}
      onCancel={() => {
        props.onCancel && props.onCancel();
      }}
      title="详情"
      height="auto"
      width="370px"
      right="calc(50% - 175px)"
      minWidth={350}
      minHeight={330}
      viewportDiv={props.viewer.getViewerImpl().domElement}
    >
      <section className={style.container}>
        <div className={style.itemGroup}>
          <div className={style.title}>标签名称：</div>
          <div>{data.title}</div>
        </div>
        {data.type === 'dom'
          && (
            <div className={style.itemGroup}>
              <div className={style.title}>背景色：</div>
              <div
                className={style.disabledDiv}
                style={{
                  width: 36,
                  backgroundColor: `#${_.padStart(domColor.toString(16), 6, '0')}`,
                  opacity: domOpacity / 255
                }}
              />
            </div>
          )}
        <div className={style.itemGroup}>
          <div className={style.title}>修改时间：</div>
          <div>{dateToString(new Date(data.utime))}</div>
        </div>
        {data.type === 'sprite' && (
          <>
            <div className={style.itemGroup}>
              <div className={style.title}>图标：</div>
              <div className={style.imgWrap}>
                <img alt="" className={style.img} src={data.url} />
              </div>
            </div>
            <div className={style.itemGroup}>
              <div className={style.title}>标签大小：</div>
              <div>{data.scale}</div>
            </div>
          </>
        )}

        <div className={style.itemGroup}>
          <div className={style.title}>标签位置：</div>
          <div>
            {position
              && (
                <div>
                  <div>
                    x:
                    {position[0]}
                  </div>
                  <div>
                    y:
                    {position[1]}
                  </div>
                  <div>
                    z:
                    {position[2]}
                  </div>
                </div>
              )}
          </div>
        </div>

        <div className={style.itemGroup}>
          <div className={style.title}>标签备注：</div>
          <div className={style.comment}>
            {data.comment || ''}
          </div>
        </div>

      </section>

      {/* <div className={style.bottomButtons}>
      <div className={style.button}
      >
        取消
      </div>
      <div
        className={`${style.button} ${style.buttonConfirm}`}
        onClick={() => this.onConfirm()}
      >
        确定
      </div>
    </div> */}
    </Modal>
  );
}

export default Detail;
