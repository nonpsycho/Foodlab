import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        userId: null,
        isAdmin: false,
        isLoading: true,
        currentUser: null
    });

    // Функция для загрузки данных пользователя
    const loadUserData = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/users/${userId}`);
            setAuthState(prev => ({
                ...prev,
                currentUser: response.data
            }));
        } catch (error) {
            console.error('Error loading user data:', error);
            setAuthState(prev => ({
                ...prev,
                currentUser: null
            }));
        }
    };

    // Инициализация при загрузке
    useEffect(() => {
        const storedId = localStorage.getItem('userId');
        if (storedId) {
            const userId = parseInt(storedId);
            const isAdmin = userId === 1; // ID=1 - администратор
            setAuthState({
                userId,
                isAdmin,
                isLoading: false,
                currentUser: null
            });
            loadUserData(userId);
        } else {
            setAuthState(prev => ({ ...prev, isLoading: false }));
        }
    }, []);

    // Функция входа
    const login = async (id) => {
        const isAdmin = id === 1;
        localStorage.setItem('userId', id.toString());
        setAuthState({
            userId: id,
            isAdmin,
            isLoading: false,
            currentUser: null
        });
        await loadUserData(id);
    };

    // Функция выхода
    const logout = () => {
        localStorage.removeItem('userId');
        setAuthState({
            userId: null,
            isAdmin: false,
            isLoading: false,
            currentUser: null
        });
    };

    const checkPermission = (ownerId) => {
        return authState.isAdmin || authState.userId === ownerId;
    };

    return (
        <AuthContext.Provider value={{
            userId: authState.userId,
            isAdmin: authState.isAdmin,
            isLoading: authState.isLoading,
            currentUser: authState.currentUser,
            login,
            logout,
            checkPermission
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
