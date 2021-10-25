import React from "react";
import { render, fireEvent, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { genStore } from "jest/initTest";
import { DEFAULT_CAMERA } from "../../../constant";
import CameraSetting from "../CameraSetting";

// eslint-disable-next-line react/jsx-props-no-spreading
jest.mock('Base/Ranger', () => props => <input {...props} />);
const store = genStore();
const viewer3D = store.getState().system.viewer3D;
const BOS3D = store.getState().system.BIMWINNER.BOS3D;
let csGetByText;

describe("camera setting", () => {
  beforeEach(() => {
    viewer3D.setZoomSpeed = jest.fn();
    viewer3D.setMinPolarAngle = jest.fn();
    viewer3D.setMaxPolarAngle = jest.fn();
    viewer3D.enabledCameraRotateOfVerticalPolarAngle = jest.fn();
    viewer3D.setAnimatorDuration = jest.fn();
    viewer3D.setOriginalView = jest.fn();
    viewer3D.getViewerImpl().setPointRotateMode = jest.fn();
    viewer3D.getViewerImpl().lockAxisZ = jest.fn();
    viewer3D.getViewerImpl().setOrbitButton = jest.fn();
    viewer3D.getViewerImpl().setReverseWheelDirection = jest.fn();
    const { getByText } = render((
      <Provider store={store}>
        <CameraSetting />
      </Provider>
    ));
    csGetByText = getByText;
  });

  it('should set origin view', () => {
    const button = csGetByText('将当前位置设置为初始观察位置');
    act(() => {
      button.click();
    });
    expect(viewer3D.setOriginalView).toBeCalledTimes(1);
  });

  it("should set rotate mode", () => {
    const select = csGetByText('旋转模式').nextElementSibling;
    fireEvent.change(select, {
      target: {
        value: "SELECTION"
      }
    });
    expect(viewer3D.getViewerImpl().setPointRotateMode).toBeCalledTimes(1);
    expect(viewer3D.getViewerImpl().setPointRotateMode).lastCalledWith(
      BOS3D.RotatePivotMode.SELECTION
    );
  });

  it("should lock rotate", () => {
    const button = csGetByText('旋转锁定')
      .parentNode
      .querySelector("[role='button']");
    act(() => {
      button.click();
    });
    expect(BOS3D.ControlConfig.NoRotate).toBe(true);
  });

  it("should set orbit button", () => {
    const select = csGetByText('鼠标习惯').nextElementSibling;
    fireEvent.change(select, {
      target: {
        value: "right"
      }
    });
    expect(viewer3D.getViewerImpl().setOrbitButton).toBeCalledTimes(1);
    expect(viewer3D.getViewerImpl().setOrbitButton).lastCalledWith('right');
  });

  it("should reverse wheel direction", () => {
    const button = csGetByText('反转滚轮缩放方向')
      .parentNode
      .querySelector("[role='button']");
    act(() => {
      button.click();
    });
    expect(viewer3D.getViewerImpl().setReverseWheelDirection).toBeCalledTimes(1);
    expect(viewer3D.getViewerImpl().setReverseWheelDirection).lastCalledWith(true);
  });

  it("should change zoom speed", () => {
    const input = csGetByText('缩放速度').nextElementSibling.querySelector('input');
    fireEvent.change(input, {
      target: {
        value: 1.8
      }
    });
    expect(viewer3D.setZoomSpeed).toBeCalledTimes(1);
  });

  it("should change rotate of vertical polar angle", () => {
    const defaultAngle = DEFAULT_CAMERA.rotateOfVerticalPolarAngle;
    const input = csGetByText('相机俯仰角').nextElementSibling.querySelectorAll('input');

    expect(getComputedStyle(input[0].parentElement).visibility).toBe('hidden');

    const button = csGetByText('相机俯仰角')
      .nextElementSibling
      .querySelector("[role='button']");

    act(() => {
      button.click();
    });
    expect(getComputedStyle(input[0]).visibility).toBe('visible');
    expect(viewer3D.getViewerImpl().lockAxisZ).toBeCalledTimes(1);
    expect(viewer3D.getViewerImpl().lockAxisZ).lastCalledWith(true);
    expect(viewer3D.setMinPolarAngle).toBeCalledTimes(1);
    expect(viewer3D.setMaxPolarAngle).toBeCalledTimes(1);
    expect(viewer3D.setMinPolarAngle).lastCalledWith((defaultAngle[0] + 90) / 180 * Math.PI);
    expect(viewer3D.setMaxPolarAngle).lastCalledWith((defaultAngle[1] + 90) / 180 * Math.PI);
    expect(input[0].value).toBe(defaultAngle[0].toString());
    expect(input[1].value).toBe(defaultAngle[1].toString());

    act(() => {
      fireEvent.change(input[0], {
        target: {
          value: -45
        }
      });
      fireEvent.blur(input[0]);
    });
    expect(viewer3D.getViewerImpl().lockAxisZ).toBeCalledTimes(1);
    expect(viewer3D.setMaxPolarAngle).toBeCalledTimes(2);
    expect(viewer3D.setMinPolarAngle).toBeCalledTimes(2);
    expect(viewer3D.setMaxPolarAngle).lastCalledWith((defaultAngle[1] + 90) / 180 * Math.PI);
    expect(viewer3D.setMinPolarAngle).lastCalledWith(45 / 180 * Math.PI);
    expect(input[0].value).toBe('-45');
    expect(input[1].value).toBe(defaultAngle[1].toString());

    act(() => {
      fireEvent.change(input[1], {
        target: {
          value: 45
        }
      });
      fireEvent.blur(input[1]);
    });
    expect(viewer3D.setMaxPolarAngle).toBeCalledTimes(3);
    expect(viewer3D.setMinPolarAngle).toBeCalledTimes(3);
    expect(viewer3D.setMaxPolarAngle).lastCalledWith(135 / 180 * Math.PI);
    expect(viewer3D.setMinPolarAngle).lastCalledWith(45 / 180 * Math.PI);
    expect(input[0].value).toBe('-45');
    expect(input[1].value).toBe('45');

    // 极值检测
    act(() => {
      fireEvent.blur(input[0], {
        target: {
          value: -100
        }
      });
    });
    expect(viewer3D.setMaxPolarAngle).toBeCalledTimes(4);
    expect(viewer3D.setMinPolarAngle).toBeCalledTimes(4);
    expect(viewer3D.setMaxPolarAngle).lastCalledWith(135 / 180 * Math.PI);
    expect(viewer3D.setMinPolarAngle).lastCalledWith(0);
    expect(input[0].value).toBe('-90');

    // 反复触发这个，应该可以正确处理
    act(() => {
      fireEvent.blur(input[0], {
        target: {
          value: -110
        }
      });
    });
    expect(viewer3D.setMaxPolarAngle).toBeCalledTimes(4);
    expect(viewer3D.setMinPolarAngle).toBeCalledTimes(4);
    expect(input[0].value).toBe('-90');

    act(() => {
      fireEvent.blur(input[0], {
        target: {
          value: 50
        }
      });
    });
    expect(viewer3D.setMaxPolarAngle).toBeCalledTimes(5);
    expect(viewer3D.setMinPolarAngle).toBeCalledTimes(5);
    expect(viewer3D.setMaxPolarAngle).lastCalledWith(135 / 180 * Math.PI);
    expect(viewer3D.setMinPolarAngle).lastCalledWith(135 / 180 * Math.PI);
    expect(input[0].value).toBe('45');

    // 反复触发这个，应该可以正确处理
    act(() => {
      fireEvent.blur(input[0], {
        target: {
          value: 55
        }
      });
    });
    expect(viewer3D.setMaxPolarAngle).toBeCalledTimes(5);
    expect(viewer3D.setMinPolarAngle).toBeCalledTimes(5);
    expect(input[0].value).toBe('45');

    // input[1]极值检测
    act(() => {
      fireEvent.blur(input[1], {
        target: {
          value: 100
        }
      });
    });
    expect(viewer3D.setMaxPolarAngle).toBeCalledTimes(6);
    expect(viewer3D.setMinPolarAngle).toBeCalledTimes(6);
    expect(viewer3D.setMaxPolarAngle).lastCalledWith(Math.PI);
    expect(viewer3D.setMinPolarAngle).lastCalledWith(135 / 180 * Math.PI);
    expect(input[1].value).toBe('90');

    // 反复触发检测
    act(() => {
      fireEvent.blur(input[1], {
        target: {
          value: 110
        }
      });
    });
    expect(viewer3D.setMaxPolarAngle).toBeCalledTimes(6);
    expect(viewer3D.setMinPolarAngle).toBeCalledTimes(6);
    expect(input[1].value).toBe('90');

    act(() => {
      fireEvent.blur(input[1], {
        target: {
          value: 0
        }
      });
    });
    expect(viewer3D.setMaxPolarAngle).toBeCalledTimes(7);
    expect(viewer3D.setMinPolarAngle).toBeCalledTimes(7);
    expect(viewer3D.setMaxPolarAngle).lastCalledWith(135 / 180 * Math.PI);
    expect(viewer3D.setMinPolarAngle).lastCalledWith(135 / 180 * Math.PI);
    expect(input[1].value).toBe('45');

    act(() => {
      fireEvent.blur(input[1], {
        target: {
          value: -10
        }
      });
    });
    expect(viewer3D.setMaxPolarAngle).toBeCalledTimes(7);
    expect(viewer3D.setMinPolarAngle).toBeCalledTimes(7);
    expect(input[1].value).toBe('45');

    act(() => {
      fireEvent.blur(input[0], {
        target: {
          value: 'fxxk'
        }
      });
    });
    expect(viewer3D.setMaxPolarAngle).toBeCalledTimes(7);
    expect(viewer3D.setMinPolarAngle).toBeCalledTimes(7);

    const _b = csGetByText('旋转锁定')
      .parentNode
      .querySelector("[role='button']");
    act(() => {
      _b.click();
    });
    expect(viewer3D.getViewerImpl().lockAxisZ).toBeCalledTimes(1);

    act(() => {
      button.click();
    });
    expect(getComputedStyle(input[1].parentElement).visibility).toBe('hidden');
    expect(viewer3D.getViewerImpl().lockAxisZ).toBeCalledTimes(2);
    expect(viewer3D.getViewerImpl().lockAxisZ).lastCalledWith(false);
  });

  it("should change animator duration", () => {
    const input = csGetByText('动画持续时间（全局，默认值800ms）').nextElementSibling.querySelector('input');
    fireEvent.change(input, {
      target: {
        value: 1000
      }
    });
    fireEvent.blur(input);
    expect(viewer3D.setAnimatorDuration).toBeCalledTimes(1);
    expect(viewer3D.setAnimatorDuration).lastCalledWith(1000);
    expect(input.value).toBe('1000');

    fireEvent.blur(input, {
      target: {
        value: 1
      }
    });
    expect(viewer3D.setAnimatorDuration).toBeCalledTimes(2);
    expect(viewer3D.setAnimatorDuration).lastCalledWith(50);
    expect(input.value).toBe('50');

    fireEvent.blur(input, {
      target: {
        value: 1
      }
    });
    expect(viewer3D.setAnimatorDuration).toBeCalledTimes(2);
    expect(input.value).toBe('50');

    fireEvent.blur(input, {
      target: {
        value: 10000
      }
    });
    expect(viewer3D.setAnimatorDuration).toBeCalledTimes(3);
    expect(viewer3D.setAnimatorDuration).lastCalledWith(2000);
    expect(input.value).toBe('2000');

    fireEvent.blur(input, {
      target: {
        value: 10000
      }
    });
    expect(viewer3D.setAnimatorDuration).toBeCalledTimes(3);
    expect(input.value).toBe('2000');

    fireEvent.blur(input, {
      target: {
        value: 'fxxk'
      }
    });
    expect(viewer3D.setAnimatorDuration).toBeCalledTimes(3);
  });
});
