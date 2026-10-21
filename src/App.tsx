/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';

function AppContent() {
  const { setPublicTenantSlug } = useApp();

  useEffect(() => {
    // Check if URL contains /reservar/:slug
    const path = window.location.pathname;
    if (path.startsWith('/reservar/')) {
      const slug = path.replace('/reservar/', '').split('/')[0];
      if (slug) {
        setPublicTenantSlug(slug);
      }
    }
  }, [setPublicTenantSlug]);

  return <AppLayout />;
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
