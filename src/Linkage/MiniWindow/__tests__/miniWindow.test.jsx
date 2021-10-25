import React from 'react';
import { render } from "@testing-library/react";
import MiniWindow from '../MiniWindow';

describe('miniWindow', () => {
  it('should render dom correctly', () => {
    const { container, rerender } = render((
      <MiniWindow icon="3D" showTitle>
        <div>test</div>
      </MiniWindow>
    ));
    expect(container).toMatchSnapshot();

    rerender((
      <MiniWindow icon="3D" showTitle showCloseIcon={false}>
        <div>test</div>
      </MiniWindow>
    ));
    expect(container).toMatchSnapshot();

    rerender((
      <MiniWindow title="test" icon="3D" showTitle showCloseIcon={false}>
        <div>test</div>
      </MiniWindow>
    ));
    expect(container).toMatchSnapshot();
  });
});
