import React, { useState, useEffect, useCallback } from 'react';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    ListItem,
    IconButton,
    Box,
    Typography,
    Divider,
    Avatar,
    Card,
    CardHeader,
    Stack,
    TextField,
    Button,
    Badge,
    Tooltip,
    Collapse,
    Paper, CardContent, Chip, CardActions, List, ListItemText, ListItemIcon, ListItemAvatar
} from '@mui/material';
import {
    Edit,
    Delete,
    AccessTime,
    ExpandMore,
    Comment as CommentIcon,
    Bookmark,
    BookmarkBorder, ExpandLess, MoreHoriz
} from '@mui/icons-material';
import { Duration } from 'luxon';
import { Grow } from '@mui/material';
import { Popper } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAuth } from "../../context/AuthContext";
import axios from 'axios';
import ConfirmationDialog from './ConfirmationDialog';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import * as PropTypes from "prop-types";
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { IngredientButton, IngredientDialog } from './IngredientDialog';

const formatPreparationTime = (isoDuration) => {
    if (!isoDuration) return 'Не указано';
    const duration = Duration.fromISO(isoDuration);
    const hours = duration.hours;
    const minutes = duration.minutes;

    let parts = [];
    if (hours) parts.push(`${hours} ч`);
    if (minutes) parts.push(`${minutes} мин`);

    return parts.length > 0 ? parts.join(' ') : '0 мин';
};

const getRandomColor = (id) => {
    const colors = [
        '#f44336', '#e91e63', '#9c27b0', '#673ab7',
        '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
        '#4caf50', '#8bc34a', '#ff9800', '#ff5722',
    ];
    return colors[id % colors.length];
};

function RestaurantIcon(props) {
    return null;
}

RestaurantIcon.propTypes = {color: PropTypes.string};


function EditIcon(props) {
    return null;
}

EditIcon.propTypes = {fontSize: PropTypes.string};

function DeleteIcon(props) {
    return null;
}

DeleteIcon.propTypes = {fontSize: PropTypes.string};
const RecipeItem = ({ recipe, onEdit, onDelete,  initialComments = [], loadComments }) => {
    const { userId, isAdmin } = useAuth();
    const canEdit = isAdmin || recipe.isOwned;
    const [commentAuthors, setCommentAuthors] = useState({});
    const [newComment, setNewComment] = useState('');
    const [editingComment, setEditingComment] = useState(null);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState(null);
    const [localComments, setLocalComments] = useState(
        initialComments.filter(c => c.recipeId === recipe.id)
    );
    const [isSaved, setIsSaved] = useState(false);
    const [savedCount, setSavedCount] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [ingredientsExpanded, setIngredientsExpanded] = useState(false);
    const [ingredientsDialogOpen, setIngredientsDialogOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const RestaurantIcon = ({ color }) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={color || 'currentColor'}>
            <path d="M12 6.5c1.38 0 2.5-1.12 2.5-2.5S13.38 1.5 12 1.5 9.5 2.62 9.5 4 10.62 6.5 12 6.5zm0-4c.83 0 1.5.67 1.5 1.5S12.83 5.5 12 5.5 10.5 4.83 10.5 4 11.17 2.5 12 2.5zm0 5.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5zm0 4c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm7-5.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5zm0 4c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM7 13c-1.38 0-2.5 1.12-2.5 2.5S5.62 18 7 18s2.5-1.12 2.5-2.5S8.38 13 7 13zm0 4c-.83 0-1.5-.67-1.5-1.5S6.17 14 7 14s1.5.67 1.5 1.5S7.83 17 7 17zm11-4c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5zm0 4c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
        </svg>
    );
    useEffect(() => {
        setLocalComments(initialComments.filter(c => c.recipeId === recipe.id));
    }, [initialComments, recipe.id]);

    const calculateTotalNutrition = (ingredients) => {
        let totalProteins = 0;
        let totalFats = 0;
        let totalCarbs = 0;

        ingredients.forEach(ri => {
            const grams = ri.quantityInGrams || 0;
            const proteins = (ri.ingredient?.proteins || 0) * grams / 100;
            const fats = (ri.ingredient?.fats || 0) * grams / 100;
            const carbs = (ri.ingredient?.carbohydrates || 0) * grams / 100;
            totalProteins += proteins;
            totalFats += fats;
            totalCarbs += carbs;
        });

        const calories = (totalProteins * 4) + (totalFats * 9) + (totalCarbs * 4);

        return {
            proteins: totalProteins.toFixed(1),
            fats: totalFats.toFixed(1),
            carbohydrates: totalCarbs.toFixed(1),
            calories: calories.toFixed(0)
        };
    };

    const loadCommentAuthors = useCallback(async () => {
        const uniqueUserIds = [...new Set(localComments.map(comment => comment.userId))];

        const authors = {};

        await Promise.all(uniqueUserIds.map(async userId => {
            try {
                const response = await axios.get(`http://localhost:8080/api/users/${userId}`);
                authors[userId] = response.data;
            } catch (error) {
                console.error(`Error loading user ${userId}:`, error);
                authors[userId] = { id: userId, username: `User #${userId}` };
            }
        }));

        setCommentAuthors(authors);
    }, [localComments]);

    useEffect(() => {
        if (localComments.length > 0) {
            loadCommentAuthors();
        }
    }, [localComments, loadCommentAuthors]);

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        setIsLoadingComments(true);

        try {
            // Оптимистичное обновление
            const tempId = Date.now(); // Временный ID для нового комментария
            const newCommentObj = {
                id: tempId,
                text: newComment,
                userId: userId,
                recipeId: recipe.id,
                createdAt: new Date().toISOString()
            };

            setLocalComments(prev => [...prev, newCommentObj]);
            setNewComment('');

            // Отправка на сервер
            const response = await axios.post('http://localhost:8080/api/comments', {
                text: newComment,
                userId: userId,
                recipeId: recipe.id
            });

            // Заменяем временный комментарий на реальный с сервера
            setLocalComments(prev => [
                ...prev.filter(c => c.id !== tempId),
                response.data
            ]);

            // Фоновая синхронизация
            await loadComments();
        } catch (error) {
            console.error('Error adding comment:', error);
            // Откатываем изменения при ошибке
            setLocalComments(initialComments.filter(c => c.recipeId === recipe.id));
        } finally {
            setIsLoadingComments(false);
        }
    };

    const handleEditComment = (comment) => {
        setEditingComment(comment);
        setNewComment(comment.text);
    };

    const handleUpdateComment = async () => {
        if (!newComment.trim()) return;
        setIsLoadingComments(true);

        try {
            // Оптимистичное обновление
            setLocalComments(prev => prev.map(c =>
                c.id === editingComment.id ? { ...c, text: newComment } : c
            ));

            setEditingComment(null);
            setNewComment('');

            // Отправка на сервер
            await axios.put(`http://localhost:8080/api/comments/${editingComment.id}`, {
                text: newComment,
                userId: editingComment.userId,
                recipeId: editingComment.recipeId
            });

            // Фоновая синхронизация
            await loadComments();
        } catch (error) {
            console.error('Error updating comment:', error);
            setLocalComments(initialComments.filter(c => c.recipeId === recipe.id));
        } finally {
            setIsLoadingComments(false);
        }
    };

    const handleDeleteClick = (comment) => {
        setCommentToDelete(comment);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        setIsLoadingComments(true);
        try {
            // Оптимистичное обновление
            setLocalComments(prev => prev.filter(c => c.id !== commentToDelete.id));

            // Отправка на сервер
            await axios.delete(`http://localhost:8080/api/comments/${commentToDelete.id}`);

            // Фоновая синхронизация
            await loadComments();
        } catch (error) {
            console.error('Error deleting comment:', error);
            setLocalComments(initialComments.filter(c => c.recipeId === recipe.id));
        } finally {
            setIsLoadingComments(false);
            setDeleteDialogOpen(false);
            setCommentToDelete(null);
        }
    };

    const handleCancelEdit = () => {
        setEditingComment(null);
        setNewComment('');
    };

    useEffect(() => {
        if (userId && recipe.users) {
            setIsSaved(recipe.users.some(user => user.id === userId));
            setSavedCount(recipe.users.length);
        }
    }, [userId, recipe.users]);

    const handleSaveRecipe = async () => {
        if (!userId || isSaving) return;
        setIsSaving(true);

        try {
            if (isSaved) {
                await axios.delete(`http://localhost:8080/api/recipes/${recipe.id}/users/${userId}`);
                setSavedCount(prev => prev - 1);
            } else {
                await axios.post(`http://localhost:8080/api/recipes/${recipe.id}/users/${userId}`);
                setSavedCount(prev => prev + 1);
            }
            setIsSaved(!isSaved);
        } catch (error) {
            console.error('Error toggling save:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const totalNutrition = calculateTotalNutrition(recipe.recipeIngredients || []);

    const toggleComments = () => {
        setCommentsOpen(!commentsOpen);
    };


    return (
        <Card
            sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                boxShadow: '0 6px 15px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                height: '100%',
                overflow: 'visible',
                position: 'relative',
                background: 'linear-gradient(to bottom, #fffdf9 0%, #f5ebdd 100%)', // мягкий бежевый
                borderBottom: '6px solid #002d1d', // глубокий BRG
                '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 25px rgba(0,0,0,0.2)',
                },
            }}
            onMouseLeave={() => {
                if (!commentsOpen) return;
                const isHoveringComments = document.querySelector('.comments-container:hover');
                if (!isHoveringComments) {
                    setCommentsOpen(false);
                }
            }}
        >
            {/* Декоративный верхний элемент */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: 5,
                    background: 'linear-gradient(to right, #C89F9C, #fad0c4)', // розовато-коричневый градиент
                    borderTopLeftRadius: '12px',
                    borderTopRightRadius: '12px',
                }}
            />

            <CardContent
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    pt: 3,
                    pb: 2,
                }}
            >
                {/* Заголовок с элегантным градиентом */}
                <Typography
                    variant="h5"
                    fontWeight={600}
                    sx={{
                        background: 'linear-gradient(to right, #003d2d, #005c3c)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 1.5,
                        lineHeight: 1.3,
                    }}
                >
                    {recipe.name}
                </Typography>

                {/* Контейнер для иконок или информации */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2,
                        gap: 2,
                    }}
                >
                    {/* Кнопка ингредиентов */}
                    <IngredientButton
                        onClick={() => setIngredientsDialogOpen(true)}
                        count={recipe.recipeIngredients?.length || 0}
                    />

                    {/* Время приготовления */}
                    <Chip
                        icon={<AccessTime fontSize="small" />}
                        label={formatPreparationTime(recipe.preparationTime)}
                        size="small"
                        sx={{
                            bgcolor: 'transparent',
                            border: '1px solid',
                            borderColor: 'divider',
                            color: 'text.secondary'
                        }}
                    />
                </Box>

                <IngredientDialog
                    open={ingredientsDialogOpen}
                    onClose={() => setIngredientsDialogOpen(false)}
                    ingredients={recipe.recipeIngredients}
                />

                <Paper elevation={0} sx={{
                    p: 2,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    mb: 2
                }}>
                    <Box display="flex" justifyContent="space-between">
                        <Box textAlign="center">
                            <Typography variant="h6" color="primary">{totalNutrition.calories}</Typography>
                            <Typography variant="caption">ккал</Typography>
                        </Box>
                        <Box textAlign="center">
                            <Typography variant="h6" color="#673923">{totalNutrition.proteins}g</Typography>
                            <Typography variant="caption">белки</Typography>
                        </Box>
                        <Box textAlign="center">
                            <Typography variant="h6" color="error">{totalNutrition.fats}g</Typography>
                            <Typography variant="caption">жиры</Typography>
                        </Box>
                        <Box textAlign="center">
                            <Typography variant="h6" color="success.main">{totalNutrition.carbohydrates}g</Typography>
                            <Typography variant="caption">углеводы</Typography>
                        </Box>
                    </Box>
                </Paper>
            </CardContent>

            {/* Кнопки действий */}
            <CardActions sx={{
                bgcolor: 'background.default',
                borderTop: '1px solid',
                borderColor: 'divider',
                py: 1,
                px: 2
            }}>
                <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Комментарии">
                        <IconButton
                            size="small"
                            onClick={() => setCommentsOpen(!commentsOpen)}
                            color={commentsOpen ? "primary" : "default"}
                        >
                            <Badge badgeContent={localComments.length} color="primary" max={99}>
                                <CommentIcon fontSize="small" />
                            </Badge>
                        </IconButton>
                    </Tooltip>

                    {(userId || isAdmin) && (
                        <Tooltip title={isSaved ? "Удалить из сохраненных" : "Сохранить рецепт"}>
                            <IconButton
                                size="small"
                                onClick={handleSaveRecipe}
                                color={isSaved ? "primary" : "default"}
                                disabled={isSaving}
                            >
                                <Badge badgeContent={savedCount} color="primary" max={99}>
                                    {isSaved ? <Bookmark fontSize="small" /> : <BookmarkBorder fontSize="small" />}
                                </Badge>
                            </IconButton>
                        </Tooltip>
                    )}
                </Stack>

                {canEdit && (
                    <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Редактировать">
                            <IconButton
                                size="small"
                                onClick={() => onEdit(recipe)}
                                color="primary"
                            >
                                <Edit fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Удалить">
                            <IconButton
                                size="small"
                                onClick={() => onDelete(recipe)}
                                color="error"
                            >
                                <Delete fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                )}
            </CardActions>

            {/* Блок комментариев */}
            {commentsOpen && (
                <Box
                    sx={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        height: '100%',
                        width: '400px',
                        zIndex: 1,
                        bgcolor: 'background.paper',
                        boxShadow: '-5px 0 15px rgba(0,0,0,0.1)',
                        borderLeft: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: '0 12px 12px 0',
                        overflow: 'hidden',
                        animation: 'slideIn 0.3s ease-out',
                        '@keyframes slideIn': {
                            from: { transform: 'translateX(100%)' },
                            to: { transform: 'translateX(0)' }
                        }
                    }}
                >
                {/* Заголовок */}
                <Box sx={{
                    p: 1.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    bgcolor: 'background.default'
                }}>
                    <Typography variant="subtitle1" fontWeight={600} fontSize="0.9rem">
                        Комментарии ({localComments.length})
                    </Typography>
                    <IconButton size="small" onClick={() => setCommentsOpen(false)} sx={{ p: 0.5 }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>

                {/* Список комментариев */}
                    <Box sx={{
                        flex: 1,
                        overflowY: 'auto',
                        overflowX: 'hidden', // Запрещаем горизонтальную прокрутку
                        p: 1.5,
                        '&::-webkit-scrollbar': {
                            width: '4px',
                            height: '4px' // Убираем горизонтальный скроллбар
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'text.secondary',
                            borderRadius: '2px'
                        }
                    }}>
                    {localComments.length > 0 ? (
                        <List disablePadding>
                            {localComments.map((comment) => (
                                <ListItem
                                    key={comment.id}
                                    disablePadding
                                    sx={{
                                        alignItems: 'flex-start',
                                        mb: 1.5,
                                        pb: 1.5,
                                        borderBottom: '1px solid',
                                        borderColor: 'divider',
                                        position: 'relative',
                                        wordBreak: 'break-word',
                                        '&:last-child': { borderBottom: 'none' }
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar sx={{
                                            bgcolor: getRandomColor(comment.userId),
                                            width: 28,
                                            height: 28,
                                            mr: 1,
                                            fontSize: '0.8rem'
                                        }}>
                                            {commentAuthors[comment.userId]?.username?.charAt(0).toUpperCase() || 'U'}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <Box sx={{ flex: 1, pr: 3, overflow: 'hidden' }}>
                                            <Typography variant="subtitle2" fontWeight={600} fontSize="0.85rem">
                                                {commentAuthors[comment.userId]?.username || `User #${comment.userId}`}
                                            </Typography>
                                        <Typography variant="body2" fontSize="0.8rem" sx={{ mt: 0.5,  whiteSpace: 'pre-wrap' }}>
                                            {comment.text}
                                        </Typography>
                                    </Box>
                                    {/* Кнопки действий в правом верхнем углу */}
                                    {(userId === comment.userId || isAdmin) && (
                                        <Box sx={{
                                            position: 'absolute',
                                            top: 0,
                                            right: 0,
                                            display: 'flex',
                                            gap: 0.5
                                        }}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleEditComment(comment)}
                                                sx={{
                                                    p: 0.5,
                                                    color: 'text.secondary',
                                                    '&:hover': { color: 'primary.main' }
                                                }}
                                            >
                                                <Edit fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDeleteClick(comment)}
                                                sx={{
                                                    p: 0.5,
                                                    color: 'text.secondary',
                                                    '&:hover': { color: 'error.main' }
                                                }}
                                            >
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    )}
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 2 }}>
                            <CommentIcon sx={{ fontSize: 32, color: 'text.disabled', mb: 1 }} />
                            <Typography variant="body2" fontSize="0.8rem" color="text.secondary">
                                Пока нет комментариев
                            </Typography>
                        </Box>
                    )}
                </Box>
                    {/* Форма комментария */}
                {userId && (
                    <Box sx={{
                        p: 1,
                        borderTop: '0.5px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.default'
                    }}>
                        <TextField
                            fullWidth
                            multiline
                            rows={2}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Напишите комментарий..."
                            variant="outlined"
                            size="small"
                            sx={{
                                mb: 1,
                                '& .MuiOutlinedInput-root': {
                                    fontSize: '0.85rem', // Меньший размер текста
                                    padding: '8px'
                                }
                            }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                            {editingComment ? (
                                <>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={handleCancelEdit}
                                        sx={{ fontSize: '0.7rem', px: 1, py: 0.5 }}
                                    >
                                        Отмена
                                    </Button>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={handleUpdateComment}
                                        disabled={!newComment.trim()}
                                        sx={{ fontSize: '0.7rem', px: 1, py: 0.5 }}
                                    >
                                        Сохранить
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={handleAddComment}
                                    disabled={!newComment.trim()}
                                    startIcon={<SendIcon fontSize="small" />}
                                    sx={{ fontSize: '0.7rem', px: 1, py: 0.5 }}
                                >
                                    Отправить
                                </Button>
                            )}
                        </Box>
                    </Box>
                )}
                </Box>
            )}
            {/* Диалог подтверждения удаления */}
            <ConfirmationDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Подтверждение удаления"
                message="Вы уверены, что хотите удалить этот комментарий?"
            />
        </Card>
    );
};

export default RecipeItem;
