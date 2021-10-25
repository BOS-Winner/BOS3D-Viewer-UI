/* eslint-disable react/prop-types */
import React from 'react';
import { Provider } from 'react-redux';
import { genStore } from 'jest/initTest';
import { render, act } from "@testing-library/react";
import Section from '../Section';

jest.mock('Base/Modal', () => props => (
  <div
    className={props.className}
    style={props.style}
  >
    {props.children}
  </div>
));
const onEnter = jest.fn();
const store = genStore();
let section;
let getBtnByTitle;

describe('section', () => {
  beforeEach(() => {
    const { container, getByTitle } = render((
      <Provider store={store}>
        <Section onEnter={onEnter} />
      </Provider>
    ));
    section = container;
    getBtnByTitle = getByTitle;
    const viewer3D = store.getState().system.viewer3D;
    viewer3D.hideSectionBox = jest.fn();
    viewer3D.showSectionBox = jest.fn();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should switch mode', () => {
    expect(section).toMatchSnapshot();
    act(() => {
      getBtnByTitle('模型剖切').click();
    });
    expect(store.getState().button.mode).toEqual('剖切模式');
    expect(section).toMatchSnapshot();
    expect(onEnter).toBeCalledTimes(1);
    act(() => {
      getBtnByTitle('模型剖切').click();
    });
    expect(store.getState().button.mode).toEqual('');
    expect(section).toMatchSnapshot();
  });

  it("should toggle section box", () => {
    const viewer3D = store.getState().system.viewer3D;
    act(() => {
      getBtnByTitle('隐藏剖切盒').click();
    });
    expect(viewer3D.hideSectionBox).toBeCalledTimes(1);
    expect(section).toMatchSnapshot();
    act(() => {
      getBtnByTitle('显示剖切盒').click();
    });
    expect(viewer3D.showSectionBox).toBeCalledTimes(1);
    expect(section).toMatchSnapshot();
  });

  it('should reset section box', () => {
    const viewer3D = store.getState().system.viewer3D;
    viewer3D.resetSectionBox = jest.fn();
    act(() => {
      getBtnByTitle('重置剖切状态').click();
    });
    expect(viewer3D.resetSectionBox).toBeCalledTimes(1);
  });
});
