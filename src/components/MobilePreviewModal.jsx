import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Modal, Dropdown, Input } from 'semantic-ui-react';
import { Resizable } from 're-resizable';
import { BodyClass } from '@plone/volto/helpers';

import { devicePresets, defaultDevice, CUSTOM_DEVICE } from './devicePresets';

const messages = defineMessages({
  title: {
    id: 'Mobile preview',
    defaultMessage: 'Anteprima mobile',
  },
  device: {
    id: 'Device',
    defaultMessage: 'Dispositivo',
  },
  custom: {
    id: 'Custom',
    defaultMessage: 'Personalizzata',
  },
  width: {
    id: 'Width',
    defaultMessage: 'Larghezza',
  },
  height: {
    id: 'Height',
    defaultMessage: 'Altezza',
  },
  close: {
    id: 'Close',
    defaultMessage: 'Chiudi',
  },
  helpText: {
    id: 'Mobile preview help text',
    defaultMessage:
      "Puoi cambiare le dimensioni dell'anteprima scegliendo un dispositivo dal menu, modificando i valori negli input oppure trascinando manualmente l'angolo dell'anteprima.",
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
    <Modal open onClose={onClose} closeIcon size="large" className="mobile-preview-modal">
      {/* design-comuni-plone-theme styles Semantic modals correctly only
      under body.cms-ui (Bootstrap Italia is compiled under .public-ui and
      collides with Semantic's generic class names otherwise). Switch into
      that scope for as long as this modal is mounted, revert on close. */}
      <BodyClass className="cms-ui" />
      <BodyClass className="public-ui" remove />
      <Modal.Header>{intl.formatMessage(messages.title)}</Modal.Header>
      <Modal.Content>
        <div className="mobile-preview-controls">
          <label>
            {intl.formatMessage(messages.device)}
            <Dropdown
              selection
              value={selectedDevice}
              options={deviceOptions(intl)}
              onChange={(event, { value }) => selectDevice(value)}
            />
          </label>
          <div className="mobile-preview-dimensions">
            <Input
              type="number"
              min="200"
              value={width}
              aria-label={intl.formatMessage(messages.width)}
              onChange={setDimension(setWidth)}
            />
            <span className="unit">px</span>
            <span className="mobile-preview-separator">×</span>
            <Input
              type="number"
              min="300"
              value={height}
              aria-label={intl.formatMessage(messages.height)}
              onChange={setDimension(setHeight)}
            />
            <span className="unit">px</span>
          </div>
        </div>
        <p className="mobile-preview-help-text">
          {intl.formatMessage(messages.helpText)}
        </p>
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
