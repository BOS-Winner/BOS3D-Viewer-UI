import "jest/Polyfill/TextEncoder";
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import download from "UIutils/download";
import { genStore } from "jest/initTest";
import MockModal from "mock/Modal";
import ExportSetting from "../../BottomBar/ExportSetting";
import toastr from "../../../../toastr";

jest.mock('../../../../toastr');
jest.mock('UIutils/download');
jest.mock('Base/Modal', () => MockModal);
const store = genStore();
let gbText;
let gbTitle;
let dom;

describe('export setting menu', () => {
  beforeEach(() => {
    const { getByText, getByTitle, container } = render((
      <Provider store={store}>
        <ExportSetting />
      </Provider>
    ));
    gbText = getByText;
    gbTitle = getByTitle;
    dom = container;
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it("should show or hide export menu", () => {
    const title = gbTitle("导出设置");

    expect(getComputedStyle(title).display).toBe('none');
    gbText("导出").click();
    expect(getComputedStyle(title).display).not.toBe('none');
    gbText("close mock modal").click();
    expect(getComputedStyle(title).display).toBe('none');
  });

  it("should export setting", () => {
    gbText("导出").click();
    gbText("确定").click();
    expect(download).toBeCalledTimes(1);
  });

  it("should alert a tip when not checked", () => {
    gbText("导出").click();
    dom.querySelectorAll("input").forEach(checkbox => {
      fireEvent.change(checkbox, {
        target: {
          checked: false
        }
      });
    });
    gbText("确定").click();
    expect(toastr.error).toBeCalledTimes(1);
  });
});
