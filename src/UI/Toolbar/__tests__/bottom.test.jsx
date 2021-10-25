import React from "react";
import { Provider } from "react-redux";
import { render } from "@testing-library/react";
import { genStore } from "jest/initTest";
import { setToolbarState } from "../../userRedux/userSetting/action";
import Bottom from "../Bottom";
import { EVENT } from "../../constant";

const HIDE_ALL_ICONS = {
  fit: false,
  undo: false,
  reset: false,
  roam: false,
  pickByRect: false,
  hide: false,
  isolate: false,
  section: false,
  wireFrame: false,
  scatter: false,
  changeCptColor: false,
  setting: false,
  fullScreen: false,
  changeBgColor: false,
  cptInfo: false,
  infoTree: false,
  measure: false,
  mark: false,
  snapshot: false,
  annotation: false,
};

jest.mock('../../Icon/Fit', () => () => <div />);
jest.mock('../../Icon/Undo', () => () => <div />);
jest.mock('../../Icon/Reset', () => () => <div />);
jest.mock('../../Icon/Roam', () => () => <div />);
jest.mock('../../Icon/PickByRect', () => () => <div />);
jest.mock('../../Icon/Hide', () => () => <div />);
jest.mock('../../Icon/Isolate', () => () => <div />);
jest.mock('../../Icon/Section', () => () => <div />);
jest.mock('../../Icon/WireFrame', () => () => <div />);
jest.mock('../../Icon/Scatter', () => () => <div />);
jest.mock('../../Icon/ChangeCptColor', () => () => <div />);
jest.mock('../../Icon/Roadnet', () => () => <div />);
jest.mock('../../Icon/Measure', () => () => <div />);
jest.mock('../../Icon/CptInfo', () => () => <div />);
jest.mock('../../Icon/InfoTree', () => () => <div />);
jest.mock('../../Icon/Mark', () => () => <div />);
jest.mock('../../Icon/Snapshot', () => () => <div />);
jest.mock('../../Icon/Open2D', () => () => <div />);
jest.mock('../../Icon/Setting', () => () => <div />);
jest.mock('../../Icon/ModelInfo', () => () => <div />);
jest.mock('../../Icon/CptSearch', () => () => <div />);
jest.mock('../../Icon/MiniMap/MiniMap', () => () => <div />);
jest.mock('Base/Popup', () => () => <div />);
jest.mock('../../AnnotationUI/AnnotationIcon', () => () => <div />);

describe("bottom toolbar", () => {
  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should add custom dom', () => {
    const store = genStore();
    store.dispatch(setToolbarState(HIDE_ALL_ICONS));
    const ee = store.getState().system.eventEmitter;
    const { container } = render((
      <Provider store={store}>
        <Bottom />
      </Provider>
    ));

    // FIXME: 修改dom后container无变化
    // ee.emit(EVENT.addIconToBottom, <div id="jsx" key="jsx">test</div>);
    // await waitForDomChange({ container });
    // expect(container.querySelector('#jsx')).toEqual(expect.any(HTMLElement));

    const dom = document.createElement('div');
    dom.id = 'dom';
    ee.emit(EVENT.addIconToBottom, dom);
    expect(container.querySelector('#dom')).toEqual(expect.any(HTMLElement));
  });
});
