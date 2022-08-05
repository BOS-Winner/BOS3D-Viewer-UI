import React from "react";
import PropTypes from "prop-types";
import skyBox from "./static/1.png";
import ruler from "./static/2.png";
import light from './static/3.png';
import skyBoxColor from "./static/4.png";
import mode from "./static/5.png";
import btnG from "./static/6.png";
import example from "./static/example.png";
import style from "./Illustration.less";

export default function Illustration() {
  function Item({ title, content, type = null }) {
    if (type === "item") {
      return (
        <div className={style.subContainer}>
          <div className={style.subTitle}>
            {title}
          </div>
          <div className={style.content}>{content}</div>
        </div>
      );
    }
    return (
      <div className={style.itemContainer}>
        <div className={style.title}>
          <span>*</span>
          {title}
        </div>
        <div className={style.content}>{content}</div>
      </div>
    );
  }
  Item.propTypes = {
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  };
  return (
    <div className={style.container}>

      <img src={skyBox} alt="预览图片" />
      <Item
        title="什么是云烘焙："
        type=""
        content="采用服务端对原始的场景进行基于光线追踪的渲染烘焙，得到物体表面上每个点的光照信息，输出带有光照的贴图，使得模型带有光影信息，更具有真实感；"
      />

      <img src={ruler} alt="尺寸设置" />
      <Item
        title="输出贴图(宽度/高度)"
        type=""
        content="贴图的尺寸决定了烘焙后的渲染效果，贴图的尺寸越大烘焙的贴图就越清晰；推荐值：1024"
      />

      <img src={light} alt="平行太阳光" />
      <Item title="太阳光:" content="" type="" />
      <Item title="1. 开启太阳光：" type="item" content="若开启此项，在场景中增加太阳光源" />
      <img src={example} alt="平行太阳光" />
      <Item
        title="2. 太阳光方向："
        type="item"
        content="其为世界坐标下的方向向量，用来描述平行光的发射方向（可以拖动方位角0-360，高度角0-90来确定太阳光方向）;"
      />
      <Item
        title="3. 太阳光颜色："
        type="item"
        content="太阳光源的颜色，会影响照射到物体表面的光线的色调；"
      />
      <Item
        title="4. 太阳光强度："
        type="item"
        content="太阳光源的强度，影响照射到物体表现的光照的强度，设置越大则照射效果越亮；"
      />
      {/* <Item
        title="光线放射次数："
        content="0：无光照；1：直接光照，无反射；2：光线会有二次反射，此时即可呈现主流的全局光照效果，包含物体表面的漫反射、遮挡阴影等效果。此值设置不建议超过2；"
      /> */}
      <Item
        title="5. 间接光强度："
        type="item"
        content="用来调节二次反射光的强度，值越大，曝光程度越大；推荐值：1；"
      />

      <Item
        title="环境光"
        type=""
        content=""
      />
      <img src={skyBoxColor} alt="环境遮蔽模式" />
      <Item
        title="1. 开启环境光"
        type="item"
        content="若开启此项，增加环境光渲染"
      />
      <Item
        title="2. 环境光颜色"
        type="item"
        content="用来设置环境光的颜色；推荐值：[255,255,255]；"
      />
      <Item
        title="3. 环境光强度"
        type="item"
        content="用来设置环境光的强度；推荐值：1；"
      />

      <Item
        title="其他"
        type=""
        content=""
      />
      <img src={mode} alt="环境遮蔽模式" />
      <Item
        title="1. 开启环境光："
        type="item"
        content="若开启此项，可设置环境遮蔽强度和贴图的清晰度；"
      />
      <Item
        title="2. 遮蔽强度："
        type="item"
        content="用来控制环境遮蔽烘焙时的遮蔽强度，控制物体间遮挡的明暗度表现，此值设置越大则遮蔽效果越强；推荐值：1；"
      />
      <Item
        title="3. 贴图清晰度："
        type="item"
        content="用来设置烘焙采样的比例，会影响贴图的清晰度；推荐值：1；"
      />

      <img src={btnG} alt="功能" />

      <Item title="重置参数：" content="重置烘焙参数，恢复初始值；" type="" />
      <Item
        title="烘焙预览："
        type=""
        content="将以低分辨率进行快速烘焙，预览大致效果；"
      />
      <Item title="开始烘焙：" type="" content="新建烘焙任务，根据烘焙参数进行服务端烘焙；" />
      <Item title="关闭烘焙模式：" type="" content="不启用烘焙效果，恢复至初始场景；" />

      <Item
        title="下载当前烘焙文件："
        type=""
        content="下载烘焙模型，支持烘焙模型上传至平台；"
      />
    </div>
  );
}
