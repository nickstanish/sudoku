import React from 'react';
import PropTypes from 'prop-types';
import './CellGroup.css';
import Grid from './Grid';

export default function CellGroup(props) {
  return (
    <Grid className="CellGroup">
      {
        props.group.map(props.renderCell)
      }
    </Grid>
  )
}

CellGroup.propTypes = {
  group: PropTypes.array,
  renderCell: PropTypes.func
}