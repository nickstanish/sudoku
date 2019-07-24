import React from 'react';
import PropTypes from 'prop-types';
import './Cell.css';

export default function Cell(props) {
  const cellProps = {
    'data-selected': props.selected,
    'data-hint': props.hint,
    onClick: props.onSelect
  };

  return (
    <div className="Game__Cell" {...cellProps}>
      {props.value}
      {props.value === '' && props.pencils &&
        <ul className="Game__Cell__Pencils">
          {
            Array(9).fill().map((_, index) => {
              const number = index + 1;
              return (
                <li className="Pencils__Pencil" key={index}>
                  <span>{props.pencils.has(number.toString()) ? number : null}</span>
                </li>
              );
            })
          }
        </ul>
      }
    </div>
  );
}

Cell.propTypes = {
  selected: PropTypes.bool,
  onSelect: PropTypes.func,
  hint: PropTypes.bool,
  pencils: PropTypes.instanceOf(Set),
  value: PropTypes.string
};