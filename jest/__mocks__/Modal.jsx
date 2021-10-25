/* eslint-disable react/prop-types */
import React from 'react';

export default props => (
  <div
    className={props.className}
    title={props.title}
    style={{
      display: props.visible ? 'block' : 'none',
      position: 'absolute',
      top: props.top,
      bottom: props.bottom,
      left: props.left,
      right: props.right,
      width: props.width,
      height: props.height,
    }}
  >
    <div>
      <span>{props.title}</span>
      <button
        type="button"
        data-testid="close-mock-modal"
        onClick={() => props.onCancel()}
      >
        close mock modal
      </button>
    </div>
    {props.children}
  </div>
);
