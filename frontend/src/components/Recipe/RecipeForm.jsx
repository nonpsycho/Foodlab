import React, {useState, useEffect, forwardRef, useImperativeHandle} from 'react';
import {
    TextField,
    Button,
    Box,
    Autocomplete,
    Typography,
    List,
    ListItem,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { Delete, Add, Edit } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { createRecipe, updateRecipe, fetchIngredients } from "../../api/recipesApi";
import axios from "axios";
import {Duration} from "luxon";

const getUserRecipesMap = () => {
    try {
        return JSON.parse(localStorage.getItem('userRecipes')) || {};
    } catch {
        return {};
    }
};
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 50;

const RecipeForm = forwardRef(({ selectedRecipe, onSuccess, onCancel, setFormData }, ref) => {
    const { userId, isAdmin } = useAuth();
    const [isEditingOwnRecipe, setIsEditingOwnRecipe] = useState(false);
    const [name, setName] = useState('');
    const [preparationTime, setPreparationTime] = useState('');
    const [ingredients, setIngredients] = useState([]);
    const [selectedIngredient, setSelectedIngredient] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentIngredients, setCurrentIngredients] = useState([]);
    const [newIngredientDialogOpen, setNewIngredientDialogOpen] = useState(false);
    const [newIngredientName, setNewIngredientName] = useState('');
    const [newIngredientProteins, setNewIngredientProteins] = useState('');
    const [newIngredientFats, setNewIngredientFats] = useState('');
    const [newIngredientCarbs, setNewIngredientCarbs] = useState('');
    const [editingIngredientId, setEditingIngredientId] = useState(null);
    const [errors, setErrors] = useState({
        name: '',
        preparationTime: '',
        ingredients: '',
        general: ''
    });
    const [newIngredientErrors, setNewIngredientErrors] = useState({
        name: '',
        proteins: '',
        fats: '',
        carbohydrates: ''
    });

    const validateDuration = (durationStr) => {
        if (!durationStr) return 'Время приготовления обязательно';

        try {
            // Проверяем соответствие формату ISO-8601
            if (!/^PT(?:(\d+)H)?(?:(\d+)M)?$/.test(durationStr)) {
                return 'Неверный формат. Пример: PT1H30M';
            }

            // Парсим продолжительность
            const regex = /^PT(?:(\d+)H)?(?:(\d+)M)?$/;
            const matches = durationStr.match(regex);
            const hours = parseInt(matches[1] || '0');
            const minutes = parseInt(matches[2] || '0');

            if (hours === 0 && minutes === 0) {
                return 'Время должно быть больше 0';
            }

            if (hours > 24) {
                return 'Время не может превышать 24 часа';
            }

            if (minutes >= 60) {
                return 'Минуты не могут быть больше 59';
            }

            return null; // Нет ошибок
        } catch (e) {
            return 'Неверный формат времени. Пример: PT1H30M';
        }
    };

    useEffect(() => {
        if (setFormData) {
            setFormData({
                submitForm: handleSubmit,
                isValid: name && preparationTime && currentIngredients.length > 0
            });
        }
    }, [name, preparationTime, currentIngredients, setFormData]);

    useEffect(() => {
        if (!userId) {
            setIsEditingOwnRecipe(false);
            return;
        }

        if (selectedRecipe?.id) {
            // Проверяем через localStorage, так как бэкенд не возвращает userId
            const userRecipes = getUserRecipesMap();
            setIsEditingOwnRecipe(userRecipes[selectedRecipe.id] === userId);
        } else {
            setIsEditingOwnRecipe(true);
        }
    }, [selectedRecipe, userId]);

    const canEdit = isAdmin || isEditingOwnRecipe;

    useEffect(() => {
        // Если пользователь не авторизован, но пытается редактировать рецепт
        if (!userId && selectedRecipe?.id) {
            onCancel();
            return;
        }

        const loadIngredients = async () => {
            try {
                const data = await fetchIngredients();
                setIngredients(data);
            } catch (error) {
                console.error('Error loading ingredients:', error);
            }
        };

        loadIngredients();

        if (selectedRecipe?.id) {
            setName(selectedRecipe.name);
            setPreparationTime(selectedRecipe.preparationTime);

            const loadRecipeIngredients = async () => {
                try {
                    const response = await axios.get(`http://localhost:8080/api/recipes/${selectedRecipe.id}/ingredients`);
                    const formattedIngredients = response.data.map(item => ({
                        id: item.id,
                        ingredient: {
                            id: item.ingredient.id,
                            name: item.ingredient.name,
                            proteins: item.ingredient.proteins,
                            fats: item.ingredient.fats,
                            carbohydrates: item.ingredient.carbohydrates
                        },
                        quantityInGrams: item.quantityInGrams
                    }));
                    setCurrentIngredients(formattedIngredients);
                } catch (error) {
                    console.error('Error loading recipe ingredients:', error);
                }
            };
            loadRecipeIngredients();
        }
    }, [selectedRecipe, userId, onCancel]);

    const handleAddIngredient = () => {
        if (!selectedIngredient || !quantity || parseFloat(quantity) <= 0) {
            alert('Выберите ингредиент и укажите количество');
            return;
        }

        if (editingIngredientId) {
            setCurrentIngredients(currentIngredients.map(item =>
                item.id === editingIngredientId || item.tempId === editingIngredientId
                    ? {
                        ...item,
                        ingredient: selectedIngredient,
                        quantityInGrams: parseFloat(quantity)
                    }
                    : item
            ));
        } else {
            const newIngredient = {
                ingredient: selectedIngredient,
                quantityInGrams: parseFloat(quantity),
                tempId: Date.now()
            };
            setCurrentIngredients([...currentIngredients, newIngredient]);
        }
        // Сбрасываем форму
        setSelectedIngredient(null);
        setQuantity('');
        setEditingIngredientId(null);
    };

    const handleEditIngredient = (ingredient) => {
        setEditingIngredientId(ingredient.id || ingredient.tempId);
        setSelectedIngredient(ingredient.ingredient);
        setQuantity(ingredient.quantityInGrams.toString());
    };

    const handleRemoveIngredient = (id) => {
        setCurrentIngredients(currentIngredients.filter(item =>
            (item.id && item.id !== id) || (item.tempId && item.tempId !== id)
        ));

        if (id === editingIngredientId) {
            setSelectedIngredient(null);
            setQuantity('');
            setEditingIngredientId(null);
        }
    };

    const handleCreateNewIngredient = async () => {
        // Валидация
        const errors = {};

        if (!newIngredientName.trim()) {
            errors.name = 'Введите название ингредиента';
        } else if (newIngredientName.length < MIN_NAME_LENGTH) {
            errors.name = `Название должно содержать минимум ${MIN_NAME_LENGTH} символа`;
        } else if (newIngredientName.length > MAX_NAME_LENGTH) {
            errors.name = `Название не должно превышать ${MAX_NAME_LENGTH} символов`;
        }

        if (newIngredientProteins < 0) {
            errors.proteins = 'Не может быть отрицательным';
        }

        if (newIngredientFats < 0) {
            errors.fats = 'Не может быть отрицательным';
        }

        if (newIngredientCarbs < 0) {
            errors.carbohydrates = 'Не может быть отрицательным';
        }

        if (Object.keys(errors).length > 0) {
            setNewIngredientErrors(errors);
            return;
        }

        try {
            const response = await axios.post('http://localhost:8080/api/ingredients', {
                name: newIngredientName,
                proteins: parseFloat(newIngredientProteins) || 0,
                fats: parseFloat(newIngredientFats) || 0,
                carbohydrates: parseFloat(newIngredientCarbs) || 0
            });

            const updatedIngredients = await fetchIngredients();
            setIngredients(updatedIngredients);
            setSelectedIngredient(response.data);
            setNewIngredientDialogOpen(false);
            setNewIngredientName('');
            setNewIngredientProteins(0);
            setNewIngredientFats(0);
            setNewIngredientCarbs(0);
            setNewIngredientErrors({}); // Сброс ошибок
        } catch (error) {
            if (error.response?.data?.errors) {
                setNewIngredientErrors(error.response.data.errors);
            } else {
                setNewIngredientErrors({
                    general: error.response?.data?.message || 'Не удалось создать ингредиент'
                });
            }
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setErrors({}); // Сброс предыдущих ошибок

        // Валидация на клиенте
        const newErrors = {};
        if (!name.trim()) {
            newErrors.name = 'Введите название рецепта';
        } else if (name.length < MIN_NAME_LENGTH) {
            newErrors.name = `Название должно содержать минимум ${MIN_NAME_LENGTH} символа`;
        } else if (name.length > MAX_NAME_LENGTH) {
            newErrors.name = `Название не должно превышать ${MAX_NAME_LENGTH} символов`;
        }

        const durationError = validateDuration(preparationTime);
        if (durationError) newErrors.preparationTime = durationError;
        if (currentIngredients.length === 0) newErrors.ingredients = 'Добавьте хотя бы один ингредиент';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const recipeDto = {
            name: name,
            preparationTime: preparationTime,
            recipeIngredients: currentIngredients.map(item => ({
                ingredientId: item.ingredient.id,
                quantityInGrams: item.quantityInGrams
            }))
        };

        setLoading(true);
        try {
            if (selectedRecipe?.id) {
                await updateRecipe(selectedRecipe.id, recipeDto);
            } else {
                const response = await createRecipe(recipeDto);
                if (response.data?.id && userId) {
                    const userRecipes = getUserRecipesMap();
                    userRecipes[response.data.id] = userId;
                    localStorage.setItem('userRecipes', JSON.stringify(userRecipes));
                }
            }
            onSuccess();
        } catch (error) {
            const backendErrors = error.response?.data?.errors || {};
            const mergedErrors = {
                ...newErrors,
                ...backendErrors,
                general: error.response?.data?.message || 'Ошибка сохранения рецепта'
            };
            setErrors(mergedErrors);
        }
    };

    useImperativeHandle(ref, () => ({
        submitForm: () => {
            handleSubmit();
        }
    }));

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                mb: 3,
                p: 3,
                borderRadius: 3,
                background: 'linear-gradient(to bottom right, #fdf8f4, #f7f3f0)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e4d8d4',
            }}
        >
            <TextField
                label="Название рецепта"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={!!errors.name}
                helperText={
                    errors.name ||
                    `${name.length}/${MAX_NAME_LENGTH} символов` +
                    (name.length < MIN_NAME_LENGTH ? ` (минимум ${MIN_NAME_LENGTH})` : '')
                }
                inputProps={{
                    maxLength: MAX_NAME_LENGTH
                }}
                FormHelperTextProps={{
                    sx: {
                        color: name.length > MAX_NAME_LENGTH ? 'error.main' :
                            name.length < MIN_NAME_LENGTH ? 'error.main' : 'text.secondary'
                    }
                }}
                fullWidth
                margin="normal"
                required
                disabled={!canEdit}
                sx={{
                    bgcolor: 'white',
                    borderRadius: 1,
                    '& .MuiInputBase-input': {
                        color: name.length > MAX_NAME_LENGTH ? 'error.main' :
                            name.length < MIN_NAME_LENGTH ? 'warning.main' : 'inherit'
                    }
                }}
            />
            <TextField
                label="Время приготовления (например, PT1H30M)"
                value={preparationTime}
                onChange={(e) => setPreparationTime(e.target.value)}
                fullWidth
                margin="normal"
                required
                error={!!errors.preparationTime}
                helperText={errors.preparationTime || 'Формат: PT1H30M (1 час 30 минут)'}
                disabled={!canEdit}
                sx={{ bgcolor: 'white', borderRadius: 1 }}
            />

            {errors.ingredients && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                    {errors.ingredients}
                </Typography>
            )}

            {errors.general && (
                <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                    {errors.general}
                </Typography>
            )}

            <Typography variant="h6" sx={{ mt: 3, color: '#12372A' }}>
                Ингредиенты
            </Typography>

            {canEdit ? (
                <>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
                        <Autocomplete
                            options={ingredients}
                            getOptionLabel={(option) => option.name}
                            value={selectedIngredient}
                            onChange={(e, newValue) => setSelectedIngredient(newValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Выберите ингредиент"
                                    fullWidth
                                    sx={{ bgcolor: 'white', borderRadius: 1 }}
                                />
                            )}
                            sx={{ flex: 2 }}
                            disabled={loading}
                        />
                        <TextField
                            label="Количество (г)"
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            sx={{ flex: 1, bgcolor: 'white', borderRadius: 1 }}
                            inputProps={{ min: 0.1, step: 0.1 }}
                            disabled={loading}
                        />
                        <Button
                            variant="contained"
                            onClick={handleAddIngredient}
                            disabled={!selectedIngredient || !quantity || loading}
                            sx={{
                                backgroundColor: '#12372A',
                                '&:hover': { backgroundColor: '#0f2e25' },
                                textTransform: 'none',
                                borderRadius: 2,
                                px: 3,
                                py: 1,
                                fontWeight: 600,
                            }}
                        >
                            {editingIngredientId ? 'Обновить' : 'Добавить'}
                        </Button>
                    </Box>
                    <Button
                        variant="text"
                        startIcon={<Add />}
                        onClick={() => setNewIngredientDialogOpen(true)}
                        sx={{
                            mt: 1,
                            textTransform: 'none',
                            color: '#7e6651',
                            fontWeight: 500,
                            '&:hover': {
                                color: '#5c4b3d',
                                backgroundColor: 'transparent',
                            },
                        }}
                        disabled={loading}
                    >
                        Создать новый ингредиент
                    </Button>
                </>
            ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    У вас нет прав для редактирования ингредиентов этого рецепта
                </Typography>
            )}

            <List sx={{ mt: 2 }}>
                {currentIngredients.map((item) => (
                    <ListItem key={item.id || item.tempId}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <Typography>
                                {item.ingredient.name} – {item.quantityInGrams} г
                            </Typography>
                            {canEdit && (
                                <Box>
                                    <IconButton
                                        onClick={() => handleEditIngredient(item)}
                                        color="primary"
                                        disabled={loading}
                                    >
                                        <Edit />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => handleRemoveIngredient(item.id || item.tempId)}
                                        color="error"
                                        disabled={loading}
                                    >
                                        <Delete />
                                    </IconButton>
                                </Box>
                            )}
                        </Box>
                    </ListItem>
                ))}
            </List>

            {/* Диалог создания нового ингредиента */}
            <Dialog
                open={newIngredientDialogOpen}
                onClose={() => {
                    setNewIngredientDialogOpen(false);
                    setNewIngredientErrors({});
                }}
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        width: '100%',
                        maxWidth: 450,
                        background: 'linear-gradient(to bottom right, #fffdfa, #fdf5f1)',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        background: 'linear-gradient(to right, #e8cfc6, #f3e4dd)',
                        color: '#12372A',
                        fontWeight: 600,
                        py: 2,
                        px: 3,
                        borderBottom: '1px solid #e0d5cf',
                    }}
                >
                    Создать новый ингредиент
                </DialogTitle>
                <DialogContent>
                    <TextField
                        label="Название ингредиента"
                        value={newIngredientName}
                        onChange={(e) => setNewIngredientName(e.target.value)}
                        error={!!newIngredientErrors.name}
                        helperText={
                            newIngredientErrors.name ||
                            `${newIngredientName.length}/${MAX_NAME_LENGTH} символов` +
                            (newIngredientName.length < MIN_NAME_LENGTH ? ` (минимум ${MIN_NAME_LENGTH})` : '')
                        }
                        inputProps={{
                            maxLength: MAX_NAME_LENGTH
                        }}
                        fullWidth
                        margin="normal"
                        required
                        sx={{
                            bgcolor: 'white',
                            borderRadius: 1,
                            '& .MuiInputBase-input': {
                                color: newIngredientName.length > MAX_NAME_LENGTH ? 'error.main' :
                                    newIngredientName.length < MIN_NAME_LENGTH ? 'warning.main' : 'inherit'
                            }
                        }}
                    />

                    <TextField
                        label="Белки (г на 100г)"
                        type="number"
                        value={newIngredientProteins}
                        onChange={(e) => setNewIngredientProteins(e.target.value)}
                        error={!!newIngredientErrors.proteins}
                        helperText={newIngredientErrors.proteins}
                        fullWidth
                        margin="normal"
                        inputProps={{ min: 0, step: 0.1 }}
                        sx={{ bgcolor: 'white', borderRadius: 1 }}
                    />

                    <TextField
                        label="Жиры (г на 100г)"
                        type="number"
                        value={newIngredientFats}
                        onChange={(e) => setNewIngredientFats(e.target.value)}
                        error={!!newIngredientErrors.fats}
                        helperText={newIngredientErrors.fats}
                        fullWidth
                        margin="normal"
                        inputProps={{ min: 0, step: 0.1 }}
                        sx={{ bgcolor: 'white', borderRadius: 1 }}
                    />

                    <TextField
                        label="Углеводы (г на 100г)"
                        type="number"
                        value={newIngredientCarbs}
                        onChange={(e) => setNewIngredientCarbs(e.target.value)}
                        error={!!newIngredientErrors.carbohydrates}
                        helperText={newIngredientErrors.carbohydrates}
                        fullWidth
                        margin="normal"
                        inputProps={{ min: 0, step: 0.1 }}
                        sx={{ bgcolor: 'white', borderRadius: 1 }}
                    />

                    {newIngredientErrors.general && (
                        <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                            {newIngredientErrors.general}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setNewIngredientDialogOpen(false)} sx={{ textTransform: 'none' }}>
                        Отмена
                    </Button>
                    <Button
                        onClick={handleCreateNewIngredient}
                        variant="contained"
                        sx={{
                            backgroundColor: '#12372A',
                            '&:hover': { backgroundColor: '#0f2e25' },
                            textTransform: 'none',
                            fontWeight: 600,
                        }}
                    >
                        Создать
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
});

export default RecipeForm;