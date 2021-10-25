import React from "react";
import { render, act } from "@testing-library/react";
import SettingPanel from "../SettingPanel.jsx";

jest.mock('../ModelSetting', () => () => <div title="ModelSetting" />);
jest.mock('../CameraSetting', () => () => <div title="CameraSetting" />);
jest.mock('../DisplayAndEffect', () => () => <div title="DisplayAndEffect" />);
jest.mock('../ToolSetting', () => () => <div title="ToolSetting" />);
jest.mock('../BottomBar', () => () => <div title="BottomBar" />);

let spContainer;
let spGetByText;

describe("setting panel", () => {
  beforeEach(() => {
    const { container, getByText } = render(<SettingPanel />);
    spContainer = container;
    spGetByText = getByText;
  });

  it("should switch panel", () => {
    act(() => {
      spGetByText('相机设置').click();
    });
    expect(spContainer).toMatchSnapshot();
    act(() => {
      spGetByText('显示与效果').click();
    });
    expect(spContainer).toMatchSnapshot();
    act(() => {
      spGetByText('工具栏配置').click();
    });
    expect(spContainer).toMatchSnapshot();
    act(() => {
      spGetByText('模型设置').click();
    });
    expect(spContainer).toMatchSnapshot();
  });
});
