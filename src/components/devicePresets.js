export const CUSTOM_DEVICE = 'custom';

export const devicePresets = [
  { id: 'iphone-se', name: 'iPhone SE', width: 375, height: 667 },
  { id: 'iphone-14', name: 'iPhone 14', width: 390, height: 844 },
  {
    id: 'iphone-14-pro-max',
    name: 'iPhone 14 Pro Max',
    width: 430,
    height: 932,
  },
  { id: 'galaxy-s20', name: 'Samsung Galaxy S20', width: 360, height: 800 },
  { id: 'ipad-mini', name: 'iPad Mini', width: 768, height: 1024 },
  { id: 'ipad-pro-11', name: 'iPad Pro 11"', width: 834, height: 1194 },
  { id: 'surface-duo', name: 'Surface Duo', width: 540, height: 720 },
  { id: 'desktop', name: 'Desktop', width: 1280, height: 800 },
];

export const defaultDevice = devicePresets[0];
