import React from 'react';
import { render, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { genStore } from 'jest/initTest';
import MockModal from "mock/Modal";
import ModelInfo from "../index";

const store = genStore();
jest.mock('Base/Modal', () => props => <MockModal {...props} />);
let gContainer;
let gabTitle;

describe("modelInfo", () => {
  beforeEach(() => {
    const { container, getAllByTitle } = render((
      <Provider store={store}>
        <ModelInfo />
      </Provider>
    ));
    gContainer = container;
    gabTitle = getAllByTitle;
  });

  it("should render dom", () => {
    expect(gContainer).toMatchSnapshot();
  });

  it("should show model info", () => {
    const title = gabTitle('模型信息')[0];
    act(() => {
      title.click();
    });
    expect(gContainer).toMatchSnapshot();
  });

  it("should refresh model info", () => {
    const title = gabTitle('模型信息')[0];
    act(() => {
      title.click();
    });
    const modelManager = store.getState().system.viewer3D.getViewerImpl().modelManager;
    const tmpInfo = modelManager.getStatisticsInfo;
    modelManager.getStatisticsInfo = () => ({
      componentCount: 100,
      trianglesCount: 200,
    });
    act(() => {
      title.click();
    });
    act(() => {
      title.click();
    });
    expect(gContainer).toMatchSnapshot();
    // 测试完毕后复原store
    modelManager.getStatisticsInfo = tmpInfo;
  });
});
