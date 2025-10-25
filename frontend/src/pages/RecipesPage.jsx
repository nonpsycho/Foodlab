import React from 'react';
import RecipeList from '../components/Recipe/RecipeList';
import { Container, Typography, Button, Box, Stack, Avatar } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function RecipesPage() {
    const { userId, logout, currentUser } = useAuth();

    const handleLogout = () => logout();

    return (
        <Container maxWidth="lg" sx={{ pt: 4 }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(0,0,0,0.08)',
                    pb: 2,
                    mb: 4,
                }}
            >
                {/* Название проекта */}
                <Typography
                    variant="h4"
                    sx={{
                        fontFamily: 'Vollkorn, serif',
                        fontWeight: 700,
                        letterSpacing: '0.03em',
                        color: '#2D2A26',
                    }}
                >
                    <Box
                        component="span"
                        sx={{
                            color: '#355E3B',
                            fontWeight: 700,
                        }}
                    >
                        Food
                    </Box>
                    lab
                </Typography>

                {/* Правая часть: пользователь / кнопки */}
                {userId ? (
                    <Stack direction="row" alignItems="center" spacing={2}>
                        {currentUser && (
                            <>
                                <Avatar
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        bgcolor: '#355E3B',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                    }}
                                >
                                    {currentUser.username?.charAt(0).toUpperCase()}
                                </Avatar>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        fontWeight: 500,
                                        color: '#4B3F33',
                                    }}
                                >
                                    {currentUser.username}
                                </Typography>
                            </>
                        )}
                        <Button
                            variant="outlined"
                            onClick={handleLogout}
                            sx={{
                                textTransform: 'none',
                                color: '#355E3B',
                                borderColor: '#355E3B',
                                borderRadius: '10px',
                                px: 2.5,
                                py: 0.7,
                                '&:hover': {
                                    backgroundColor: '#EFF5F0',
                                    borderColor: '#2E5233',
                                },
                            }}
                        >
                            Выйти
                        </Button>
                    </Stack>
                ) : (
                    <Stack direction="row" spacing={1}>
                        <Button
                            component={Link}
                            to="/login"
                            variant="outlined"
                            sx={{
                                textTransform: 'none',
                                color: '#355E3B',
                                borderColor: '#355E3B',
                                borderRadius: '10px',
                                px: 2.5,
                                py: 0.7,
                                fontWeight: 600,
                                '&:hover': {
                                    backgroundColor: '#EFF5F0',
                                    borderColor: '#2E5233',
                                },
                            }}
                        >
                            Войти
                        </Button>
                        <Button
                            component={Link}
                            to="/register"
                            variant="contained"
                            sx={{
                                backgroundColor: '#355E3B',
                                color: 'white',
                                textTransform: 'none',
                                fontWeight: 600,
                                borderRadius: '10px',
                                px: 2.5,
                                py: 0.7,
                                boxShadow: 'none',
                                '&:hover': {
                                    backgroundColor: '#2E5233',
                                },
                            }}
                        >
                            Зарегистрироваться
                        </Button>
                    </Stack>
                )}
            </Box>

            <RecipeList />
        </Container>
    );
}

export default RecipesPage;
