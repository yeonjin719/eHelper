import '../polyfills/process';
import React from 'react';
import { createRoot } from 'react-dom/client';
import '../content/styles/content.css';
import './preview.css';
import { PreviewApp } from './PreviewApp';

const rootEl = document.getElementById('preview-root');
if (rootEl) {
    createRoot(rootEl).render(<PreviewApp />);
}
