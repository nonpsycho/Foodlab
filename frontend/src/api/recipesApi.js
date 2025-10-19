import axios from 'axios';

const API_URL = 'http://localhost:8080/api/recipes'; 

export const fetchRecipes = async () => {
    try {
        const response = await axios.get(API_URL);
        const recipesWithIngredients = await Promise.all(
            response.data.map(async recipe => {
                try {
                    const ingredientsResponse = await axios.get(`${API_URL}/${recipe.id}/ingredients`);
                    return {
                        ...recipe,
                        recipeIngredients: ingredientsResponse.data || []
                    };
                } catch (error) {
                    console.error(`Error loading ingredients for recipe ${recipe.id}:`, error);
                    return {
                        ...recipe,
                        recipeIngredients: []
                    };
                }
            })
        );
        return { data: recipesWithIngredients };
    } catch (error) {
        console.error('Error fetching recipes:', error);
        throw error;
    }
};

export const deleteRecipe = (id) => axios.delete(`${API_URL}/${id}`);

export const createRecipe = async (recipe) => {
    try {
        return await axios.post(`${API_URL}`, recipe);
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Ошибка создания рецепта');
    }
};

export const updateRecipe = async (id, recipe) => {
    try {
        return await axios.put(`${API_URL}/${id}`, recipe);
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Ошибка обновления рецепта');
    }
};

export const deleteIngredient = async (recipeId, ingredientId) => {
    return axios.delete(`http://localhost:8080/api/recipes/${recipeId}/ingredients/${ingredientId}`);
};

export const fetchIngredients = async () => {
    const response = await axios.get('http://localhost:8080/api/ingredients');
    return response.data;
};

