import * as React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from './assets/components/Home';
import { AuthProvider } from './contexts/LocalAuthContext';
import SignIn from './assets/components/sign-in/SignIn';
import AdminDashboard from './assets/components/AdminDashboard';
import PublicTransactions from './assets/components/PublicTransactions';
import ProtectedRoute from './assets/components/ProtectedRoute';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';
import ColorModeContext from './contexts/ColorModeContext';

function useStoredMode() {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = React.useState(() => {
    const saved = localStorage.getItem('color-mode');
    return saved === 'light' || saved === 'dark' ? saved : (prefersDark ? 'dark' : 'light');
  });
  React.useEffect(() => {
    localStorage.setItem('color-mode', mode);
  }, [mode]);
  return [mode, setMode];
}

function getTheme(mode) {
  return createTheme({
    palette: {
      mode,
      primary: { main: mode === 'dark' ? '#7dd3fc' : '#1976d2' },
      secondary: { main: mode === 'dark' ? '#a78bfa' : '#dc004e' },
    },
    typography: {
      fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
          },
        },
      },
    },
  });
}

function App() {
  const [mode, setMode] = useStoredMode();
  const colorMode = React.useMemo(() => ({
    toggleColorMode: () => setMode((prev) => (prev === 'light' ? 'dark' : 'light')),
  }), [setMode]);
  const theme = React.useMemo(() => getTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public route - default view for all users */}
              <Route path="/" element={<PublicTransactions />} />
              {/* Authentication routes */}
              <Route path="/signin" element={<SignIn />} />
              {/* Protected admin routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
                {/* Home route */}
                <Route path="/home" element={<Home />} />
              {/* Catch all - redirect to public view */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App
