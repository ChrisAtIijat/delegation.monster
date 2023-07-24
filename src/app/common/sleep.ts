export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      resolve();
    }, ms);
  });
};
