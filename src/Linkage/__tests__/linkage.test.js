import { act } from "@testing-library/react";
import BOS3D from "BOS3D";
import BOS2D from "BOS2D";
import BOS3DUI from "BOS3DUI";
import myContext from "../myContext";
import Linkage from "../Linkage";

let linkage;
const initCompleteCB = jest.fn(() => {});
jest.mock('BOS3D');
jest.mock('BOS2D');

describe('linkage', () => {
  beforeAll(() => {
    const $test = document.createElement('div');
    $test.id = 'test';
    document.body.appendChild($test);
    myContext.viewer2D = null;
    myContext.viewer3D = null;
    act(() => {
      linkage = new Linkage({
        host: "http://test.boswinner.com",
        BOS2D,
        BOS3D,
        BOS3DUI,
        selector: '#test',
        onInitComplete: initCompleteCB,
      });
      linkage.addView('a1', 'a2');
    });
    linkage.addView('b1', 'b2');
  });

  afterAll(() => {
    myContext.viewer2D = {};
    myContext.viewer3D = {};
    jest.clearAllMocks();
  });

  it('should render dom into #test', () => {
    expect(document.querySelector('#test').innerHTML).not.toEqual('');
  });

  it('should init context', () => {
    expect(myContext.BOS3D).toBe(BOS3D);
    expect(myContext.BOS2D).toBe(BOS2D);
    expect(myContext.BOS3DUI).toBe(BOS3DUI);
    expect(myContext.host).toEqual('http://test.boswinner.com');
    expect(myContext.bos3dui).not.toBeNull();
    expect(myContext.viewer2D).not.toBeNull();
    expect(myContext.viewer3D).not.toBeNull();
    expect(myContext.emitter).not.toBeUndefined();
  });

  it('should call init callback', () => {
    expect(initCompleteCB).toBeCalledTimes(1);
  });

  it('should add 2 models', () => {
    const mockViewer3DIns = BOS3D.Viewer.mock.instances[0];
    const mockViewer2DIns = BOS2D.Viewer2D.mock.instances[0];
    expect(mockViewer3DIns.addView).toBeCalledTimes(2);
    expect(mockViewer2DIns.addView).toBeCalledTimes(2);
  });

  it('should remove 2 models', () => {
    linkage.removeView('a1');
    linkage.removeView('b1');
    const mockViewer3DIns = BOS3D.Viewer.mock.instances[0];
    const mockViewer2DIns = BOS2D.Viewer2D.mock.instances[0];
    expect(mockViewer3DIns.removeView).toBeCalledTimes(2);
    expect(mockViewer2DIns.removeView).toBeCalledTimes(2);
  });
});
