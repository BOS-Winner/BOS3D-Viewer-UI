import React, { useState } from "react";
import style from "./style.less";
import Empty from "../../../Base/Empty";
import NOFondImgPath from '../img/empty.png';
import MarkItem from "../MarkItem/MarkItem";
import Header from "../../../Base/Header";

const mapTitle = {
  'sprite': '精灵标签列表',
  'dom': '文字标签列表'
};

function CardList(props) {
  const { curMarkType } = props;
  const dataSource = curMarkType === 'dom' ? props.dom : props.sprite;

  const middleDataList = (dataSource || []).map((item, index) => ({ ...item, idx: index }));
  middleDataList.sort((a, b) => b.utime - a.utime);

  const domMarkJSX = [];
  middleDataList.forEach((item, idx) => {
    const mark = item;
    domMarkJSX.push(
      <MarkItem
        {...mark}
        selectedMarkId={props.selectedMarkId}
        selectMark={props.selectMark}
        onRemove={props.onRemove}
        viewer={props.viewer}
        BIMWINNER={props.BIMWINNER}
        curMarkType={props.curMarkType}
        DOMMark={props.DOMMark}
        SpriteMark={props.SpriteMark}
        needConfirmRemove={props.needConfirmRemove}
        needConfirmEdit={props.needConfirmEdit}
        onNeverConfirm={props.onNeverConfirm}
        itemData={mark}
        onChangeDetailModal={props.onChangeDetailModal}
        updateBaseInfo={props.updateBaseInfo}
        updateView={props.updateView}
        key={mark.id}
        index={item.idx}
        isEdit={props.isEdit}
        changeDataSource={props.changeDataSource}
      />
    );
  });

  const HEIGHT = `${100 * domMarkJSX.length}px`;

  return (
    <div className={style.container}>
      <div className={style.header}>
        <Header title={mapTitle[props.curMarkType] || '没匹配到标题'} />
      </div>
      <div className={style.list} style={{ height: HEIGHT }}>
        {domMarkJSX.length ? domMarkJSX
          : (
            <div className={style.notFoundWrap}>
              <Empty image={NOFondImgPath} imageStyle={{ width: 'auto', height: 'auto' }}>
                <div>您还没有添加标签哦    </div>
              </Empty>
            </div>
          )}
      </div>
    </div>
  );
}

export default CardList;
