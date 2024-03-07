
export const plotMargin = { top: 20, right: 160, bottom: 80, left: 80 };

export const scatterWidth = () => 0.60 * window.innerWidth; 
export const scatterHeight = () => 0.85 * window.innerHeight;

export const aggrWidth = () =>0.60 * window.innerWidth;
export const aggrHeight = () => 0.85 * window.innerHeight;
export const innerAggrWidth =  () => aggrWidth() - plotMargin.left - plotMargin.right;
export const innerAggrHeight =  () => aggrHeight() - plotMargin.top - plotMargin.bottom;
