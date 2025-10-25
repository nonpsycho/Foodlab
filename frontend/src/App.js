import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RecipesPage from './pages/RecipesPage';
import Login from './components/Auth/Login';
import PrivateRoute from './components/Auth/PrivateRoute';
import Register from "./components/Auth/Register";

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<RecipesPage />} />
                    <Route path="/recipes" element={
                        <PrivateRoute>
                            <RecipesPage />
                        </PrivateRoute>
                    } />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
