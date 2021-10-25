import React from "react";
import PropTypes from "prop-types";
import {
  FormGroup,
  Paper,
  Button,
} from '@material-ui/core';
import { FormCtl, validateAction } from "./FormUtil";
import toastr from "../../toastr";
import style from "./style.less";

class SearchBox extends React.Component {
  static propTypes = {
    onSearch: PropTypes.func.isRequired,
    divSelector: PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {};
    this.inputRef1 = React.createRef();
    this.inputRef2 = React.createRef();
    this.inputRef3 = React.createRef();
  }

  onSubmit(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    const formData = new FormData(ev.target);
    const rst = {
      name: formData.get('name').toLowerCase(),
      type: formData.get('type').toLowerCase(),
      componentKey: formData.get('componentKey'),
    };
    if (validateAction.hasData(rst)) {
      this.props.onSearch(rst);
    } else {
      toastr.error('', '搜索条件不能为空哦！', {
        target: this.props.divSelector,
      });
    }
  }

  onClear() {
    this.inputRef1.current.firstElementChild.value = '';
    this.inputRef2.current.firstElementChild.value = '';
    this.inputRef3.current.firstElementChild.value = '';
  }

  render() {
    return (
      <Paper className={style.paperRoot}>
        <form onSubmit={e => this.onSubmit(e)}>
          <FormGroup>
            <FormCtl name="name" label="构件名称：" ref={this.inputRef1} />
            <FormCtl name="type" label="类型：" ref={this.inputRef2} />
            <FormCtl name="componentKey" label="构件key：" ref={this.inputRef3} />
            <div className={style.buttonGroup}>
              <Button
                classes={{
                  containedPrimary: style.button,
                }}
                color="primary"
                size="small"
                variant="contained"
                type="button"
                onClick={() => this.onClear()}
              >
                重置
              </Button>
              <Button
                classes={{
                  containedPrimary: style.button,
                }}
                color="primary"
                size="small"
                variant="contained"
                type="submit"
              >
                搜索
              </Button>
            </div>
          </FormGroup>
        </form>
      </Paper>
    );
  }
}

export default SearchBox;
