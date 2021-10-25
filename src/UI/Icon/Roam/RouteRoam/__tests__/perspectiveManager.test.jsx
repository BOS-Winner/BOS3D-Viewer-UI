import React from "react";
import { Provider } from "react-redux";
import { render, act } from "@testing-library/react";
import { genStore } from "jest/initTest";
import PerspectiveManager from "../PerspectiveManager";

const onSaveRoute = jest.fn();
const store = genStore();
let pmContainer;
let pmGetByText;
let pmGetByTitle;
let pmGetAllByTitle;
jest.mock('Base/confirm', () => opt => {
  opt.onOk();
});

describe("perspective manager", () => {
  beforeEach(() => {
    const {
      container, getByText, getByTitle, getAllByTitle
    } = render((
      <Provider store={store}>
        <PerspectiveManager
          onSaveRoute={onSaveRoute}
        />
      </Provider>
    ));
    pmContainer = container;
    pmGetByText = getByText;
    pmGetByTitle = getByTitle;
    pmGetAllByTitle = getAllByTitle;
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("should add and remove perspective", () => {
    expect(pmContainer).toMatchSnapshot();

    act(() => {
      pmGetByText("添加视角").click();
    });
    expect(pmContainer).toMatchSnapshot();

    act(() => {
      pmGetByText("添加视角").click();
      pmGetByText("添加视角").click();
    });
    expect(pmContainer).toMatchSnapshot();

    act(() => {
      pmGetAllByTitle("删除")[1].click();
    });
    expect(pmContainer).toMatchSnapshot();

    act(() => {
      pmGetByText("保存路径").click();
    });
    expect(pmContainer).toMatchSnapshot();
  });

  it("should edit perspective", () => {
    act(() => {
      pmGetByText("添加视角").click();
    });
    act(() => {
      pmGetByTitle("编辑").click();
    });
    expect(pmContainer).toMatchSnapshot();
  });

  it("should move perspective", () => {
    act(() => {
      pmGetByText("添加视角").click();
      pmGetByText("添加视角").click();
      pmGetByText("添加视角").click();
    });
    const moveDown = pmGetAllByTitle("下移");
    act(() => {
      moveDown[0].click();
    });
    // 2,1,3
    expect(pmContainer).toMatchSnapshot();

    const moveUp = pmGetAllByTitle("上移");
    act(() => {
      moveUp[1].click();
    });
    // 2,3,1
    expect(pmContainer).toMatchSnapshot();
  });
});
