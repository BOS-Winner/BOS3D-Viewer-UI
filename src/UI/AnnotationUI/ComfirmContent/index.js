import React, { useState } from "react";
import toastr from "customToastr";
import style from "./style.less";
import tipImg from '../../Base/img/people/tip-info.png';
import successTipImg from '../../Base/img/people/tip-success.png';

export default function ComfirmContent(props) {
  const { haveUnSavedStuff } = props;
  const [value, changeValue] = useState(props.initValue);

  const onSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    props.onSubmit && props.onSubmit(props.type, value, e);
    // 草稿未保存关闭标注
    if (props.update) {
      toastr.success("更新批注成功");
      props.handleUpdate && props.handleUpdate();
    } else {
      toastr.success("添加批注成功");
    }
    props.onClose();
    // 取消弹窗
    props.onCancel && props.onCancel(e);
  };

  const onCancel = (e) => {
    props.onCancel && props.onCancel(e);
  };

  return (
    <div className={style.container}>

      {haveUnSavedStuff && (
        <section>
          <div className={style.imgWrap}>
            <img className={style.img} src={tipImg} alt="" />
          </div>
          <h3 className={style.h3}>还没保存，确定要退出吗？</h3>
          <div className={style.btnWrap}>
            <button type="button" className={style.btn} onClick={onCancel}>取消</button>
            <button
              type="button"
              className={`${style.btn} ${style.btnDanger} `}
              onClick={(e) => {
                props.onClose();
                props.onCancel(e);
              }}
            >
              确定
            </button>
          </div>
        </section>
      )}

      {!haveUnSavedStuff && (
        <section>
          <div className={style.imgWrap}>
            <img className={style.img} src={successTipImg} alt="" />
          </div>
          <h3 className={style.h3}>批注保存成功</h3>
          <section className={style.desc}>
            您可在“完成批注”对它进行预览、编辑、下载和删除
          </section>
          <div className={style.btnWrap}>
            <button type="button" className={style.btn} onClick={onCancel}>继续编辑</button>
            <button type="button" className={`${style.btn} ${style.btnPrimary} `} onClick={onSubmit}>完成批注</button>
          </div>
        </section>
      )}
    </div>
  );
}
