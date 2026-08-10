import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import jwtDecode from 'jwt-decode';
import { defineMessages, useIntl } from 'react-intl';
import { Icon } from '@plone/volto/components';
import { Plug } from '@plone/volto/components/manage/Pluggable';
import { getUser } from '@plone/volto/actions';
import { getBaseUrl, userHasRoles } from '@plone/volto/helpers';
import config from '@plone/volto/registry';
import { Button } from 'semantic-ui-react';

import MobilePreviewModal, { MOBILE_PREVIEW_DIALOG_ID } from './MobilePreviewModal';
import mobileSVG from '@plone/volto/icons/mobile.svg';

const messages = defineMessages({
  mobilePreview: {
    id: 'Mobile preview',
    defaultMessage: 'Mobile preview',
  },
});

const MobilePreviewToolbarButton = (props) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);

  const token = useSelector((state) => state.userSession.token);
  const userId = token ? jwtDecode(token).sub : null;
  const user = useSelector((state) => state.users.user);
  const content = useSelector((state) => state.content.data);

  useEffect(() => {
    if (userId) {
      dispatch(getUser(userId));
    }
  }, [dispatch, userId]);

  const isEditor = userHasRoles(user, config.settings.mobilePreviewRoles);
  const contentUrl = getBaseUrl(props.pathname);
  const hasContent = !!content?.['@id'];

  if (!isEditor || !hasContent) {
    return null;
  }

  return (
    <>
      <Plug pluggable="main.toolbar.bottom" id="mobile-preview-btn">
        <Button
          aria-label={intl.formatMessage(messages.mobilePreview)}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={MOBILE_PREVIEW_DIALOG_ID}
          className="mobile-preview-toolbar-button"
          onClick={() => setIsOpen(true)}
          tabIndex={0}
        >
          <Icon
            name={mobileSVG}
            size="30px"
            className="circled"
            title={intl.formatMessage(messages.mobilePreview)}
          />
        </Button>
      </Plug>
      {isOpen && (
        <MobilePreviewModal
          contentUrl={contentUrl}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default MobilePreviewToolbarButton;
