import React from "react";
import { render } from "@testing-library/react";
import { Provider } from 'react-redux';
import { genStore } from 'jest/initTest';
import ChangeBgColor from "../ChangeBgColor";

const mockDismiss = jest.fn();
const mockShowAtRight = jest.fn();
let onConfirm;
let onRestore;
let onClose;

jest.mock('../../../ColorPicker', () => class ColorPicker {
  static dismiss() {
    mockDismiss();
  }

  static showAtRight(props) {
    mockShowAtRight();
    props.didMount(this);
    onConfirm = props.onConfirm;
    onRestore = props.onRestore;
    onClose = props.onClose;
  }
});

let cbcGetByTitle;
let viewer;

describe("change background color", () => {
  beforeEach(() => {
    const store = genStore();
    viewer = store.getState().system.viewer3D;
    viewer.setSceneBackGroundColor = jest.fn();
    viewer.resetSceneBackgroundColor = jest.fn();
    const { getByTitle } = render((
      <Provider store={store}>
        <ChangeBgColor />
      </Provider>
    ));
    cbcGetByTitle = getByTitle;
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("should open or close panel", () => {
    mockDismiss.mockClear();
    mockShowAtRight.mockClear();

    const btn = cbcGetByTitle('改变背景色');
    btn.click();
    expect(mockShowAtRight).toBeCalledTimes(1);
    expect(mockDismiss).toBeCalledTimes(0);

    btn.click();
    expect(mockDismiss).toBeCalledTimes(1);
    expect(mockShowAtRight).toBeCalledTimes(1);

    btn.click();
    onClose();
    btn.click();
    expect(mockDismiss).toBeCalledTimes(1);
    expect(mockShowAtRight).toBeCalledTimes(3);
  });

  it("should change background color", () => {
    cbcGetByTitle('改变背景色').click();
    onConfirm({
      hex: '#00ffff',
      alpha: 0.5,
    });
    expect(viewer.setSceneBackGroundColor).toBeCalledTimes(1);
    expect(viewer.resetSceneBackgroundColor).toBeCalledTimes(0);
    expect(viewer.setSceneBackGroundColor).lastCalledWith('#00ffff', 0.5);

    onRestore();
    expect(viewer.resetSceneBackgroundColor).toBeCalledTimes(1);
    expect(viewer.setSceneBackGroundColor).toBeCalledTimes(1);
  });
});
