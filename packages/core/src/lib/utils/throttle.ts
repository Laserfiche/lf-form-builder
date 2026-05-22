/**
 *
 * @param callback
 * @param {number} [delay=1000] delay defaults to 1000ms
 * @returns
 */
export const throttle = <Args extends unknown[], ReturnType>(
  callback: (...args: Args) => ReturnType,
  delay = 1000,
) => {
  let shouldWait = false;
  return (...args: Args): void => {
    if (shouldWait) return;
    callback(...args);
    shouldWait = true;
    setTimeout(() => {
      shouldWait = false;
    }, delay);
  };
};
