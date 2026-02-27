/**
 * This file will be compiled into the extension under media/chat.js.
 */
// This must be imported
import React from 'react';
import { createRoot } from 'react-dom/client';

import { AntigravityPanelManager } from '@exa/chat-client/dist/app/antigravity/AntigravityPanelManager';

// NOTE(chendouglas): This import is used inside of the webview webpack but
// causes a failure later.  Just suppress it for now.
// eslint-disable-next-line
// @ts-ignore
import './style.css';

const domNode = document.getElementById('react-app');
if (!domNode) {
  console.error('Failed to find the root element');
  console.log(React);
} else {
  const root = createRoot(domNode);
  root.render(<AntigravityPanelManager />);
}
