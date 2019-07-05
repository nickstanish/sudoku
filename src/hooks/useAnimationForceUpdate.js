import { useState, useEffect } from 'react';
import { requestInterval } from '../utils/animation';

export default function useAnimationForceUpdate(delay) {
  const [, setTick] = useState(0);
  useEffect(() => {
    return requestInterval(() => {
      setTick(tick => tick + 1);
    }, delay);
  });
}