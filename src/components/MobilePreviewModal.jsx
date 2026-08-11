import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Modal, Dropdown, Input } from 'semantic-ui-react';
import { Resizable } from 're-resizable';
import { BodyClass } from '@plone/volto/helpers';

import { devicePresets, defaultDevice, CUSTOM_DEVICE } from './devicePresets';

export const MOBILE_PREVIEW_DIALOG_ID = 'mobile-preview-dialog';
const TITLE_ID = 'mobile-preview-title';
const HELP_TEXT_ID = 'mobile-preview-help-text';
const DEVICE_LABEL_ID = 'mobile-preview-device-label';
const FRAME_ID = 'mobile-preview-frame';

const messages = defineMessages({
  title: {
    id: 'Mobile preview',
    defaultMessage: 'Mobile preview',
  },
  device: {
    id: 'Device',
    defaultMessage: 'Device',
  },
  custom: {
    id: 'Custom',
    defaultMessage: 'Custom',
  },
  width: {
    id: 'Width',
    defaultMessage: 'Width in pixels',
  },
  height: {
    id: 'Height',
    defaultMessage: 'Height in pixels',
  },
  close: {
    id: 'Close',
    defaultMessage: 'Close',
  },
  helpText: {
    id: 'Mobile preview help text',
    defaultMessage:
      'Change the preview size by choosing a device from the menu, editing the values on the right, or dragging the corner of the preview.',
  },
});

const RESIZABLE_ENABLE = {
  top: false,
  right: true,
  bottom: true,
  left: false,
  topRight: false,
  bottomRight: true,
  bottomLeft: false,
  topLeft: false,
};

const deviceOptions = (intl) => [
  ...devicePresets.map((device) => ({
    key: device.id,
    value: device.id,
    text: `${device.name} (${device.width}×${device.height})`,
  })),
  {
    key: CUSTOM_DEVICE,
    value: CUSTOM_DEVICE,
    text: intl.formatMessage(messages.custom),
  },
];

// `credentialless` (Chrome/Edge only, as of writing) loads the iframe
// without forwarding cookies/storage, so Volto renders it exactly as an
// anonymous visitor would see it (no editing toolbar) - no CSS hiding
// needed. Browsers without support (Firefox, Safari) fall back to a normal
// same-origin, cookie-forwarded load, so the toolbar has to be hidden by
// reaching into the (same-origin) iframe document once it has loaded.
const supportsCredentialless =
  typeof document !== 'undefined' &&
  'credentialless' in document.createElement('iframe');

const hideToolbarInPreview = (event) => {
  const doc = event.target.contentDocument;
  if (!doc) {
    return;
  }
  const style = doc.createElement('style');
  style.textContent = `
    #toolbar, #sidebar { display: none !important; }
    body, #main, .pusher { margin: 0 !important; padding: 0 !important; }
  `;
  doc.head.appendChild(style);
};

const MobilePreviewModal = ({ contentUrl, onClose }) => {
  const intl = useIntl();
  const [selectedDevice, setSelectedDevice] = useState(defaultDevice.id);
  const [width, setWidth] = useState(defaultDevice.width);
  const [height, setHeight] = useState(defaultDevice.height);

  const selectDevice = (id) => {
    setSelectedDevice(id);
    const device = devicePresets.find((item) => item.id === id);
    if (device) {
      setWidth(device.width);
      setHeight(device.height);
    }
  };

  const setDimension = (setter) => (event) => {
    const value = parseInt(event.target.value, 10);
    setSelectedDevice(CUSTOM_DEVICE);
    if (!Number.isNaN(value) && value > 0) {
      setter(value);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      closeIcon={{
        name: 'close',
        role: 'button',
        tabIndex: 0,
        'aria-label': intl.formatMessage(messages.close),
      }}
      size="large"
      className="mobile-preview-modal"
      id={MOBILE_PREVIEW_DIALOG_ID}
      role="dialog"
      aria-modal="true"
      aria-labelledby={TITLE_ID}
      aria-describedby={HELP_TEXT_ID}
    >
      {/* design-comuni-plone-theme styles Semantic modals correctly only
      under body.cms-ui (Bootstrap Italia is compiled under .public-ui and
      collides with Semantic's generic class names otherwise). Switch into
      that scope for as long as this modal is mounted, revert on close. */}
      <BodyClass className="cms-ui" />
      <BodyClass className="public-ui" remove />
      <Modal.Header id={TITLE_ID}>
        {intl.formatMessage(messages.title)}
      </Modal.Header>
      <Modal.Content>
        <p className="mobile-preview-help-text" id={HELP_TEXT_ID}>
          {intl.formatMessage(messages.helpText)}
        </p>
        <div className="mobile-preview-controls">
          <span id={DEVICE_LABEL_ID} className="mobile-preview-device-label">
            {intl.formatMessage(messages.device)}
          </span>
          <Dropdown
            selection
            value={selectedDevice}
            options={deviceOptions(intl)}
            onChange={(event, { value }) => selectDevice(value)}
            aria-labelledby={DEVICE_LABEL_ID}
            aria-controls={FRAME_ID}
          />
          <div className="mobile-preview-dimensions">
            <Input
              type="number"
              min="200"
              value={width}
              aria-label={intl.formatMessage(messages.width)}
              aria-controls={FRAME_ID}
              onChange={setDimension(setWidth)}
            />
            <span className="unit" aria-hidden="true">
              px
            </span>
            <span className="mobile-preview-separator" aria-hidden="true">
              ×
            </span>
            <Input
              type="number"
              min="300"
              value={height}
              aria-label={intl.formatMessage(messages.height)}
              aria-controls={FRAME_ID}
              onChange={setDimension(setHeight)}
            />
            <span className="unit" aria-hidden="true">
              px
            </span>
          </div>
        </div>
        <div className="mobile-preview-frame-wrapper">
          <Resizable
            size={{ width, height }}
            minWidth={200}
            minHeight={300}
            maxWidth="100%"
            maxHeight="75vh"
            enable={RESIZABLE_ENABLE}
            onResize={(event, direction, ref) => {
              setSelectedDevice(CUSTOM_DEVICE);
              setWidth(ref.offsetWidth);
              setHeight(ref.offsetHeight);
            }}
            className="mobile-preview-resizable"
          >
            <iframe
              id={FRAME_ID}
              src={contentUrl}
              title={intl.formatMessage(messages.title)}
              className="mobile-preview-iframe"
              credentialless={supportsCredentialless ? 'true' : undefined}
              onLoad={supportsCredentialless ? undefined : hideToolbarInPreview}
            />
          </Resizable>
        </div>
      </Modal.Content>
    </Modal>
  );
};

export default MobilePreviewModal;
