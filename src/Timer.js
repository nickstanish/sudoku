import React from 'react';
import PropTypes from 'prop-types';
import useAnimationForceUpdate from './hooks/useAnimationForceUpdate';
const TICK_DELAY = 250; // MS delay, only update 4 times a second

function printTime(minutes, seconds) {
  const secondsStr = seconds < 10 ? `0${seconds}` : seconds.toString();
  return `${minutes}:${secondsStr}`;
}

export default function Timer(props) {
  useAnimationForceUpdate(TICK_DELAY);
  const stopAt = props.stopAt || new Date();
  const diffSeconds = (stopAt - props.startAt) / 1000;
  const minutes = Math.floor(diffSeconds / 60);
  const seconds = Math.floor(diffSeconds % 60);
  return (
    <span>{printTime(minutes, seconds)}</span>
  );
}

Timer.propTypes = {
  startAt: PropTypes.objectOf(Date),
  stopAt: PropTypes.objectOf(Date)
};