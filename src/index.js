import { MobilePreviewToolbarButton } from './components';

import './theme/styles.less';

const applyConfig = (config) => {
  // Roles allowed to see the mobile preview button. Override from the
  // integration project's own config.js (applied after addons) to change
  // this per-site without touching this addon's code, e.g.:
  //   config.settings.mobilePreviewRoles = ['Editor', 'Contributor'];
  config.settings.mobilePreviewRoles = config.settings.mobilePreviewRoles || [
    'Editor',
  ];

  config.settings.appExtras = [
    ...(config.settings.appExtras || []),
    {
      // Mounted everywhere: the toolbar Pluggable slot is already
      // edit/view agnostic, visibility is decided inside the component
      // itself (role check + current content match).
      match: { path: '' },
      component: MobilePreviewToolbarButton,
    },
  ];

  return config;
};

export default applyConfig;
