/**
 * @param {string | string[] | undefined} color
 * @param {number} index
 * @param {string} defaultColor
 * @return {string}
 */
export const getIconColor = (
  color: string | string[] | undefined,
  index: number,
  defaultColor: string
) => {
  return color ? (typeof color === 'string' ? color : color[index] || defaultColor) : defaultColor;
};
