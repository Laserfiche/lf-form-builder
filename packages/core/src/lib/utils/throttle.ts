/**
 *
 * @param {(...args: any) => any} callback
 * @param {number} [delay=1000] delay defaults to 1000ms
 * @returns
 */
export const throttle = (
  callback: (...args: any[]) => any,
  delay = 1000,
) => {
  let shouldWait = false;
  return (...args: any[]) => {
    if (shouldWait) return;
    callback(...args);
    shouldWait = true;
    setTimeout(() => {
      shouldWait = false;
    }, delay);
  };
};
