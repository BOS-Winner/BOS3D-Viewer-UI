/* eslint-disable camelcase */
/* eslint-disable react/prop-types */
import React from 'react';
import { Provider } from 'react-redux';
import { genStore } from 'jest/initTest';
import { render, act, fireEvent } from "@testing-library/react";
import SectionPlane from 'BOS3D/SectionPlane';
import FreeSection from '../FreeSection';

jest.mock('Base/Modal', () => props => (
  <div
    className={props.className}
    style={props.style}
  >
    {props.children}
  </div>
));
jest.mock('BOS3D/SectionPlane');
const onEnter = jest.fn();
let store;
let g_getByTitle;
let section;

describe('freeSection', () => {
  beforeEach(() => {
    store = genStore();
    const { container, getByTitle } = render((
      <Provider store={store}>
        <FreeSection onEnter={onEnter} />
      </Provider>
    ));
    section = container;
    g_getByTitle = getByTitle;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should switch mode', () => {
    expect(section).toMatchSnapshot();
    act(() => {
      g_getByTitle('自由剖切').click();
    });
    expect(store.getState().button.mode).toEqual('自由剖切模式');
    expect(section).toMatchSnapshot();
    expect(onEnter).toBeCalledTimes(1);
    act(() => {
      g_getByTitle('自由剖切').click();
    });
    expect(store.getState().button.mode).toEqual('');
    expect(section).toMatchSnapshot();
  });

  it('should change axis direction', () => {
    const select = g_getByTitle('改变轴向');
    act(() => {
      g_getByTitle('自由剖切').click();
    });
    const sectionPlane = SectionPlane.mock.instances[0];
    fireEvent.change(select, {
      target: {
        value: 'Y'
      }
    });
    expect(sectionPlane.setDirection).lastCalledWith('Forward');
    expect(sectionPlane.setPlane).lastCalledWith('Y');
    fireEvent.change(select, {
      target: {
        value: '-Z'
      }
    });
    expect(sectionPlane.setDirection).lastCalledWith('Reverse');
    expect(sectionPlane.setPlane).lastCalledWith('Z');
  });

  it('should hide or show section face', () => {
    act(() => {
      g_getByTitle('自由剖切').click();
    });
    const sectionPlane = SectionPlane.mock.instances[0];
    const switchSectionFace = g_getByTitle('点击隐藏剖切面');
    act(() => {
      switchSectionFace.click();
    });
    expect(switchSectionFace.getAttribute('title')).toEqual('点击显示剖切面');
    expect(switchSectionFace.getAttribute('alt')).toEqual('点击显示剖切面');
    expect(switchSectionFace.getAttribute('src')).toEqual('hide@2x.png');
    expect(sectionPlane.hidePlane).toBeCalledTimes(1);
    act(() => {
      switchSectionFace.click();
    });
    expect(switchSectionFace.getAttribute('title')).toEqual('点击隐藏剖切面');
    expect(switchSectionFace.getAttribute('alt')).toEqual('点击隐藏剖切面');
    expect(switchSectionFace.getAttribute('src')).toEqual('show@2x.png');
    expect(sectionPlane.showPlane).toBeCalledTimes(1);
  });
});
