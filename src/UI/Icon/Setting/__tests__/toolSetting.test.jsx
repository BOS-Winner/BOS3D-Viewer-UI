import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { genStore } from "jest/initTest";
import ToolSetting from "../ToolSetting";

let store;
let tsGetByText;

describe('toolSetting', () => {
  beforeEach(() => {
    store = genStore();
    const { getByText } = render((
      <Provider store={store}>
        <ToolSetting />
      </Provider>
    ));
    tsGetByText = getByText;
  });

  it.each`
    zhName | enName
    ${'聚焦'} | ${'fit'}
    ${'漫游'} | ${'roam'}
    ${'操作历史'} | ${'undo'}
    ${'复位'} | ${'reset'}
    ${'框选'} | ${'pickByRect'}
    ${'隐藏'} | ${'hide'}
    ${'隔离'} | ${'isolate'}
    ${'剖切'} | ${'section'}
    ${'分解'} | ${'scatter'}
    ${'构件线框化'} | ${'wireFrame'}
    ${'构件上色'} | ${'changeCptColor'}
    ${'模型测量'} | ${'measure'}
    ${'构件信息'} | ${'cptInfo'}
    ${'模型树'} | ${'infoTree'}
    ${'标签'} | ${'mark'}
    ${'快照'} | ${'snapshot'}
    ${'批注'} | ${'annotation'}
    ${'更多'} | ${'moreMenu'}
  `("should show and hide $enName", ({ zhName, enName }) => {
    const button = tsGetByText(zhName)
      .parentElement
      .nextElementSibling;

    button.click();
    expect(store.getState().userSetting.toolState[enName])
      .toBe(false);

    button.click();
    expect(store.getState().userSetting.toolState[enName])
      .toBe(true);
  });
});
