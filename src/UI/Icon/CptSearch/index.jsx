import React from "Libs/react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Icon from "Base/Icon";
import Dialog from "./Dialog";
// import searchImg from "../img/white/cptSearch.png";
import { AntdIcon } from '../../utils/utils';
import iconstyle from '../../Toolbar/bottom.less';

function CptSearch(props) {
  const [visible, setVisible] = React.useState(false);
  React.useUpdateEffect(() => {
    if (props.mode === "漫游模式") {
      setVisible(false);
    }
  }, [props.mode]);
  return (
    <div
      title="构件查找"
      role="button"
      tabIndex={0}
      onClick={() => {
        setVisible(!visible);
      }}
    >
      <Dialog
        visible={visible}
        onCancel={() => setVisible(false)}
      />

      <Icon
        icon={<AntdIcon type="iconcomponentsearch" className={iconstyle.icon} />}
        title=""
        selected={visible}
        showTitle={false}
      />
    </div>
  );
}

CptSearch.propTypes = {
  mode: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => ({
  mode: state.button.mode,
});
const mapDispatchToProps = () => ({});
const WrappedContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(CptSearch);
export default WrappedContainer;
