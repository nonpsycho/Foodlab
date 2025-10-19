// RecipeDialog.jsx
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import RecipeForm from './RecipeForm';

const RecipeDialog = ({ open, onClose, selectedRecipe, onSuccess }) => {
    const formRef = React.useRef();

    const handleSubmit = () => {
        if (formRef.current) {
            formRef.current.submitForm();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>
                {selectedRecipe ? 'Редактирование рецепта' : 'Добавление нового рецепта'}
            </DialogTitle>
            <DialogContent>
                <RecipeForm
                    ref={formRef}
                    selectedRecipe={selectedRecipe}
                    onSuccess={() => {
                        onSuccess();
                        onClose();
                    }}
                    onCancel={onClose}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Закрыть</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                >
                    {selectedRecipe ? 'Обновить' : 'Добавить'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RecipeDialog;

