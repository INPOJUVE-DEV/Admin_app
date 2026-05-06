import { alpha, createTheme } from '@mui/material/styles'

export const appTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3ecf6d',
      light: '#71e596',
      dark: '#24964a',
    },
    secondary: {
      main: '#c4db2d',
      light: '#d9eb68',
      dark: '#8ca300',
    },
    background: {
      default: '#07110b',
      paper: '#0f1c14',
    },
    success: {
      main: '#3dc39b',
    },
    warning: {
      main: '#d8c94a',
    },
    error: {
      main: '#ff5fa2',
    },
    info: {
      main: '#53c4d5',
    },
    text: {
      primary: '#eef7ef',
      secondary: '#a5baaa',
    },
    divider: 'rgba(140, 173, 149, 0.18)',
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
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background:
            'radial-gradient(circle at top left, rgba(31,181,148,0.08), transparent 26%), radial-gradient(circle at bottom right, rgba(196,219,45,0.08), transparent 24%), #07110b',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 18px 36px rgba(0, 0, 0, 0.28)',
          border: '1px solid rgba(123, 155, 132, 0.16)',
          backgroundImage: 'none',
          backgroundColor: '#0f1c14',
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
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(8, 18, 12, 0.84)',
          borderBottom: '1px solid rgba(123, 155, 132, 0.16)',
          backdropFilter: 'blur(18px)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: 18,
          '&.MuiButton-containedPrimary': {
            color: '#04110a',
            boxShadow: '0 12px 24px rgba(62, 207, 109, 0.2)',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: alpha('#dff6e5', 0.03),
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(123, 155, 132, 0.14)',
        },
        head: {
          color: '#eef7ef',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
        },
      },
    },
  },
})
