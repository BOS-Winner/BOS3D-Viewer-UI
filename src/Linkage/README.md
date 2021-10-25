二三维联动插件使用说明
============

# 使用方法

## html

需要引入对应的资源文件

```html
<head>
  <link rel="stylesheet" type="text/css" href="BOS3DUI.min.css" />
  <link rel="stylesheet" type="text/css" href="bos3dui-linkage.min.css" />
  <link rel="stylesheet" type="text/css" href="lobibox.css" />
  <link rel="stylesheet" type="text/css" href="viewer2D.css" />
</head>
<body>
  <!--id随意，宽高自己指定，但不能太小-->
  <div id="linkage" style="width: 95vw; height: 95vh;"></div>
  <script src="BOS3D.min.js"></script>
  <script src="BOS2D.min.js"></script>
  <script src="BOS3DUI.min.js"></script>
  <!--必须最后引入-->
  <script src="bos3dui-linkage.min.js"></script>
  <script>
    const linkage = new Linkage({
      BOS3D: window.BOS3D,
      BOS2D: window.BOS2D,
      BOS3DUI: window.BOS3DUI,
      selector: "#linkage", // 插件会插入到这个dom内部
      host: "//bos3d-alpha.bimwinner.com", // 对应viewer3D初始化参数里的host
      token: "", //token
      onInitComplete: () => {
        // 由于涉及到异步初始化，如果想在一开始就获取到如下实例，需要用这个方法
        // console.log('test: ', linkage.viewer3D, linkage.viewer2D, linkage.bos3dui)
      }
    });
    linkage.addView("M1577676674083", "bos3dalpha");
  </script>
</body>
```

## 注意的点

* 资源引入顺序，注意插件的script必须最后引入
* viewer3D、viewer2D、bos3dui实例分别为 `linkage.viewer3D` `linkage.viewer2D` `linkage.bos3dui`
* addView, removeView方法不能直接调用viewer3D的，而是要改用 `linkage.addView` `linkage.removeView`，方法签名不变
