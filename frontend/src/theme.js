// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#355E3B',       // мягкий лесной зелёный
            contrastText: '#FDFCF8',
        },
        secondary: {
            main: '#A67B5B',       // тёплый кофейный акцент
        },
        background: {
            default: '#FAF7F2',    // лёгкий теплый фон
            paper: '#FFFFFF',
        },
        text: {
            primary: '#2D2A26',    // глубокий коричнево-серый
            secondary: '#6C675F',
        },
    },
    typography: {
        fontFamily: 'Vollkorn, serif',
        h5: { fontWeight: 700, letterSpacing: '0.5px' },
        button: { fontWeight: 600, fontSize: '0.95rem' },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '50px',
                    textTransform: 'none',
                    padding: '10px 22px',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '18px',
                    boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    transition: 'transform 0.2s ease',
                    '&:hover': { transform: 'translateY(-3px)' },
                },
            },
        },
    },
});

export default theme;
