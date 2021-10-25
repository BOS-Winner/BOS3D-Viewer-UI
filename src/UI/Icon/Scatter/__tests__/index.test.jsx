import React from 'react';
import { render, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { genStore } from 'jest/initTest';
import Scatter from '../index';
import toastr from '../../../toastr';

jest.mock('../../../toastr', () => ({
  info: jest.fn(),
}));

describe('scatter index', () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should switch scatter mode', () => {
    const store = genStore();
    const { container, getByTitle } = render((
      <Provider store={store}>
        <Scatter />
      </Provider>
    ));
    // 初始状态
    expect(container).toMatchSnapshot();

    act(() => {
      getByTitle('分解').click();
    });
    // 弹出选项
    expect(container).toMatchSnapshot();

    act(() => {
      getByTitle('模型分解').click();
    });
    // 收起选项，选中index分解按钮
    expect(container).toMatchSnapshot();

    act(() => {
      getByTitle('分解').click();
    });
    // 回到初始
    expect(container).toMatchSnapshot();

    act(() => {
      getByTitle('分解').click();
    });
    act(() => {
      getByTitle('楼层分解').click();
    });
    // 收起选项，选中index分解按钮
    expect(container).toMatchSnapshot();

    store.getState().system.viewer3D.canFloorExplosion = () => false;
    act(() => {
      getByTitle('分解').click();
      getByTitle('分解').click();
    });
    act(() => {
      getByTitle('楼层分解').click();
    });
    expect(toastr.info).toBeCalledTimes(1);
    expect(toastr.info.mock.calls[0]).toMatchSnapshot();
  });
});
