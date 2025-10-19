import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Typography,
    Box,
    Grow
} from '@mui/material';

const IngredientButton = ({ onClick, count }) => (
    <Box
        onClick={onClick}
        sx={{
            display: 'inline-flex',
            alignItems: 'center',
            cursor: 'pointer',
            px: 1.5,
            py: 1,
            borderRadius: 2,
            backgroundColor: '#f6f2ed',
            border: '1px solid #c8bfb3',
            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.02)',
            transition: 'all 0.25s ease',
            '&:hover': {
                backgroundColor: '#ede5dd',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }
        }}
    >
        <Box
            sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                bgcolor: '#004225',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                mr: 1
            }}
        >
            {count || 0}
        </Box>
        <Typography variant="body2" sx={{ color: '#3e3e3e', fontWeight: 500 }}>
            Ингредиенты
        </Typography>
    </Box>
);

const IngredientDialog = ({ open, onClose, ingredients }) => (
    <Dialog
        open={open}
        onClose={onClose}
        PaperProps={{
            sx: {
                borderRadius: 3,
                width: '100%',
                maxWidth: '460px',
                background: 'linear-gradient(to bottom, #fffdf9, #f4ede6)',
                border: '1px solid #d7cfc3',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
            }
        }}
    >
        <DialogTitle
            sx={{
                py: 2,
                px: 3,
                borderBottom: '1px solid #d9cbbd',
                background: '#004225',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12
            }}
        >
            <Box
                sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: '#fae3d9',
                    color: '#004225',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.875rem'
                }}
            >
                {ingredients?.length || 0}
            </Box>
            <Typography variant="subtitle1" fontWeight={600}>
                Ингредиенты
            </Typography>
        </DialogTitle>

        <DialogContent dividers sx={{ py: 0, px: 0 }}>
            <Grow in={open} timeout={300}>
                <List sx={{ py: 0 }}>
                    {ingredients?.map((ri, idx) => (
                        <ListItem
                            key={idx}
                            sx={{
                                py: 1.5,
                                px: 3,
                                background: idx % 2 === 0 ? '#f9f6f1' : '#fffdf9',
                                borderBottom: '1px solid #e5dbcf',
                                '&:hover': { backgroundColor: '#f1ebe2' }
                            }}
                        >
                            <ListItemAvatar>
                                <Avatar
                                    sx={{
                                        bgcolor: '#c89f9c',
                                        color: '#fff',
                                        width: 32,
                                        height: 32,
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {idx + 1}
                                </Avatar>
                            </ListItemAvatar>

                            <ListItemText
                                primary={
                                    <Typography fontWeight={600} color="#3a3a3a">
                                        {ri.ingredient.name}
                                    </Typography>
                                }
                                secondary={
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography variant="body2" color="#5c5c5c">
                                            <Box component="span" sx={{ fontWeight: 500 }}>
                                                Количество:
                                            </Box>{' '}
                                            {ri.quantityInGrams} г
                                        </Typography>
                                        <Typography variant="body2" color="#5c5c5c">
                                            <Box component="span" sx={{ fontWeight: 500 }}>
                                                БЖУ:
                                            </Box>{' '}
                                            <span style={{ color: '#45322E' }}>{ri.ingredient.proteins}г</span> /{' '}
                                            <span style={{ color: '#45322E' }}>{ri.ingredient.fats}г</span> /{' '}
                                            <span style={{ color: '#45322E' }}>{ri.ingredient.carbohydrates}г</span>
                                        </Typography>
                                    </Box>
                                }
                                sx={{ my: 0 }}
                            />
                        </ListItem>
                    ))}
                </List>
            </Grow>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
                onClick={onClose}
                variant="contained"
                fullWidth
                size="large"
                sx={{
                    borderRadius: 2,
                    py: 1.2,
                    fontWeight: 600,
                    fontSize: '1rem',
                    backgroundColor: '#004225',
                    '&:hover': { backgroundColor: '#002d1d' }
                }}
            >
                Готово
            </Button>
        </DialogActions>
    </Dialog>
);

// Экспортируем оба компонента как именованные экспорты
export { IngredientButton, IngredientDialog };

// Или можно выбрать один компонент как default export
// export default IngredientDialog;