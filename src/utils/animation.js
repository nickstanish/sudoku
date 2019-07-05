export function requestInterval(fn, delay) {
  let timestamp = new Date();
  let keepGoing = true;
  let id = null;
  const loop = () => {
    if (!keepGoing) {
      return;
    }
    const now = new Date();
    if (now - timestamp > delay) {
      timestamp = now;
      fn.call();
    }
    id = window.requestAnimationFrame(loop);
  }
  id = window.requestAnimationFrame(loop);
  return () => {
    keepGoing = false;
    if (id !== null) {
      window.cancelAnimationFrame(id);
    }
  }
}