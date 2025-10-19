import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    TextField,
    Button,
    Box,
    Typography,
    Paper,
    Link
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
    const { login } = useAuth();

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/users/login', {
                username: identifier.trim(),
                password: password.trim()
            });

            if (response.status === 200) {
                login(response.data); // Убедитесь, что сервер возвращает ID пользователя
                navigate('/recipes');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Неверное имя пользователя/почта или пароль');
        }
    };

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4, width: 400 }}>
                <Typography variant="h5" gutterBottom align="center">
                    Вход в систему
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Имя пользователя или почта"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        label="Пароль"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        fullWidth
                        margin="normal"
                        required
                    />
                    {error && (
                        <Typography color="error" sx={{ mt: 1 }}>
                            {error}
                        </Typography>
                    )}
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        sx={{ mt: 3 }}
                    >
                        Войти
                    </Button>
                </form>
                <Typography sx={{ mt: 2 }} align="center">
                    Нет аккаунта? <Link href="/register">Зарегистрироваться</Link>
                </Typography>
            </Paper>
        </Box>
    );
};

Login.propTypes = {
    onLogin: PropTypes.func.isRequired
};

export default Login;

