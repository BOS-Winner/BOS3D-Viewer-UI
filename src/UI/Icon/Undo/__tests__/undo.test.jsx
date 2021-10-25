import React from 'react';
import { render, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { genStore } from 'jest/initTest';
import UndoList from '../UndoList';
import { updateList } from '../../action';

jest.mock('Base/Modal', () => {
  // eslint-disable-next-line global-require
  const Modal = require('mock/Modal').default;
  return props => <Modal {...props} />;
});
// store.getState().system.viewer3D.resetScene = jest.fn();
const onHide = jest.fn();
let store;
let undoContainer;
let undoGetByText;
let undoRerender;

describe('undo list', () => {
  beforeEach(() => {
    store = genStore();
    store.getState().system.viewer3D.showComponentsByKey = jest.fn();
    store.getState().system.viewer3D.hideComponentsByKey = jest.fn();
    store.getState().system.viewer3D.isolateComponentsByKey = jest.fn();
    store.getState().system.viewer3D.resetScene = jest.fn();
    store.getState().system.viewer3D.colorfulComponentsByKey = jest.fn();
    store.getState().system.viewer3D.closeColorfulComponentsByKey = jest.fn();
    store.getState().system.viewer3D.wireFrameComponentsByKey = jest.fn();
    store.getState().system.viewer3D.closeWireFrameComponentsByKey = jest.fn();
    const { container, getByText, rerender } = render((
      <Provider store={store}>
        <UndoList visible onHide={onHide} />
      </Provider>
    ));

    undoContainer = container;
    undoGetByText = getByText;
    undoRerender = rerender;
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should show or hide', () => {
    expect(undoContainer).toMatchSnapshot();
    act(() => {
      undoGetByText('close mock modal').click();
    });
    expect(onHide).toBeCalledTimes(1);
    undoRerender((
      <Provider store={store}>
        <UndoList visible={false} onHide={onHide} />
      </Provider>
    ));
    expect(undoContainer).toMatchSnapshot();
  });

  it('should add item', () => {
    store.dispatch(updateList({
      type: 'hide',
      name: "构件隐藏",
      keys: ['M123456']
    }));
    expect(undoContainer).toMatchSnapshot();
  });

  it('should undo or redo action', () => {
    const viewer3D = store.getState().system.viewer3D;
    store.dispatch(updateList({
      type: 'hide',
      name: "构件隐藏",
      keys: ['M123456']
    }));
    store.dispatch(updateList({
      type: 'wireframe',
      name: "构件线框化",
      keys: ['M1234567']
    }));
    store.dispatch(updateList({
      type: 'isolate',
      name: "构件隔离",
      keys: ['M12345678']
    }));
    store.dispatch(updateList({
      type: 'colorful',
      name: "构件变色",
      keys: ['M12345678']
    }));

    act(() => {
      undoGetByText('构件线框化').click();
    });
    expect(viewer3D.closeColorfulComponentsByKey).toBeCalledTimes(1);
    expect(viewer3D.isolateComponentsByKey).toBeCalledTimes(0);
    expect(viewer3D.resetScene).toBeCalledTimes(1);
    expect(viewer3D.hideComponentsByKey).toBeCalledTimes(1);
    expect(viewer3D.closeWireFrameComponentsByKey).toBeCalledTimes(0);
    expect(viewer3D.showComponentsByKey).toBeCalledTimes(0);
    expect(undoContainer).toMatchSnapshot();

    act(() => {
      undoGetByText('撤销列表操作').click();
    });
    expect(viewer3D.closeWireFrameComponentsByKey).toBeCalledTimes(1);
    expect(viewer3D.showComponentsByKey).toBeCalledTimes(1);
    expect(undoContainer).toMatchSnapshot();

    act(() => {
      undoGetByText('构件隔离').click();
    });
    expect(viewer3D.colorfulComponentsByKey).toBeCalledTimes(0);
    expect(viewer3D.isolateComponentsByKey).toBeCalledTimes(1);
    expect(viewer3D.wireFrameComponentsByKey).toBeCalledTimes(1);
    expect(viewer3D.hideComponentsByKey).toBeCalledTimes(2);
    expect(undoContainer).toMatchSnapshot();

    act(() => {
      undoGetByText('构件变色').click();
    });
    expect(viewer3D.colorfulComponentsByKey).toBeCalledTimes(1);
    expect(viewer3D.isolateComponentsByKey).toBeCalledTimes(1);
    expect(viewer3D.wireFrameComponentsByKey).toBeCalledTimes(1);
    expect(viewer3D.hideComponentsByKey).toBeCalledTimes(2);
    expect(undoContainer).toMatchSnapshot();
  });
});
