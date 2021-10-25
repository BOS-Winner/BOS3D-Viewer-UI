import React from 'react';
import ReactDOM from 'react-dom';
import Confirm from './confirm';

function customConfirm(props) {
  const div = document.createElement("div");
  document.body.appendChild(div);
  ReactDOM.render(
    <Confirm
      {...props}
      okFunc={() => {
        ReactDOM.unmountComponentAtNode(div);
        document.body.removeChild(div);
        if (props && props.okFunc) {
          props.okFunc();
        }
      }}
      cancelFunc={() => {
        ReactDOM.unmountComponentAtNode(div);
        document.body.removeChild(div);
        if (props && props.cancelFunc) {
          props.cancelFunc();
        }
      }}
      closeIconFunc={() => {
        ReactDOM.unmountComponentAtNode(div);
      }}
    />,
    div
  );
}

export default customConfirm;
