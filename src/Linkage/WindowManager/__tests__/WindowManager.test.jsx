import React from "react";
import { render, act } from "@testing-library/react";
import EventEmitter from "events";
import BOS3D from "BOS3D";
import BOS2D from "BOS2D";
import BOS3DUI from "BOS3DUI";
import myContext from "../../myContext";
import WindowManager from "../WindowManager";
import EVENTS from "../../EVENTS";

let globalContainer;

describe('WindowManager', () => {
  beforeAll(() => {
    myContext.BOS3D = BOS3D;
    myContext.BOS2D = BOS2D;
    myContext.BOS3DUI = BOS3DUI;
    myContext.emitter = new EventEmitter();
    const { container } = render(<WindowManager />);
    globalContainer = container;
  });

  afterAll(() => {
    myContext.viewer3D = {};
    myContext.viewer2D = {};
  });

  it('should switch window correctly', () => {
    myContext.modelKey = 'M123456789';
    myContext.viewer3D.addView('M123456789', 'a');
    const resize3DMock = jest.fn((x, y) => ({ x, y }));
    const resize2DMock = jest.fn((x, y) => ({ x, y }));
    myContext.viewer3D.resize = resize3DMock;
    myContext.viewer2D.resize = resize2DMock;

    act(() => {
      myContext.emitter.emit(EVENTS.ON_SWITCH_MAIN3D);
    });
    expect(resize3DMock).toBeCalledTimes(1);
    expect(resize2DMock).toBeCalledTimes(1);
    expect(globalContainer.childNodes[0].childNodes[0].classList.contains('smallWindow')).toEqual(true);
    expect(globalContainer.childNodes[0].childNodes[1].classList.contains('fullWindow')).toEqual(true);

    act(() => {
      myContext.emitter.emit(EVENTS.ON_SWITCH_MAIN2D);
    });
    expect(resize3DMock.mock.calls.length).toEqual(2);
    expect(resize2DMock.mock.calls.length).toEqual(2);
    expect(globalContainer.childNodes[0].childNodes[0].classList.contains('fullWindow')).toEqual(true);
    expect(globalContainer.childNodes[0].childNodes[1].classList.contains('smallWindow')).toEqual(true);

    act(() => {
      myContext.emitter.emit(EVENTS.ON_SWITCH_BOTH);
    });
    expect(resize3DMock).toHaveBeenCalledTimes(3);
    expect(resize2DMock).toHaveBeenCalledTimes(3);
    expect(globalContainer.childNodes[0].childNodes[0].classList.contains('halfWindow')).toEqual(true);
    expect(globalContainer.childNodes[0].childNodes[1].classList.contains('halfWindow')).toEqual(true);

    act(() => {
      myContext.emitter.emit(EVENTS.ON_SWITCH_ONLY3D);
    });
    expect(resize3DMock.mock.calls.length).toEqual(4);
    expect(resize2DMock.mock.calls.length).toEqual(4);
    expect(globalContainer.childNodes[0].childNodes[0].classList.contains('noWindow')).toEqual(true);
    expect(globalContainer.childNodes[0].childNodes[1].classList.contains('fullWindow')).toEqual(true);
  });
});
