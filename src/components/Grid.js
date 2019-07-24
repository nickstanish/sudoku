import React from 'react';
import PropTypes from 'prop-types';
import './Grid.css';

export default function Grid(props) {
  const classes = ['Grid'];
  if (props.className) {
    classes.push(props.className);
  }
  const classNames = classes.join(' ');
  return (
    <div className={classNames}>
      {props.children}
    </div>
  )
}

Grid.propTypes = {
  children: PropTypes.node
}