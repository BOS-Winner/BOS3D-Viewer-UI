export default {
  key: "M1584073315322_305908",
  guid: "305908",
  name: "结构墙200mm",
  attribute: {
    构造: {
      "FamilyPara-功能": "外部",
      "FamilyPara-厚度": "200",
      "FamilyPara-在插入点包络": "不包络",
      "FamilyPara-在端点包络": "无"
    },
    CompoundStructure: {
      IsVerticallyCompound: true,
      EndCapCondition: "None",
      FirstCoreLayer: 0,
      CompoundStructureLayer: {
        "0": {
          Function: "Structure",
          StruceMaterial: "Invalid",
          MaterialId: "267891",
          MaterialName: "混凝土，现场浇注，灰色",
          Width: 200,
          Wrapping: true
        }
      },
      LastCoreLayer: 0,
      OpeningWrappingCondition: "None"
    },
    约束: {
      底部约束: "标高 1",
      底部延伸距离: "0",
      房间边界: "是",
      顶部约束: "直到标高: 室内净标高",
      顶部偏移: "0",
      底部偏移: "-100",
      已附着底部: "否",
      与体量相关: "否",
      无连接高度: "2680",
      定位线: "面层面: 外部",
      已附着顶部: "否",
      顶部延伸距离: "0"
    },
    阶段化: { 拆除的阶段: "无", 创建的阶段: "新构造" },
    材质和装饰: { "FamilyPara-结构材质": "混凝土，现场浇注，灰色" },
    其他: { "FamilyPara-幕墙": "否" },
    分析属性: {
      "FamilyPara-热阻(R)": "0.1912 (m²·K)/W",
      "FamilyPara-吸收率": "0.7",
      "FamilyPara-粗糙度": "3",
      "FamilyPara-热质量": "28.08 kJ/K",
      "FamilyPara-传热系数(U)": "5.2300 W/(m²·K)"
    },
    尺寸标注: {
      "FamilyPara-壁厚": "0",
      长度: "3770",
      体积: "1.97",
      面积: "9.84"
    },
    结构: { 结构用途: "非承重", 启用分析模型: "否", 结构: "否" },
    标识数据: {
      "FamilyPara-类型标记": "111",
      图像: "<无>",
      "FamilyPara-成本": "0.00",
      "FamilyPara-类型图像": "<无>"
    }
  },
  matrix: [
    1.0,
    0.0,
    0.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    0.0,
    0.0,
    1.0
  ],
  geoFilePath:
    "Z3JvdXAxLE0wMC81My8wRC9yQkFCQjE1ckNteUFjazl0QUFBSThLY1pXSUU2Ny5qc29u",
  type: "墙",
  originalId: 305908,
  parentId: 0,
  maxBoundary: { x: -769.0, y: 4755.0, z: 2580.0 },
  minBoundary: { x: -4539.0, y: 4555.0, z: -100.0 },
  model: "M1584073315322",
  primitives: 20,
  version: 0,
  materials: ["6b6f25bc4c974704b05fcaa451593880"],
  familyName: null,
  buildInCategory: "OST_Walls"
};
