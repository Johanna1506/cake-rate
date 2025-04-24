import React from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import App from './App'
import { lightTheme } from './theme/theme'
import { queryClient } from './lib/queryClient'

const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');
const root = createRoot(container);

const Main: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </QueryClientProvider>
);

root.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);
