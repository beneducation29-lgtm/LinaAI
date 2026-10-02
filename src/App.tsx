/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider } from './context/AppContext';
import { AppShell } from './components/layout/AppShell';
import { AppErrorBoundary } from './components/common/AppErrorBoundary';

export default function App() {
  return (
    <AppErrorBoundary><AppProvider><AppShell /></AppProvider></AppErrorBoundary>
  );
}
