import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

// Create a theme instance.
const theme = createTheme({
  cssVariables: true,
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: red.A400,
    },
  },
  typography: {
    fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
          transition: 'background-color 350ms ease, color 350ms ease',
          WebkitTransition: 'background-color 350ms ease, color 350ms ease',
          // ensure root also transitions when MUI toggles palette
          '#root': {
            transition: 'background-color 350ms ease, color 350ms ease'
          }
        },
        // Smooth theme transitions for common surfaces
        '.MuiPaper-root, .MuiCard-root, .MuiAppBar-root, .MuiToolbar-root, .MuiTableCell-root, .MuiChip-root, .MuiButton-root, .MuiOutlinedInput-root, .MuiFormControl-root, .MuiSelect-select': {
          transition: 'background-color 420ms ease, color 420ms ease, border-color 420ms ease, box-shadow 420ms ease'
        },
        '.MuiOutlinedInput-notchedOutline': {
          transition: 'border-color 420ms ease'
        }
      },
    },
  },
});

export default theme;