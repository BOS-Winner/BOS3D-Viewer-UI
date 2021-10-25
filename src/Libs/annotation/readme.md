# 操作说明
底部工具栏显示了支持的所有功能，依次为：  
选择 直线 曲线 箭头 矩形 圆形 椭圆 矩形云线 自由云线 文本 撤销 重做 删除  
右边为属性面板；  
选择某一种模式，进行绘制；    
选择某一个图元，可以对其进行移动、缩放、旋转、删除、修改属性；
在电脑端，支持以退格键删除选中图元；
添加文本方式：选中文本模式，然后单击屏幕中想要添加到的位置，出现输入框，键入文字，点击空白地方完成添加；  
修改文本方式：双击已经添加过的文本，进入编辑模式，编辑好之后，单击空白地方完成编辑；  



# 用法示例
```javascript
    let parent = document.getElementById("svgdiv");
    let editor = new AnnotationEditor(500, 500);
    //配置editor各项属性
    // ...
    parent.appendChild(editor.svg);
```

# AnnotationEditor类
不建议直接访问不公开的属性和方法
## 静态属性
### EditMode
定义所有绘制模式，相当于枚举类型
```javascript
AnnotationEditor.EditMode = {
    Select: "select", //选择模式
    DrawLine: "drawLine", // 绘制直线
    DrawRect: "drawRect", // 绘制矩形
    DrawCircle: "drawCircle", // 绘制圆形
    DrawEllipse: "drawEllipse", // 绘制椭圆
    DrawArrow: "drawArrow", // 绘制箭头
    DrawFreeLine: "drawFreeLine", // 绘制线条（自由画笔）
    DrawText: "drawText", // 添加文本
    DrawCloudLine: "drawCloudLine", // 绘制矩形云线
    DrawFreeCloudLine: "drawFreeCloudLine" // 绘制自由云线
};
```

## 属性
### onSelectElement
选中某个图形的回调函数
参数为Drawable实例
### onUnSelectElement
当所有图形都取消选中之后的回调函数
没有参数
### onChangeElement
编辑了某个图形之后的回调函数
参数为Drawable实例
### onDrawElement
绘制图形回调函数
参数为Drawable实例
### onRemoveElement
删除某个图形的回调函数
参数为Drawable实例
### onUndoRedo
撤销或者重做之后的回调
参数为(canUndo, canRedo)，分别表示是否可以继续撤销和重做

## 静态方法
### changeBackgroundImage
修改批注的背景

| 名称    | 说明         | 类型       | 是否必须 | 示例            |
| ----- | ---------- | -------- | ---- | ------------- |
| data | toJson返回的对象 | 对象 | 是    |  |
| imageUrl | base64或者url | 字符串 | 是    |  |
| width | 图片宽度 | 数字 | 是    | 500 |
| width | 图片高度 | 数字 | 是    | 500 |
无返回值  
调用方式：
```javascript
let obj = editor.toJson();
AnnotationEditor.changeBackgroundImage(obj, url, 500, 500);
```

## 实例方法
### destroy
销毁的时候调用，内部用来重置各种回调函数，注销事件
调用方式：
```javascript
editor.destroy();
```
### setCurrentMode
设置当前绘制模式，EditMode在AnnotationEditor静态方法里可以找到

| 名称    | 说明         | 类型       | 是否必须 | 示例            |
| ----- | ---------- | -------- | ---- | ------------- |
| mode | 模式名称 | 字符串 | 是    | AnnotationEditor.EditMode.Select或"select" |
无返回值
调用方式：
```javascript
editor.setCurrentMode(AnnotationEditor.EditMode.Select);
```

### getCurrentMode
获取当前绘制模式
无参数  

| 返回值说明  | 类型        | 示例                                      |
| ------ | --------- | --------------------------------------- |
| 当前绘制模式 | 字符串 | "drawLine" |
调用方式：
```javascript
let mode = editor.getCurrentMode();
```

### getCurrentDrawInfo
获取当前绘制信息
```text
 {
      fillColor:"none",
      strokeColor:"#000000",
      strokeWidth:5,
      fontSize:16,
      fontFamily:"PingFangSC-Regular, sans-serif"
    }
```
无参数  

| 返回值说明  | 类型        | 示例                                      |
| ------ | --------- | --------------------------------------- |
| 绘制信息 | 对象 | 见上 |
调用方式：
```javascript
let info = editor.getCurrentDrawInfo();
```

### setSize
设置svg画布的大小，单位是像素，这个方法同样会设置svg的viewbox的宽高

| 名称    | 说明         | 类型       | 是否必须 | 示例            |
| ----- | ---------- | -------- | ---- | ------------- |
| width | 宽度，不带单位 | 数字 | 是    | 500 |
| width | 高度，不带单位 | 数字 | 是    | 500 |
无返回值
调用方式：
```javascript
editor.setSize(200, 200);
```

### setBackgroundImage
设置整个场景的背景

| 名称    | 说明         | 类型       | 是否必须 | 示例            |
| ----- | ---------- | -------- | ---- | ------------- |
| imageUrl | base64或者url | 字符串 | 是    |  |
| width | 图片宽度 | 数字 | 是    | 500 |
| width | 图片高度 | 数字 | 是    | 500 |
无返回值
调用方式：
```javascript
editor.setBackgroundImage(url, 500, 500);
```

### setFillColor
设置填充颜色，如果有选中的图形，也设置选中图形的填充
默认是"none"

| 名称    | 说明         | 类型       | 是否必须 | 示例            |
| ----- | ---------- | -------- | ---- | ------------- |
| color | 颜色 | 字符串 | 是    | "#ffffff"、"none" |
无返回值
调用方式：
```javascript
editor.setFillColor("#ffffff");
```

### clearFillColor
清除填充颜色，相当于setFillColor("none");  
无参数  
无返回值  
调用方式：
```javascript
editor.clearFillColor();
```

### setStrokeColor
设置描边颜色，如果有选中的图形，也设置选中图形的描边
默认是"#000000"

| 名称    | 说明         | 类型       | 是否必须 | 示例            |
| ----- | ---------- | -------- | ---- | ------------- |
| color | 颜色 | 字符串 | 是    | "#ffffff"、"none" |
无返回值
调用方式：
```javascript
editor.setStrokeColor("#ffffff");
```

### setStrokeWidth
设置描边宽度，如果有选中的图形，也设置选中图形的描边宽度  
默认是5
eventID是来区分是否每次调用都属于同一次用户操作，比如用户次序拖拽input的时候，视作同一次操作  
主要用于避免产生很多操作历史记录

| 名称    | 说明         | 类型       | 是否必须 | 示例            |
| ----- | ---------- | -------- | ---- | ------------- |
| width | 宽度 | 数字 | 是    | 5 |
| eventID | 标识 | 非0数字或字符串 | 是    | 1570592494964 |
无返回值
调用方式：
```javascript
editor.setStrokeWidth(5, new Date().getTime());
```

### clearStrokeColor
清除描边颜色，相当于setStrokeColor("none");  
无参数  
无返回值  
调用方式：
```javascript
editor.clearStrokeColor();
```

### setTextFontSize
置字体大小，如果有选中图元，也设置该图元的字体大小  
默认是16，单位是像素
eventID是来区分是否每次调用都属于同一次用户操作，比如用户次序拖拽input的时候，视作同一次操作  
主要用于避免产生很多操作历史记录

| 名称    | 说明         | 类型       | 是否必须 | 示例            |
| ----- | ---------- | -------- | ---- | ------------- |
| size | 字体大小 | 数字 | 是    | 5 |
| eventID | 标识 | 非0数字或字符串 | 是    | 1570592494964 |
无返回值  
调用方式：
```javascript
editor.setTextFontSize(5, new Date().getTime());
```

### setText
设置当前选中Text的文本

| 名称    | 说明         | 类型       | 是否必须 | 示例            |
| ----- | ---------- | -------- | ---- | ------------- |
| text | 文本 | 字符串 | 是    | "123456" |
无返回值  
调用方式：
```javascript
editor.setText("123456");
```

### setTextFontFamily
设置字体样式，如果有选中Text，也设置该Text的字体样式
默认是"PingFangSC-Regular, sans-serif"

| 名称    | 说明         | 类型       | 是否必须 | 示例            |
| ----- | ---------- | -------- | ---- | ------------- |
| family | font-family | 字符串 | 是    | "PingFangSC-Regular, sans-serif" |
无返回值  
调用方式：
```javascript
editor.setTextFontFamily("PingFangSC-Regular, sans-serif");
```

### undo
撤销上一个操作，如果没有历史记录的话什么都不做
无参数  
无返回值  
调用方式：
```javascript
editor.undo();
```

### redo
重做上次撤销的操作，如果没有的话什么都不做
无参数  
无返回值  
调用方式：
```javascript
editor.redo();
```

### toJson
将当前批注转换为json对象，方便存储（注意不是json字符串）
返回的对象就表示了一个批注所包含的多有数据，这个对象可以作为fromJson函数的参数
无参数  

| 返回值说明  | 类型        | 示例                                      |
| ------ | --------- | --------------------------------------- |
| 包含所有信息的对象 | 对象 |  |
调用方式：
```javascript
let obj = editor.toJson();
```

### fromJson
根据toJson保存的对象，重新绘制成svg
一般用于从持久层得到数据，然后初始化AnnotationEditor，然后再调用该方法呈现批注

| 名称    | 说明         | 类型       | 是否必须 | 示例            |
| ----- | ---------- | -------- | ---- | ------------- |
| obj | toJson返回的对象 | 对象 | 是    |  |
无返回值  
调用方式：
```javascript
let obj = editor1.toJson();
editor2.fromJson(obj);
```

### makeSnapshot
将当前svg保存为图片地址，可供img标签使用

| 名称    | 说明         | 类型       | 是否必须 | 示例            |
| ----- | ---------- | -------- | ---- | ------------- |
| callback | 成功之后的回调 | 函数:(url)=>{} | 是    |  |
无返回值  
调用方式：
```javascript
editor.makeSnapshot((url)={
  // url可以用于img标签
})
```

### removeAllSelectedElement
删除当前选择的图形  
无参数  
无返回值  
调用方式：
```javascript
editor.removeAllSelectedElement();
```

















