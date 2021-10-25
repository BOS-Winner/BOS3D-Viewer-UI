import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { genStore } from "jest/initTest";
import ModelSetting from "../ModelSetting";
import toastr from "../../../toastr";

jest.mock('../../../toastr');
let store;
let msContainer;
let msGetByText;
let viewer;

describe("model setting", () => {
  beforeEach(() => {
    store = genStore();
    viewer = store.getState().system.viewer3D;
    const EVENTS = store.getState().system.BIMWINNER.BOS3D.EVENTS;
    viewer.registerModelEventListener = (evt, cb) => {
      if (evt === EVENTS.ON_LOAD_COMPLETE) {
        cb({
          modelKey: 'M1145141919810',
          target: {
            models: {
              M1145141919810: {
                getConfig: () => ({
                  modelName: '佛祖保佑'
                })
              }
            }
          }
        });
        cb({
          modelKey: 'M1145141919811',
          target: {
            models: {
              M1145141919811: {
                getConfig: () => ({
                  modelName: '永无bug'
                })
              }
            }
          }
        });
      }
    };
    const { container, getByText } = render((
      <Provider store={store}>
        <ModelSetting />
      </Provider>
    ));
    msContainer = container;
    msGetByText = getByText;
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it("should render model's name list", () => {
    expect(msContainer).toMatchSnapshot();
  });

  it("should change model's base point", () => {
    const setMatrix = jest.fn();
    viewer.getViewerImpl().setModelMatrix = setMatrix;
    const inputs = msContainer.querySelectorAll("input");
    inputs[0].value = '1000';
    inputs[1].value = '-1000';
    inputs[2].value = '1000';
    const button = msGetByText('确定');
    button.click();
    expect(setMatrix).toHaveBeenCalledTimes(1);
    expect(setMatrix.mock.calls[0]).toMatchSnapshot();

    const select = msGetByText('模型选择：').nextElementSibling;
    fireEvent.change(select, {
      target: {
        value: 'M1145141919811'
      }
    });
    inputs[0].value = '-2000';
    inputs[1].value = '2000';
    inputs[2].value = '-2000';
    button.click();
    expect(setMatrix).toHaveBeenCalledTimes(3);
    expect(setMatrix.mock.calls[1]).toMatchSnapshot();
    expect(setMatrix.mock.calls[2]).toMatchSnapshot();

    fireEvent.change(select, {
      target: {
        value: 'M1145141919810'
      }
    });
    expect(inputs[0].value).toBe('1000');
    expect(inputs[1].value).toBe('-1000');
    expect(inputs[2].value).toBe('1000');
  });

  it("should cause error when using error input", () => {
    const inputs = msContainer.querySelectorAll("input");
    inputs[0].value = 'fxxk';
    const button = msGetByText('确定');
    button.click();
    expect(toastr.error).toBeCalledTimes(1);
  });

  it("shouldn't update matrix when model not found", () => {
    const setMatrix = jest.fn();
    viewer.getViewerImpl().setModelMatrix = setMatrix;
    const select = msGetByText('模型选择：').nextElementSibling;
    fireEvent.change(select, {
      target: {
        value: 'Model not found'
      }
    });
    const button = msGetByText('确定');
    button.click();
    expect(setMatrix).toBeCalledTimes(0);
  });
});
