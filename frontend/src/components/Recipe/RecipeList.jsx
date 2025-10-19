import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchRecipes, deleteRecipe } from '../../api/recipesApi';
import RecipeForm from './RecipeForm';
import RecipeItem from './RecipeItem';
import {
    Typography,
    Box,
    List,
    Autocomplete,
    TextField,
    Button,
    InputAdornment,
    IconButton, Container, Stack
} from '@mui/material';
import ConfirmationDialog from './ConfirmationDialog';
import axios from 'axios';
import { matchSorter, rankings } from 'match-sorter';
import { Clear, Search } from '@mui/icons-material';
import {Duration} from "luxon";
import RecipeDialog from "./RecipeDialog";
import { Card, CardContent, CardActions, Grid } from '@mui/material';

const RecipeList = () => {
    const [recipes, setRecipes] = useState([]);
    const [filteredRecipes, setFilteredRecipes] = useState([]);
    const [comments, setComments] = useState([]);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [recipeToDelete, setRecipeToDelete] = useState(null);
    const [loading, setLoading] = useState(false);
    const { userId, isAdmin, logout: authLogout } = useAuth();
    const [currentUser, setCurrentUser] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const API_URL = 'http://localhost:8080/api/recipes';

    const getUserRecipesMap = () => {
        try {
            return JSON.parse(localStorage.getItem('userRecipes')) || {};
        } catch {
            return {};
        }
    };

    const loadRecipes = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_URL);
            const userRecipes = getUserRecipesMap();

            const recipesWithDetails = await Promise.all(
                response.data.map(async recipe => {
                    try {
                        const [usersRes, ingredientsRes] = await Promise.all([
                            axios.get(`${API_URL}/${recipe.id}/users`),
                            axios.get(`${API_URL}/${recipe.id}/ingredients`)
                        ]);

                        return {
                            ...recipe,
                            isOwned: userRecipes[recipe.id] === userId, // Добавляем флаг принадлежности
                            users: usersRes.data,
                            recipeIngredients: ingredientsRes.data.map(ing => ({
                                ...ing,
                                key: `${ing.ingredient.id}-${ing.quantityInGrams}`
                            }))
                        };
                    } catch (error) {
                        console.error(`Error loading details for recipe ${recipe.id}:`, error);
                        return {
                            ...recipe,
                            isOwned: userRecipes[recipe.id] === userId,
                            users: [],
                            recipeIngredients: []
                        };
                    }
                })
            );

            setRecipes(recipesWithDetails);
            setFilteredRecipes(recipesWithDetails);
        } catch (error) {
            console.error('Error loading recipes:', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const loadComments = useCallback(async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/comments'); // Измените URL на правильный
            setComments(response.data.map(comment => ({
                ...comment,
                key: `comment-${comment.id}`
            })));
        } catch (error) {
            console.error('Error loading comments:', error);
            setComments([]); // Устанавливаем пустой массив при ошибке
        }
    }, []);

    const loadUser = useCallback(async () => {
        if (userId) {
            try {
                const response = await axios.get(`http://localhost:8080/api/users/${userId}`);
                setCurrentUser(response.data);
            } catch (error) {
                console.error('Error loading user:', error);
                setCurrentUser(null); // Сбрасываем пользователя при ошибке
            }
        }
    }, [userId]);

    useEffect(() => {
        loadRecipes();
        loadComments();
        loadUser();
    }, [loadRecipes, loadComments, loadUser]);

    useEffect(() => {
        const term = searchTerm.toLowerCase();
        const filtered = recipes.filter(recipe => {
            const nameMatch = recipe.name.toLowerCase().includes(term);
            const ingredientMatch = recipe.recipeIngredients?.some(ingredient =>
                ingredient.ingredient?.name?.toLowerCase().includes(term)
            );
            return nameMatch || ingredientMatch;
        });
        setFilteredRecipes(filtered);
    }, [searchTerm, recipes]);

    const handleAddRecipe = () => {
        setSelectedRecipe(null);
        setDialogOpen(true);
    };

    const handleEdit = (recipe) => {
        const canEdit = isAdmin || recipe.isOwned;
        if (!canEdit) {
            alert('Вы можете редактировать только свои рецепты');
            return;
        }
        setSelectedRecipe(recipe);
        setDialogOpen(true);
    };

    const handleDeleteClick = (recipe) => {
        const canDelete = isAdmin || recipe.isOwned;
        if (!canDelete) {
            alert('Вы можете удалять только свои рецепты');
            return;
        }
        setRecipeToDelete(recipe.id);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            setLoading(true);
            await deleteRecipe(recipeToDelete, userId);
            await loadRecipes();
        } catch (error) {
            console.error('Error deleting recipe:', error);
            alert(error.response?.data?.message || 'Error deleting recipe');
        } finally {
            setDeleteDialogOpen(false);
            setLoading(false);
        }
    };

    const handleSuccess = async () => {
        await loadRecipes();
        setSelectedRecipe(null);
    };

    const handleCancel = () => setSelectedRecipe(null);

    const getRecipeNames = () => {
        return [...new Set(recipes.map(recipe => recipe.name))];
    };

    // Функция для фильтрации рецептов с учетом поиска
    const filterRecipes = (term) => {
        if (!term) return recipes;

        return matchSorter(recipes, term, {
            keys: [
                'name',
                {
                    key: 'recipeIngredients.ingredient.name',
                    threshold: matchSorter.rankings.CONTAINS
                }
            ],
            baseSort: (a, b) => a.item.name.localeCompare(b.item.name)
        });
    };

    const handleLogout = () => {
        authLogout(); // Вызываем функцию выхода из контекста
        setCurrentUser(null); // Сбрасываем текущего пользователя в состоянии
        setSearchTerm(''); // Очищаем поиск
        setFilteredRecipes(recipes); // Сбрасываем фильтрацию
    };

    // Обработчик изменения поискового запроса
    const handleSearchChange = (event, value) => {
        setSearchTerm(value || '');
        setFilteredRecipes(filterRecipes(value || ''));
    };

    // Очистка поиска
    const handleClearSearch = () => {
        setSearchTerm('');
        setFilteredRecipes(recipes);
    };

    const renderOption = (props, option, { inputValue }) => {
        const recipe = recipes.find(r => r.name === option);
        if (!recipe) return null;

        // Находим индекс начала совпадения
        const matchIndex = option.toLowerCase().indexOf(inputValue.toLowerCase());

        return (
            <li {...props}>
                <Box sx={{
                    p: 1,
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    width: '100%',
                    backgroundColor: '#fff',
                    boxShadow: 1,
                    '&:hover': {
                        backgroundColor: '#f5f5f5'
                    }
                }}>
                    <Typography variant="subtitle1">
                        {matchIndex >= 0 ? (
                            <>
                                {option.substring(0, matchIndex)}
                                <span style={{ fontWeight: 700, color: '#12372A' }}>
                                    {option.substring(matchIndex, matchIndex + inputValue.length)}
                                </span>
                                {option.substring(matchIndex + inputValue.length)}
                            </>
                        ) : (
                            option
                        )}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        ⏱ {recipe.preparationTime ?
                        formatPreparationTime(recipe.preparationTime) : '—'}
                        {' • '}
                        🧂 {recipe.recipeIngredients?.length || 0} ингредиентов
                    </Typography>
                </Box>
            </li>
        );
    };

    // Форматирование времени приготовления
    const formatPreparationTime = (isoDuration) => {
        if (!isoDuration) return 'Не указано';

        const duration = Duration.fromISO(isoDuration);
        const hours = duration.hours;
        const minutes = duration.minutes;

        let parts = [];
        if (hours) parts.push(`${hours} ч`);
        if (minutes) parts.push(`${minutes} мин`);

        return parts.join(' ') || '0 мин';
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {userId && (
                <Button
                    variant="contained"
                    onClick={handleAddRecipe}
                    sx={{ mb: 3 }}
                >
                    Добавить рецепт
                </Button>
            )}

            {/* Поиск */}
            <Box
                sx={{
                    width: {
                        xs: '100%',
                        md: 'calc((100% / 2 * 2) - 32px)', // ширина двух карточек минус spacing
                    },
                    mx: 'auto',
                    mb: 3,
                }}
            >

            <Autocomplete
                    freeSolo
                    options={getRecipeNames()}
                    value={searchTerm}
                    onChange={(event, newValue) => handleSearchChange(event, newValue)}
                    onInputChange={(event, newInputValue) => handleSearchChange(event, newInputValue)}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Поиск рецептов"
                            variant="outlined"
                            fullWidth
                            disabled={loading}
                            sx={{
                                backgroundColor: '#fdf8f4',
                                borderRadius: 2,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2,
                                    transition: 'box-shadow 0.2s ease',
                                    '& fieldset': {
                                        borderColor: '#cbb6a4',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#a28c7e',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#12372A',
                                        boxShadow: '0 0 0 3px rgba(18, 55, 42, 0.1)',
                                    },
                                },
                                '& .MuiInputLabel-root': {
                                    color: '#5c4b3a',
                                },
                                '& .Mui-focused .MuiInputLabel-root': {
                                    color: '#12372A',
                                },
                            }}
                            InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search sx={{ color: '#a28c7e' }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        {searchTerm && (
                                            <IconButton
                                                onClick={handleClearSearch}
                                                edge="end"
                                                size="small"
                                                sx={{
                                                    color: '#6b5c4f',
                                                    '&:hover': {
                                                        color: '#12372A',
                                                        backgroundColor: 'rgba(18, 55, 42, 0.05)',
                                                    },
                                                }}
                                            >
                                                <Clear fontSize="small" />
                                            </IconButton>
                                        )}
                                    </InputAdornment>
                                ),
                            }}
                        />
                    )}
                    renderOption={renderOption}
                    filterOptions={(options, { inputValue }) =>
                        matchSorter(options, inputValue)
                    }
                />
            </Box>

            {/* Список рецептов */}
            <Grid container spacing={4} sx={{
                width: '100%',
                margin: '0 auto',
                justifyContent: 'center',
                pb: 4,
                position: 'relative',
            }}>
                {filteredRecipes.map(recipe => (
                    <Grid item key={recipe.id} xs={12} sm={12} md={6} lg={6} xl={6} sx={{
                        display: 'flex',
                        minWidth: 350, // Минимальная ширина карточки
                        maxWidth: { md: 'calc(50% - 32px)', lg: 'calc(50% - 32px)' }, // Учитываем spacing={4} (32px)
                        flexGrow: 1
                    }}>
                        <RecipeItem
                            recipe={recipe}
                            onEdit={handleEdit}
                            onDelete={handleDeleteClick}
                            initialComments={comments}
                            loadComments={loadComments}
                        />
                    </Grid>
                ))}
            </Grid>

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Подтверждение удаления"
                message="Вы уверены, что хотите удалить этот рецепт?"
                disabled={loading}
            />
            <RecipeDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                selectedRecipe={selectedRecipe}
                onSuccess={handleSuccess}
            />
        </Container>
    );
};

export default RecipeList;
