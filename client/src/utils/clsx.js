//Simple clsx replacement for className management.
export function clsx(...args) {
  return args
    .flat()
    .filter(Boolean)
    .map(arg => {
      if (typeof arg === 'string') return arg;
      if (typeof arg === 'object' && arg !== null) {
        return Object.keys(arg)
          .filter(key => arg[key])
          .join(' ');
      }
      return '';
    })
    .join(' ')
    .trim();
}

export default clsx;

