
export const plotMargin = { top: 20, right: 20, bottom: 80, left: 80 };

export const scatterWidth = () => 0.575 * window.innerWidth; 
export const scatterHeight = () => 0.75 * window.innerHeight;
export const innerScatterWidth = scatterWidth() - plotMargin.left - plotMargin.right;
export const innerScatterHeight = scatterHeight() - plotMargin.top - plotMargin.bottom;

export const aggrWidth = () =>0.575 * window.innerWidth;
export const aggrHeight = () => 0.75 * window.innerHeight;
export const innerAggrWidth =  () => aggrWidth() - plotMargin.left - plotMargin.right;
export const innerAggrHeight =  () => aggrHeight() - plotMargin.top - plotMargin.bottom;
