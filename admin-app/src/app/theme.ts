import { createTheme } from '@mui/material/styles'

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#145c24',
      light: '#2f963d',
      dark: '#0c4518',
    },
    secondary: {
      main: '#b6d000',
      light: '#dbe93f',
      dark: '#7b9200',
    },
    background: {
      default: '#f6f6ef',
      paper: '#fffef8',
    },
    success: {
      main: '#30b48f',
    },
    warning: {
      main: '#c9d400',
    },
    error: {
      main: '#eb007f',
    },
    info: {
      main: '#2cb6a7',
    },
    text: {
      primary: '#16461d',
      secondary: '#547055',
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: '"Manrope Variable", "Segoe UI", sans-serif',
    h1: {
      fontSize: '2.4rem',
      fontWeight: 800,
      letterSpacing: '-0.04em',
    },
    h2: {
      fontWeight: 800,
      letterSpacing: '-0.03em',
    },
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 14px 32px rgba(20, 90, 34, 0.08)',
          border: '1px solid rgba(20, 90, 34, 0.12)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: 18,
          '&.MuiButton-containedPrimary': {
            boxShadow: '0 12px 24px rgba(20, 92, 36, 0.22)',
          },
        },
      },
    },
  },
})
