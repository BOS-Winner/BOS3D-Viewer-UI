import React from 'react';
import { render, act, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { genStore } from 'jest/initTest';
import Reset from '../Reset';
import { updateList } from '../../action';

jest.mock('Base/Modal', () => {
  // eslint-disable-next-line global-require
  const Modal = require('mock/Modal').default;
  return props => <Modal {...props} />;
});
const store = genStore();
store.getState().system.viewer3D.resetScene = jest.fn();
const onHide = jest.fn();
let resetContainer;
let resetGetByText;
let resetRerender;

describe('reset', () => {
  beforeEach(() => {
    const { container, getByText, rerender } = render((
      <Provider store={store}>
        <Reset visible onHide={onHide} />
      </Provider>
    ));
    resetContainer = container;
    resetGetByText = getByText;
    resetRerender = rerender;
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should show and hide by calling onHide', () => {
    expect(resetContainer).toMatchSnapshot();

    resetGetByText('close mock modal').click();
    expect(onHide).toBeCalledTimes(1);

    resetRerender((
      <Provider store={store}>
        <Reset visible={false} onHide={onHide} />
      </Provider>
    ));
    expect(resetContainer).toMatchSnapshot();
  });

  it('should check what you need', () => {
    const all = resetGetByText('全选').firstElementChild;
    const visible = resetGetByText('构件可见').firstElementChild;
    const highlight = resetGetByText('构件高亮').firstElementChild;
    const camera = resetGetByText('模型视角').firstElementChild;
    const wireframe = resetGetByText('构件线框').firstElementChild;
    const colorful = resetGetByText('构件颜色').firstElementChild;
    act(() => {
      fireEvent.input(all, {
        checked: true,
      });
    });
    expect(all.checked).toBe(true);
    expect(visible.checked).toBe(true);
    expect(highlight.checked).toBe(true);
    expect(camera.checked).toBe(true);
    expect(wireframe.checked).toBe(true);
    expect(colorful.checked).toBe(true);

    act(() => {
      fireEvent.input(all, {
        checked: false,
      });
    });
    expect(all.checked).toBe(false);
    expect(visible.checked).toBe(false);
    expect(highlight.checked).toBe(false);
    expect(camera.checked).toBe(false);
    expect(wireframe.checked).toBe(false);
    expect(colorful.checked).toBe(false);

    act(() => {
      fireEvent.input(visible, {
        checked: true,
      });
    });
    expect(visible.checked).toBe(true);
    act(() => {
      fireEvent.input(visible, {
        checked: false,
      });
    });
    expect(visible.checked).toBe(false);

    act(() => {
      fireEvent.input(highlight, {
        checked: true,
      });
    });
    expect(highlight.checked).toBe(true);
    act(() => {
      fireEvent.input(highlight, {
        checked: false,
      });
    });
    expect(highlight.checked).toBe(false);

    act(() => {
      fireEvent.input(camera, {
        checked: true,
      });
    });
    expect(camera.checked).toBe(true);
    act(() => {
      fireEvent.input(camera, {
        checked: false,
      });
    });
    expect(camera.checked).toBe(false);

    act(() => {
      fireEvent.input(wireframe, {
        checked: true,
      });
    });
    expect(wireframe.checked).toBe(true);
    act(() => {
      fireEvent.input(wireframe, {
        checked: false,
      });
    });
    expect(wireframe.checked).toBe(false);

    act(() => {
      fireEvent.input(colorful, {
        checked: true,
      });
    });
    expect(colorful.checked).toBe(true);
    act(() => {
      fireEvent.input(colorful, {
        checked: false,
      });
    });
    expect(colorful.checked).toBe(false);
  });

  it('should call resetScene', () => {
    const all = resetGetByText('全选').firstElementChild;
    store.dispatch(updateList({
      type: 'hide',
      name: '隐藏',
      keys: ['M123456']
    }));
    act(() => {
      fireEvent.input(all, {
        checked: true,
      });
    });
    act(() => {
      resetGetByText('复位选中项目').click();
    });
    expect(store.getState().system.viewer3D.resetScene).lastCalledWith({
      visible: true,
      selected: true,
      wireframed: true,
      colorfully: true,
      view: true,
    });
    expect(store.getState().button.history.length).toBe(0);
    expect(store.getState().button.pointer).toBe(0);
  });
});
