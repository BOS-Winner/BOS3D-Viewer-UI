import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { genStore } from "jest/initTest";
import DisplayAndEffect from "../DisplayAndEffect";

// eslint-disable-next-line react/jsx-props-no-spreading
jest.mock('Base/Ranger', () => props => <input {...props} />);
jest.mock('../DisplayAndEffect/SkyBox/config', () => ({
  none: {
    name: "无",
    path: '',
    thumbnail: '',
  },
  blueSky: {
    name: '白天',
    path: `./skybox/blueSky`,
    thumbnail: `url(balabalaa)`,
  },
}));

let store;
let daeGetByText;
let BOS3D;
let viewer3D;

describe('display and effect setting', () => {
  beforeEach(() => {
    store = genStore();
    BOS3D = store.getState().system.BIMWINNER.BOS3D;
    viewer3D = store.getState().system.viewer3D;
    viewer3D.enableLogarithmicDepthBuffer = jest.fn();
    viewer3D.setLightIntensityFactor = jest.fn();
    viewer3D.getViewerImpl().setDrawingStyle = jest.fn();
    viewer3D.getViewerImpl().enableShadow = jest.fn();
    viewer3D.enableLogarithmicDepthBuffer = jest.fn();
    const { getByText } = render((
      <Provider store={store}>
        <DisplayAndEffect isShown />
      </Provider>
    ));
    daeGetByText = getByText;
  });

  it.each([
    ['EnableSelectionOutline', '高亮构件透视轮廓线', true],
    ['EnableSelectionBoundingBox', '构件包围盒', false],
    ['EnableSelectionByTranslucent', '透明可选中', false],
  ])('should change setting list1: %s', (enName, zhName, defaultValue) => {
    const button = daeGetByText(zhName).nextElementSibling;
    const settingItem = enName[0].toLowerCase() + enName.slice(1);

    button.click();
    expect(BOS3D.GlobalData[enName]).toBe(!defaultValue);
    expect(store.getState().userSetting.displaySetting[settingItem]).toBe(!defaultValue);

    button.click();
    expect(BOS3D.GlobalData[enName]).toBe(defaultValue);
    expect(store.getState().userSetting.displaySetting[settingItem]).toBe(defaultValue);
  });

  it("should set light intensity factor", () => {
    const input = daeGetByText('曝光程度').nextElementSibling.children[0];

    fireEvent.change(input, {
      target: {
        value: 0.5
      }
    });
    expect(viewer3D.setLightIntensityFactor).toBeCalledTimes(1);

    daeGetByText('透明可选中').nextElementSibling.click();
    expect(viewer3D.setLightIntensityFactor).toBeCalledTimes(1);
  });

  it.each([
    [
      'showCptLines',
      '构件边界线',
      false,
      () => viewer3D.getViewerImpl().setDrawingStyle,
      [() => BOS3D.DrawingStyle.SHADINGWITHLINE, () => BOS3D.DrawingStyle.SHADING]
    ],
    [
      'enableShadow',
      '阴影',
      false,
      () => viewer3D.getViewerImpl().enableShadow,
      [() => true, () => false]
    ],
    [
      'enableLogarithmicDepthBuffer',
      '优化闪烁面',
      false,
      () => viewer3D.enableLogarithmicDepthBuffer,
      [() => true, () => false]
    ],
  ])('should change setting list2: %s', (enName, zhName, defaultValue, fn, values) => {
    const button = daeGetByText(zhName).nextElementSibling;
    // const settingItem = enName[0].toLowerCase() + enName.slice(1);
    const settingItem = enName;

    button.click();
    expect(store.getState().userSetting.displaySetting[settingItem]).toBe(!defaultValue);
    expect(fn()).toBeCalledTimes(1);
    expect(fn()).lastCalledWith(values[0]());

    button.click();
    expect(store.getState().userSetting.displaySetting[settingItem]).toBe(defaultValue);
    expect(fn()).toBeCalledTimes(2);
    expect(fn()).lastCalledWith(values[1]());

    // 测试点击其他选项，不影响当前功能
    daeGetByText('透明可选中').nextElementSibling.click();
    expect(fn()).toBeCalledTimes(2);
  });
});
