用户使用文档
==========================

# 变更说明

## 新增

* 用户可自定义右键菜单
* 用户可开启模型树节点统计功能
* 构件智能搜索
* 模型树添加半透明模式
* 模型树添加显示房间功能
* 模型天添加导出构件二维码功能

## 修改

* 构件常规搜索功能扩展
* 优化地图导出提示

## 移除

* 无

## 其他说明

* 针对ios safari出现bounce effect，如需屏蔽，可以在根据项目实际情况参考 [这个方案](https://www.bram.us/2016/05/02/prevent-overscroll-bounce-in-ios-mobilesafari-pure-css/) 。
* 如果出现样式错乱问题，先查看样式是不是和antd冲突。

# 初始化UI

```html
<head>
	<link rel="stylesheet" type="text/css" href="BOS3DUI.min.css">
</head>
<body>
	<!-- 要先引入viewer3D的script，再引入UI的script -->
	<script src="BOS3D.min.js"></script>
	<script type="text/javascript" src="BOS3DUI.min.js"></script>
	<script>
		const option = {host: "http://localhost", viewport: "viewport"};
    const viewer3D = new BOS3D.Viewer(option);
    viewer3D.addView("xxx", "xxx");
    // 以下两个个参数都是必填的
    const bos3dui = new BOS3DUI({
        viewer3D: viewer3D,
        BOS3D: BOS3D,
      	// 可选，需要显示哪些工具栏。默认都是true
      	funcOption: {
            fit: false, // 聚焦
            reset: false, // 复位
            undo: false, // 撤销
            roam: false, // 漫游
            pickByRect: false, // 框选
            hide: false, // 隐藏
            isolate: false, // 构件隔离
            section: false, // 剖切
            wireFrame: false, // 线框化
            scatter: false, // 模型分解
            changeCptColor: false, // 构件变色
            fullScreen: false, // 全屏
            changeBgColor: false, // 改变背景色
            cptInfo: false, // 构件信息
            infoTree: false, // 结构树
            measure: false, // 测量
            mark: false, // 标签
            snapshot: false, // 快照
            annotation: false, // 批注
            moreMenu: false, // 更多
          }
      });
	</script>
</body>
```


# 自定义右键菜单功能

| 名称        | 说明     | 类型        | 是否必须 | 示例           |
| ----------- | -------- | ----------- | -------- | -------------- |
| object | 参数对象 | 对象 Object | 是       | 看调用方式举例 |
| object.label | 按钮的名称，如果要覆盖默认的行为，这里需要传原始按钮的名称 | 字符串 string | 是       | new BOS3D.Viewer() |
| object.disable | 按钮是否不可点击 | 布尔值 Boolean 默认 false| 否       | false |
| object.func | 按钮点击时要触发的方法,如果按钮有子按钮，那么会忽略该参数 | 函数 function | 否 ,默认为null    | function(){} |
| object.aka | 按钮的别名，有别名时优先显示别名。比如要给默认的按钮改名字 | 字符串 string | 否      | "name" |
| object.children | 按钮的子按钮列表，按钮的嵌套不能超过10层 | 数组对象 Array | 否      | 看调用方式举例 |

| 返回值说明 | 类型 | 示例 |
| ---------- | ---- | ---- |
| 无         |      |      |

```html

<head>
    <link rel="stylesheet" type="text/css" href="BOS3DUI.min.css">
</head>
<body>
<!-- 要先引入viewer3D的script，再引入UI的script -->
<script src="BOS3D.min.js"></script>
<script type="text/javascript" src="BOS3DUI.min.js"></script>
	<script>
		const option = {host: "http://localhost", viewport: "viewport"};
    const viewer3D = new BOS3D.Viewer(option);
    viewer3D.addView("xxx", "xxx");
    // 以下两个个参数都是必填的
    const bos3dui = new BOS3DUI({
        viewer3D: viewer3D,
        BOS3D: BOS3D,
      	// 可选，需要显示哪些工具栏。默认都是true
      	funcOption: {
            init: false, // 初始化
            fit: false, // 聚焦
            undo: false, // 撤销
            reset: false,//重置
            roam: false, // 漫游
            pickByRect: false, // 框选
            hide: false, // 隐藏
            isolate: false, // 构件隔离
            section: false, // 剖切
            wireFrame: false, // 线框化
            scatter: false, // 模型分解
            changeCptColor: false, // 构件变色
            setting: false, // 设置
            fullScreen: false, // 全屏
            changeBgColor: false, // 改变背景色
            cptInfo: false, // 构件信息
            infoTree: false, // 结构树
            measure: false, // 测量
            mark: false, // 标签
            snapshot: false, // 快照
            annotation: false, // 批注
            moreMenu：false//更多
        },
        //  自定义菜单功能传参
        customMenu:
            [
                {
                    label: '隐藏',
                    disable: true,
                    func: null,
                    aka: "我就试试",
                    children: null,
                },
                {
                    label: '聚焦',
                    disable: false,
                    func: null,
                    aka: null,
                    children: null,
                },
                {
                    label: '属性信息',
                    disable: false,
                    func: null,
                    aka: null,
                    children: null,
                },
                {
                    label: '更多',
                    disable: false,
                    func: null,
                    aka: null,
                    children: [
                        {
                            label: '其他构件半透明',
                            disable: false,
                            func: null,
                            aka: null,
                            children: null,
                        },
                        {
                            label: '相同类型构件',
                            disable: false,
                            func: null,
                            aka: null,
                            children: null,
                        },
                        {
                            label: '所属部件/族',
                            disable: false,
                            func: null,
                            aka: null,
                            children: null,
                        },
                    ]
                },
                {
                    label: '显示所有对象',
                    disable: false,
                    func: null,
                    aka: null,
                    children: null,
                },
                {
                    label: '123123',
                    disable: false,
                    func: function (e) {
                        console.log(e)
                    },
                    aka: null,
                    children: null,
                },
            ]
        })
        ;
    </script>
</body>
```

# 模型树统计功能
| 名称        | 说明     | 类型        | 是否必须 | 示例           |
| ----------- | -------- | ----------- | -------- | -------------- |
| object | 参数对象 | 对象 Object | 是       | 看调用方式举例 |
| object.layer | 显示模型树节点统计的层数 | 数字 Number | 是       | {layer: 1, order: true} |
| object.order | 层级正序还是逆序 | 布尔值 Boolean 默认 true| 是       | {layer: 1, order: tue} |

### 配置描述：
1. 正序配置：{layer: 3, order:true},只显示从1层（根节点）到第3层的节点统计
2. 倒序配置：{layer: 1, order: false}，只显示从第1层（每个分支的叶子节点为第1层）到最顶层的节点数量统计**

| 返回值说明 | 类型 | 示例 |
| ---------- | ---- | ---- |
| 无         |      |      |

### 模型树统计功能实例
```html

<head>
    <link rel="stylesheet" type="text/css" href="BOS3DUI.min.css">
</head>
<body>
<!-- 要先引入viewer3D的script，再引入UI的script -->
<script src="BOS3D.min.js"></script>
<script type="text/javascript" src="BOS3DUI.min.js"></script>
	<script>
		const option = {host: "http://localhost", viewport: "viewport"};
    const viewer3D = new BOS3D.Viewer(option);
    viewer3D.addView("xxx", "xxx");
    // 以下两个个参数都是必填的
    const bos3dui = new BOS3DUI({
        viewer3D: viewer3D,
        BOS3D: BOS3D,
        // 正序配置：{layer: 3, order:true},只显示从1层（根节点）到第3层的节点统计；倒序配置：{layer: 1, order: false}，只显示从第1层（每个分支的叶子节点为第1层）到最顶层的节点数量统计
        treeNodeStatistic: {layer: 2, order: false}, 
      	// 可选，需要显示哪些工具栏。默认都是true
      	funcOption: {
            init: false, // 初始化
            fit: false, // 聚焦
            undo: false, // 撤销
            reset: false,//重置
            roam: false, // 漫游
            pickByRect: false, // 框选
            hide: false, // 隐藏
            isolate: false, // 构件隔离
            section: false, // 剖切
            wireFrame: false, // 线框化
            scatter: false, // 模型分解
            changeCptColor: false, // 构件变色
            setting: false, // 设置
            fullScreen: false, // 全屏
            changeBgColor: false, // 改变背景色
            cptInfo: false, // 构件信息
            infoTree: false, // 结构树
            measure: false, // 测量
            mark: false, // 标签
            snapshot: false, // 快照
            annotation: false, // 批注
            moreMenu：false//更多
        },
       
    )};
    </script>
</body>
```

# 事件监听与控制

## 快照

```js
const snapshot = bos3dui.snapshot;
```

### 控制方法

#### add

作用： 把单个快照对象信息放入到渲染到快照列表

形式参数： 有

| 名称        | 说明     | 类型        | 是否必须 | 示例           |
| ----------- | -------- | ----------- | -------- | -------------- |
| snapshotObj | 快照信息 | 对象 Object | 是       | 看调用方式举例 |

| 返回值说明 | 类型 | 示例 |
| ---------- | ---- | ---- |
| 无         |      |      |

调用方式：


```javascript
    /**
     * add 根据传参初始加载快照列表
     */

    var snapshotObj = {
        cameraState: cameraState,      //{Object} 对象，相机状态，包含position、target、up
        componentState: componentState,   //{Array} 对象数组 , 构件信息，
        highlightComponentsKeys: highlightComponentsKeys,   //{Array}数组，高亮的构件key集合
        highlightModelsKeys: highlightModelsKeys,   //{Array}数组，高亮的模型key集合
        imageURL: imgURL,  //{base64} 当前canvas的截图
        width: w,    //{int} 图片宽度，当前canvas图片的宽度
        height: h,   //{int} 图片高度，当前canvas图片的高度
        num:　num,    //{int} 当前快照列表的序号
        code: new Date().getTime().toString(),
        name: "快照" + num,     //快照名称
        description: "无注释"   //快照描述
    };
    snapshot.add(snapshotObj);

```
#### delete

删除指定快照

形式参数： 有

| 名称 | 说明    | 类型          | 是否必须 | 示例       |
| ---- | ------- | ------------- | -------- | ---------- |
| key  | 快照key | 字符串 string | 是       | "35165165" |

| 返回值说明 | 类型 | 示例 |
| ---------- | ---- | ---- |
| 无         |      |      |

调用方式：

```javascript
/**
 * 删除指定快照
 * @method delete
 * @param {string} key 快照key
 * @return {void}
 */
snapshot.delete("35165165");
```

#### update

该方法用来更新模型快照

形式参数： 有

| 名称      | 说明    | 类型          | 是否必须 | 示例       |
| --------- | ------- | ------------- | -------- | ---------- |
| key       | 快照key | 字符串 string | 是       | "35165165" |
| parameter | 参数    | 对象 obkect   | 是       | 见下方     |

| 返回值说明 | 类型 | 示例 |
| ---------- | ---- | ---- |
| 无         |      |      |

调用方式：

```javascript
/**
 * 该方法用来更新模型快照
 * @method update
 * @param {string} key 快照key
 * @param {object} [parameter] 更新的参数
 * @param {string} [parameter.cameraState] 相机状态，包含position、target、up
 * @param {string} [parameter.componentState] 构件状态
 * @param {array} [parameter.highlightComponentsKeys] 高亮构件数组
 * @param {array} [parameter.highlightModelsKeys] 高亮模型数组
 * @param {string} [parameter.imageURL] base64格式图片
 * @return {void}
 */
 var obj={
             cameraState: cameraState,      //{string} 对象，相机状态，包含position、target、up
             componentState: componentState,   //{string} 对象数组 , 构件信息，
             highlightComponentsKeys: highlightComponentsKeys,   //{Array}数组，高亮的构件key集合
             highlightModelsKeys: highlightModelsKeys,   //{Array}数组，高亮的模型key集合
             imageURL: imgURL,  //{base64} 当前canvas的截图
             }
snapshot.update("35165165",obj);
```

#### rename

重命名指定快照

形式参数： 有

| 名称 | 说明     | 类型          | 是否必须 | 示例       |
| ---- | -------- | ------------- | -------- | ---------- |
| key  | 快照key  | 字符串 string | 是       | "35165165" |
| name | 快照名称 | 字符串 string | 是       | "快照1"    |

| 返回值说明 | 类型 | 示例 |
| ---------- | ---- | ---- |
| 无         |      |      |

调用方式：

```javascript
/**
 * 重命名指定快照
 * @method rename
 * @param {string} key 指定快照key
 * @param {string} name 快照的新名称
 * @return {void}
 */
snapshot.rename("35165165","快照1");
```

#### annotation

该方法用来给模型快照添加或替换描述，

形式参数： 有

| 名称        | 说明     | 类型          | 是否必须 | 示例       |
| ----------- | -------- | ------------- | -------- | ---------- |
| key         | 快照key  | 字符串 string | 是       | "35165165" |
| description | 快照注释 | 字符串 string | 是       | "注释1"    |

| 返回值说明 | 类型 | 示例 |
| ---------- | ---- | ---- |
| 无         |      |      |

调用方式：

```javascript
/**
 * 该方法用来给模型快照添加或替换描述，
 * @method annotation
 * @param  {string} key  快照的key
 * @param  {string} description  快照的注释
 * @return {void}
 */
snapshot.annotation("35165165","注释1");
```


​
#### restoreToSnapshot

还原到指定快照，

形式参数： 有

| 名称 | 说明    | 类型          | 是否必须 | 示例       |
| ---- | ------- | ------------- | -------- | ---------- |
| key  | 快照key | 字符串 string | 是       | "35165165" |


| 返回值说明 | 类型 | 示例 |
| ---------- | ---- | ---- |
| 无         |      |      |

调用方式：

```javascript
/**
 * 还原到指定快照
 * @method restoreToSnapshot
 * @param {string} key 快照key
 * @return {void}
 */
snapshot.restoreToSnapshot("35165165");
```


​

#### clear

作用： 清除所有的快照列表

| 名称 | 说明 | 类型 | 是否必须 | 示例 |
| ---- | ---- | ---- | -------- | ---- |
| 无   |      |      |          |      |


| 返回值说明 | 类型 | 示例 |
| ---------- | ---- | ---- |
| 无         |      |      |

调用方式：

```javascript
/**
 * clear 清除所有的快照列表
 * @method clear
 * @return {void}
 */
snapshot.clear();
```
#### makeSnapshots

作用： 获取当前快照信息

形式参数： 无

返回数据： 对象类型 {Object},数据格式如下

```javascript
var obj={
cameraState: cameraState,      //{string} 对象，相机状态，包含position、target、up
componentState: componentState,   //{string} 对象数组 , 构件信息，
highlightComponentsKeys: highlightComponentsKeys,   //{Array}数组，高亮的构件key集合
highlightModelsKeys: highlightModelsKeys,   //{Array}数组，高亮的模型key集合
imageURL: imgURL,  //{base64} 当前canvas的截图
width: w,    //{int} 图片宽度，当前canvas图片的宽度
height: h,   //{int} 图片高度，当前canvas图片的高度
num:　num,    //{int} 当前快照列表的序号
code: new Date().getTime().toString(),
name: "快照" + num,     //快照名称
description: "无注释"   //快照描述
}
```

调用方式：

```javascript
/**
 * makeSnapshots 获取当前快照信息
 */
tool.makeSnapshots();
```
#### getSnapshotByKey

作用： 获取当前快照列表指定快照信息

形式参数： 有

| 名称 | 说明    | 类型          | 是否必须 | 示例       |
| ---- | ------- | ------------- | -------- | ---------- |
| key  | 快照key | 字符串 string | 是       | "35165165" |

| 返回值说明 | 类型   | 示例   |
| ---------- | ------ | ------ |
| 快照对象   | object | 见下方 |

返回数据： 对象数组 Object, 数据格式如下

```javascript
var obj={
cameraState: cameraState,      //{string} 对象，相机状态，包含position、target、up
componentState: componentState,   //{string} 对象数组 , 构件信息，
highlightComponentsKeys: highlightComponentsKeys,   //{Array}数组，高亮的构件key集合
highlightModelsKeys: highlightModelsKeys,   //{Array}数组，高亮的模型key集合
imageURL: imgURL,  //{base64} 当前canvas的截图
width: w,    //{int} 图片宽度，当前canvas图片的宽度
height: h,   //{int} 图片高度，当前canvas图片的高度
num:　num,    //{int} 当前快照列表的序号
code: new Date().getTime().toString(),
name: "快照" + num,     //快照名称
description: "无注释"   //快照描述
}
```

调用方式：

```javascript
/**
 * 该方法用来返回指定的快照信息
 * @method getSnapshotByKey
 * @param {string} key 快照key
 * @return {object} {cameraState: cameraState,      //{Object} 对象，相机状态，包含position、target、upcomponentState: componentState,   //{Array} 对象数组 , 构件信息，highlightComponentsKeys: highlightComponentsKeys,   //{Array}数组，高亮的构件key集合highlightModelsKeys: highlightModelsKeys,   //{Array}数组，高亮的模型key集合imageURL: imgURL,  //{base64} 当前canvas的截图width: w,    //{int} 图片宽度，当前canvas图片的宽度height: h,   //{int} 图片高度，当前canvas图片的高度num:　num,    //{int} 当前快照列表的序号code: new Date().getTime().toString(),   name: "快照" + num,     //快照名称description: "无注释"   //快照描述}
 */
snapshot.getSnapshotByKey("35165165");
```
#### getAllSnapshot

作用： 获取当前快照列表所有的快照信息

形式参数： 无

| 名称 | 说明 | 类型 | 是否必须 | 示例 |
| ---- | ---- | ---- | -------- | ---- |
| 无   |      |      |          |      |

| 返回值说明   | 类型     | 示例   |
| ------------ | -------- | ------ |
| 快照对象数组 | [object] | 见下方 |

返回数据： 对象数组 [Object], 数据格式如下


```javascript
[{
cameraState: cameraState,      //{string} 对象，相机状态，包含position、target、up
componentState: componentState,   //{string} 对象数组 , 构件信息，
highlightComponentsKeys: highlightComponentsKeys,   //{Array}数组，高亮的构件key集合
highlightModelsKeys: highlightModelsKeys,   //{Array}数组，高亮的模型key集合
imageURL: imgURL,  //{base64} 当前canvas的截图
width: w,    //{int} 图片宽度，当前canvas图片的宽度
height: h,   //{int} 图片高度，当前canvas图片的高度
num:　num,    //{int} 当前快照列表的序号
code: new Date().getTime().toString(),
name: "快照" + num,     //快照名称
description: "无注释"   //快照描述
}]
```


​
​

调用方式：

```javascript
/**
 * 该方法用来返回所有快照信息
 * @method getAllSnapshot
 * @return {array} [{cameraState: cameraState,      //{Object} 对象，相机状态，包含position、target、upcomponentState: componentState,   //{Array} 对象数组 , 构件信息，highlightComponentsKeys: highlightComponentsKeys,   //{Array}数组，高亮的构件key集合highlightModelsKeys: highlightModelsKeys,   //{Array}数组，高亮的模型key集合imageURL: imgURL,  //{base64} 当前canvas的截图width: w,    //{int} 图片宽度，当前canvas图片的宽度height: h,   //{int} 图片高度，当前canvas图片的高度num:　num,    //{int} 当前快照列表的序号code: new Date().getTime().toString(),   name: "快照" + num,     //快照名称description: "无注释"   //快照描述}]
 */
snapshot.getAllSnapshot();
```
#### load

作用： 根据传参初始加载快照列表。

形式参数： 有

| 名称         | 说明         | 类型           | 是否必须 | 示例           |
| ------------ | ------------ | -------------- | -------- | -------------- |
| snapshotsArr | 快照信息数组 | Array,对象数组 | 是       | 看调用方式举例 |

返回数据： 无

调用方式：


```javascript
        /**
         * load 根据传参初始加载快照列表
         * @method load
         * @param {array} snapshotsArr 为快照对象数组
         * @return {void}
         */

    var snapshotsArr = [{
        cameraState: cameraState,      //{Object} 对象，相机状态，包含position、target、up
        componentState: componentState,   //{Array} 对象数组 , 构件信息，
        highlightComponentsKeys: highlightComponentsKeys,   //{Array}数组，高亮的构件key集合
        imageURL: imgURL,  //{base64} 当前canvas的截图
        width: w,    //{int} 图片宽度，当前canvas图片的宽度
        height: h,   //{int} 图片高度，当前canvas图片的高度
        num:　num,    //{int} 当前快照列表的序号
        code: new Date().getTime().toString(),
        name: "快照" + num,     //快照名称
        description: "无注释"   //快照描述
    },{
        cameraState: cameraState,      //{Object} 对象，相机状态，包含position、target、up
        componentState: componentState,   //{Array} 对象数组 , 构件信息，
        highlightComponentsKeys: highlightComponentsKeys,   //{Array}数组，高亮的构件key集合
        imageURL: imgURL,  //{base64} 当前canvas的截图
        width: w,    //{int} 图片宽度，当前canvas图片的宽度
        height: h,   //{int} 图片高度，当前canvas图片的高度
        num:　num,    //{int} 当前快照列表的序号
        code: new Date().getTime().toString(),
        name: "快照" + num,     //快照名称
        description: "无注释"   //快照描述
    }];
    snapshot.load(snapshotsArr);


```
### 事件监听

下列方法默认值都为null,需要开发者赋值，下面给出了调用这些方法时会传递的参数
#### addListener
作用： 截取用户在UI上触发的add事件

形式参数： 有

| 名称      | 说明     | 类型          | 是否必须 | 示例   |
| --------- | -------- | ------------- | -------- | ------ |
| parameter | 快照信息 | 对象 Object   | 是       | 见下方 |
| callback  | 回调函数 | 方法 function | 是       | 见下方 |


| 返回值说明 | 类型 | 示例 |
| ---------- | ---- | ---- |
| 不需要     |      |      |
回调函数的参数

| 名称       | 说明                          | 类型           | 是否必须                                         | 示例   |
| ---------- | ----------------------------- | -------------- | ------------------------------------------------ | ------ |
| state      | 状态,为true时才会进行后续操作 | 布尔值 boolean | 是                                               | true   |
| parameter2 | 快照信息                      | 对象 Object    | 否，如果传递了该参数，那么将用这个参数来创建快照 | 见下方 |



内部调用方式：


```javascript
var parameter = {
    cameraState: cameraState,      //{Object} 对象，相机状态，包含position、target、up
    componentState: componentState,   //{Array} 对象数组 , 构件信息，
    highlightComponentsKeys: highlightComponentsKeys,   //{Array}数组，高亮的构件key集合
    highlightModelsKeys: highlightModelsKeys,   //{Array}数组，高亮的模型key集合
    imageURL: imgURL,  //{base64} 当前canvas的截图
    width: w,    //{int} 图片宽度，当前canvas图片的宽度
    height: h,   //{int} 图片高度，当前canvas图片的高度
    num:　num,    //{int} 当前快照列表的序号
    code: new Date().getTime().toString(),
    name: "快照" + num,     //快照名称
    description: "无注释"   //快照描述
};
snapshot.addListener(parameter, function (state, parameter2) {
                         if (state) {
                             snapshot.add(parameter2 || parameter);
                         }
                     });
```
#### deleteListener
作用： 截取用户在UI上触发的delete事件

形式参数： 有

| 名称     | 说明     | 类型          | 是否必须 | 示例     |
| -------- | -------- | ------------- | -------- | -------- |
| key      | 快照key  | 字符串 string | 是       | "123456" |
| callback | 回调函数 | 方法 function | 是       | 见下方   |


| 返回值说明 | 类型 | 示例 |
| ---------- | ---- | ---- |
| 不需要     |      |      |
回调函数的参数

| 名称  | 说明                          | 类型           | 是否必须 | 示例 |
| ----- | ----------------------------- | -------------- | -------- | ---- |
| state | 状态,为true时才会进行后续操作 | 布尔值 boolean | 是       | true |




内部调用方式：

```javascript
snapshot.deleteListener(key, function (state) {});
```

#### restoreToSnapshotListener
作用： 截取用户在UI上触发的restoreToSnapshot事件

形式参数： 有

| 名称     | 说明     | 类型          | 是否必须 | 示例     |
| -------- | -------- | ------------- | -------- | -------- |
| key      | 快照key  | 字符串 string | 是       | "123456" |
| callback | 回调函数 | 方法 function | 是       | 见下方   |


| 返回值说明 | 类型 | 示例 |
| ---------- | ---- | ---- |
| 不需要     |      |      |
回调函数的参数

| 名称  | 说明                          | 类型           | 是否必须 | 示例 |
| ----- | ----------------------------- | -------------- | -------- | ---- |
| state | 状态,为true时才会进行后续操作 | 布尔值 boolean | 是       | true |




内部调用方式：

```javascript
snapshot.restoreToSnapshotListener(key, function (state) {});
```

#### renameListener
作用： 截取用户在UI上触发的rename事件

形式参数： 有

| 名称     | 说明     | 类型          | 是否必须 | 示例     |
| -------- | -------- | ------------- | -------- | -------- |
| key      | 快照key  | 字符串 string | 是       | "123456" |
| name     | 快照name | 字符串 string | 是       | "快照1"  |
| callback | 回调函数 | 方法 function | 是       | 见下方   |


| 返回值说明 | 类型 | 示例 |
| ---------- | ---- | ---- |
| 不需要     |      |      |
回调函数的参数

| 名称  | 说明                          | 类型           | 是否必须                                           | 示例    |
| ----- | ----------------------------- | -------------- | -------------------------------------------------- | ------- |
| state | 状态,为true时才会进行后续操作 | 布尔值 boolean | 是                                                 | true    |
| name  | 快照name                      | 字符串 string  | 否，如果传递了该参数，那么将用这个参数来重命名快照 | "快照1" |



内部调用方式：

```javascript
snapshot.renameListener(key,name, function (state, name2) {});
```

#### annotationListener
作用： 截取用户在UI上触发的annotation事件

形式参数： 有

| 名称        | 说明     | 类型          | 是否必须 | 示例     |
| ----------- | -------- | ------------- | -------- | -------- |
| key         | 快照key  | 字符串 string | 是       | "123456" |
| description | 快照注释 | 字符串 string | 是       | "注释1"  |
| callback    | 回调函数 | 方法 function | 是       | 见下方   |


| 返回值说明 | 类型 | 示例 |
| ---------- | ---- | ---- |
| 不需要     |      |      |
回调函数的参数

| 名称        | 说明                          | 类型           | 是否必须                                                   | 示例    |
| ----------- | ----------------------------- | -------------- | ---------------------------------------------------------- | ------- |
| state       | 状态,为true时才会进行后续操作 | 布尔值 boolean | 是                                                         | true    |
| description | 快照注释                      | 字符串 string  | 否，如果传递了该参数，那么将用这个参数来添加或替换快照注释 | "注释1" |



内部调用方式：

```javascript
snapshot.annotationListener(key,name, function (state, name2) {});
```

#### updateListener
作用： 截取用户在UI上触发的update事件

形式参数： 有

| 名称      | 说明     | 类型          | 是否必须 | 示例     |
| --------- | -------- | ------------- | -------- | -------- |
| key       | 快照key  | 字符串 string | 是       | "123456" |
| parameter | 快照信息 | 对象 Object   | 是       | 见下方   |
| callback  | 回调函数 | 方法 function | 是       | 见下方   |


| 返回值说明 | 类型 | 示例 |
| ---------- | ---- | ---- |
| 不需要     |      |      |
回调函数的参数

| 名称      | 说明                          | 类型           | 是否必须                                         | 示例     |
| --------- | ----------------------------- | -------------- | ------------------------------------------------ | -------- |
| state     | 状态,为true时才会进行后续操作 | 布尔值 boolean | 是                                               | true     |
| name      | 快照name                      | 字符串 string  |                                                  | "快照1"  |
| key       | 快照key                       | 字符串 string  | 否，如果传递了该参数，那么将用这个参数来更新快照 | "123456" |
| parameter | 快照信息                      | 对象 Object    | 否，如果传递了该参数，那么将用这个参数来更新快照 | 见下方   |

```javascript
var parameter = {
    cameraState: cameraState,      //{Object} 对象，相机状态，包含position、target、up
    componentState: componentState,   //{Array} 对象数组 , 构件信息，
    highlightComponentsKeys: highlightComponentsKeys,   //{Array}数组，高亮的构件key集合
    highlightModelsKeys: highlightModelsKeys,   //{Array}数组，高亮的模型key集合
    imageURL: imgURL,  //{base64} 当前canvas的截图
    width: w,    //{int} 图片宽度，当前canvas图片的宽度
    height: h,   //{int} 图片高度，当前canvas图片的高度
    num:　num,    //{int} 当前快照列表的序号
    code: new Date().getTime().toString(),
    name: "快照" + num,     //快照名称
    description: "无注释"   //快照描述
};
```

内部调用方式：

```javascript
snapshot.updateListener(key,parameter, function (state, key2,parameter2) {});
```

## 标签

### 方法

直接参照原文档

### 事件监听

```javascript
const mark = bos3dui.mark
```

#### addListener

作用： 截取用户在UI上触发的add事件

形式参数： 有

| 名称    | 说明         | 类型       | 是否必须 | 示例  |
| ----- | ---------- | -------- | ---- | ------------- |
| type | 标签类型 | 字符串 string | 是    | dom或 sprite |
| options | 标签信息 | 对象 Object | 是    | 见BIMWINNER.BOS3D.DOMMark和BIMWINNER.BOS3D.SpriteMark  |
| callback | 回调函数 | 方法 function | 是    | 见下方 |


| 返回值说明  | 类型        | 示例                                      |
| ------ | --------- | --------------------------------------- |
| 不需要 |  |  |
回调函数的参数

| 名称    | 说明         | 类型       | 是否必须 | 示例  |
| ----- | ---------- | -------- | ---- | ------------- |
| state | 状态,为true时才会进行后续操作 | 布尔值 boolean | 是    | true |
| parameter2 | 标签信息 | 对象 Object | 否，如果传递了该参数，那么将用这个参数来创建标签    | 见BIMWINNER.BOS3D.DOMMark和BIMWINNER.BOS3D.SpriteMark |



内部调用方式：

```javascript
mark.addListener(typeoptions, function (state, parameter2) {

                     });
```
#### deleteListener

作用： 截取用户在UI上触发的delete事件

形式参数： 有

| 名称    | 说明         | 类型       | 是否必须 | 示例  |
| ----- | ---------- | -------- | ---- | ------------- |
| type | 标签类型 | 字符串 string | 是    | dom或 sprite |
| key | 标签key | 字符串 string | 是    | "123456" |
| callback | 回调函数 | 方法 function | 是    | 见下方 |


| 返回值说明  | 类型        | 示例                                      |
| ------ | --------- | --------------------------------------- |
| 不需要 |  |  |
回调函数的参数

| 名称    | 说明         | 类型       | 是否必须 | 示例  |
| ----- | ---------- | -------- | ---- | ------------- |
| state | 状态,为true时才会进行后续操作 | 布尔值 boolean | 是    | true |




内部调用方式：

```javascript
mark.deleteListener(type,key, function (state) {});
```

#### updateListener

作用： 截取用户在UI上触发的update事件

形式参数： 有

| 名称    | 说明         | 类型       | 是否必须 | 示例  |
| ----- | ---------- | -------- | ---- | ------------- |
| type | 标签类型 | 字符串 string | 是    | dom或 sprite |
| key | 标签key | 字符串 string | 是    | "123456" |
| options | 标签信息 | 对象 Object | 是    | 见BIMWINNER.BOS3D.DOMMark和BIMWINNER.BOS3D.SpriteMark |
| callback | 回调函数 | 方法 function | 是    | 见下方 |


| 返回值说明  | 类型        | 示例                                      |
| ------ | --------- | --------------------------------------- |
| 不需要 |  |  |
回调函数的参数

| 名称    | 说明         | 类型       | 是否必须 | 示例  |
| ----- | ---------- | -------- | ---- | ------------- |
| state | 状态,为true时才会进行后续操作 | 布尔值 boolean | 是    | true |
| name | 标签name | 字符串 string |     | "标签1" |
| key | 标签key | 字符串 string | 否，如果传递了该参数，那么将用这个参数来更新标签    | "123456" |
| options2 | 标签信息 | 对象 Object | 否，如果传递了该参数，那么将用这个参数来更新标签    | 见BIMWINNER.BOS3D.DOMMark和BIMWINNER.BOS3D.SpriteMark |

内部调用方式：

```javascript
mark.updateListener(type,key,options, function (state, key2,options2) {});
```

## 批注
注：只有add方法支持旧的批注数据，一旦调用过add之后，旧的格式转化为新的格式，新版本导出的数据都是新格式。
```javascript
const annotionStore = bos3dui.annotionStore;
```

* ### 批注对象示例
```javascript
let annotation = {
  data:{}, // svg上的数据，不要随意修改
  id: "string", // 程序内部生成的，作为批注的唯一标识，如果要修改，要确保唯一。
  name: "批注名",
  //snapshot保存相机和场景的一些信息，和之前一样
  snapshot: {
    cameraState: {},
    code: {},
    componentState: {},
    description: "string",
    highlightComponentsKeys: ["string"],
    highlightModelsKeys: ["string"],
  }
}
```

* ### getAllAnnotations 获取所有批注（从界面上得到数据，然后按需保存起来）
```javascript
const annotionStore = bos3dui.annotionStore;
let array = annotionStore.getAllAnnotations();
//array的类型为[{id:uuid,data:批注数据,snapshot:快照数据}]，其中data就是AnnotationEditor.toJson返回的对象,id是为了标识批注
```


* ### add 添加批注（从别的地方加载数据到界面上），不会触发addListener回调
支持添加旧的数据格式（图片，非svg）
```javascript
const annotionStore = bos3dui.annotionStore;
annotionStore.add(item);
//item为getAllAnnotations返回的数组元素
```

* ### delete 删除批注，不会触发deleteListener回调
```javascript
const annotionStore = bos3dui.annotionStore;
annotionStore.delete(item.id);
//按照id来删除批注，item为getAllAnnotations返回的数组元素
```

* ### update 更新批注，不会触发updateListener回调
```javascript
const annotionStore = bos3dui.annotionStore;
annotionStore.update(item);
//item为getAllAnnotations返回的数组元素
```

* ### rename 更新批注名，不会触发renameListener回调
```javascript
const annotionStore = bos3dui.annotionStore;
annotionStore.rename(item.id, name);
//item为getAllAnnotations返回的数组元素, name为新的名字字符串
```

* ### exit 退出编辑批注，不会触发exitListener回调
```javascript
const annotionStore = bos3dui.annotionStore;
annotionStore.exit();
```

* ### addListener 设置添加批注的回调函数
```javascript
const annotionStore = bos3dui.annotionStore;
annotionStore.addListener = function(annotation, callback) {
  // 拦截到添加批注，在这里可以对annotation进行二次修改
  // ...
  // 一定要记得调用callback
  callback(true | false, annotation);
}
// callback有两个参数（state, annotation）
// state表示是否继续添加，true是，false否
// annotation是批注
```

* ### deleteListener 设置删除批注的回调函数
```javascript
const annotionStore = bos3dui.annotionStore;
annotionStore.deleteListener = function(annotationID, callback) {
  // 拦截到删除批注，可以决定是否要继续删除
  // ...
  // 一定要记得调用callback
  callback(true | false);
}
// callback有一个参数（state）
// state表示是否继续删除，true是，false否
```

* ### updateListener 设置更新批注的回调函数
1、用户点击保存的时候会触发；
2、在批注列表点击“更新批注”按钮的时候会触发；
```javascript
const annotionStore = bos3dui.annotionStore;
annotionStore.updateListener = function(annotation, callback) {
  // 拦截到更新批注，在这里可以对annotation进行二次修改
  // ...
  // 一定要记得调用callback
  callback(true | false, annotation);
}
// callback有两个参数（state）
// state表示是否继续更新，true是，false否
// annotation是批注
```

* ### renameListener 设置批注名称的回调函数
```javascript
const annotionStore = bos3dui.annotionStore;
annotionStore.renameListener = function(annotationID, name, callback) {
  // 拦截到设置批注名称，在这里可以对name进行二次修改或者进行合法验证
  // ...
  // 一定要记得调用callback
  callback(true | false, name);
}
// callback有两个参数（state， name）
// state表示是否继续更新批注名，true是，false否
// name是批注名
```

* ### exitListener 退出当前编辑批注的回调函数
```javascript
const annotionStore = bos3dui.annotionStore;
annotionStore.exitListener = function(callback) {
  // 拦截到用户退出操作
  // ...
  // 一定要记得调用callback
  callback(true | false);
}
// callback有一个参数（state）
// state表示是否继续退出，true是，false否
```

* ### drawAnnotationToSvg 显示批注，将批注绘制到指定svg上
```javascript
const annotionStore = bos3dui.annotionStore;
let array = annotionStore.getAllAnnotations();
// 第一个参数是AnnotationEditor实例方法toJson返回的数据
// svg必须已经添加到dom上
annotionStore.drawAnnotationToSvg(array[0].data, svg);
```

# 显示路网

## 说明

* 显示之前，必须先自行用服务端接口创建路网。三维部分只负责显示

## 用法

```javascript
const bos3dui = new BOS3DUI(option)
/**
 * 添加路网
 * @param {string} modelKey - 模型key
 * @param {number[]} from - 起点坐标（三维）
 * @param {number[]} to - 终点坐标（三维）
 */
bos3dui.roadnet.add(modelKey, from, to)
/**
 * 移除路网
 * @param {string} modelKey - 模型key
 * @param {number[]} from - 起点坐标（三维）
 * @param {number[]} to - 终点坐标（三维）
 */
bos3dui.roadnet.remove(modelKey, from, to)
/**
 * 获取已添加的路网
 * @param {string} [modelKey] - 模型key。不填则获取所有模型的所有已添加路网
 * @param {number[]} [from] - 起点坐标（三维）。不填则获取指定模型的所有已添加路网
 * @param {number[]} [to] - 终点坐标（三维）。如果传入起点则必须传入终点
 * @return {null|object|[number,number,number][]} - 路网数据
 */
bos3dui.roadnet.getRoadnet(modelKey, from, to)
```

# 右键菜单

## 说明

* 用户可以新增右键菜单

## 用法

```javascript
  /**
   * 添加自定义菜单 
   * @param {string} name - 菜单名称
   * @param {boolen} isMore - 添加的自定义菜单放到外面的一级菜单还是“更多”里面的二级菜单，默认是外面的一级菜单
   * @param {function} function - 添加的自定义方法，没有参数会给到该函数，需要用户自己传参
   */
  bos3dui.plugin.addContextMenu(
      {
          name: "自定义菜单名称",
          isMore: true, // 默认为外面
          onClick: () => {}  // 自定义方法
      }
  );
```