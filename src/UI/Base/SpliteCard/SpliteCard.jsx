import React from "react";
import PropTypes from "prop-types";
import style from "./style.less";

function SpliteCard(props) {
  const [selected, setSelected] = React.useState(0);
  const List = (
    <div className={style.title}>
      {props.titles.map(
        (title, index) => (
          <span
            role="button"
            tabIndex={0}
            key={title}
            className={index === selected ? style.selected : ''}
            onClick={ev => {
              ev.preventDefault();
              ev.stopPropagation();
              setSelected(index);
            }}
          >
            {title}
          </span>
        )
      )}
    </div>
  );
  return (
    <div className={props.className}>
      {List}
      {props.children.map((child, index) => (
        <div
          key={
            // eslint-disable-next-line react/no-array-index-key
            index
          }
          style={{ display: index === selected ? 'block' : 'none' }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

SpliteCard.propTypes = {
  className: PropTypes.string,
  titles: PropTypes.arrayOf(PropTypes.string).isRequired,
  children: PropTypes.arrayOf(PropTypes.node).isRequired,
};

SpliteCard.defaultProps = {
  className: '',
};

export default SpliteCard;
