import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './authContext';
const RecipeContext = createContext();

export const useRecipe = () => {
    const context = useContext(RecipeContext);
    if (!context) {
        throw new Error('useRecipe must be used within a RecipeProvider');
    }
    return context;
};

export const RecipeProvider = ({ children }) => {
    const [recipes, setRecipes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const { user, isAuthenticated } = useAuth();
    const getAllRecipes = async () => {
        try {
            const response = await fetch('https://foodist_backend.omnc2019.workers.dev/recipes');
            if (!response.ok) {
                throw new Error('Failed to fetch recipes');
            }
            const data = await response.json();
            setRecipes(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    }
    const getRecipeById = async (id) => {
        try {
            const response = await fetch(`https://foodist_backend.omnc2019.workers.dev/recipes/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch recipe');
            }
            const data = await response.json();
            setRecipe(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    }
    const createRecipe = async (recipeData) => {
        if (!isAuthenticated) {
            return { success: false, error: 'Unauthorized', statuscode: 401 };
        }
        try {
            setIsLoading(true);
            const response = await fetch('https://foodist-backend.onrender.com/recipe/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(recipeData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                return { success: false, error: data.message || 'Failed to create recipe', statuscode: response.status };
            }
            
            setRecipes([...recipes, data]);
            setError(null);
            return { success: true, data };
        } catch (error) {
            setError(error.message);
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    }
    const updateRecipe = async (id, recipe) => {
        try {
            const response = await fetch(`https://foodist_backend.omnc2019.workers.dev/recipes/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(recipe)
            });
            if (!response.ok) {
                throw new Error('Failed to update recipe');
            }
            const data = await response.json();
            setRecipe(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    }
    const deleteRecipe = async (id) => {
        try {
            const response = await fetch(`https://foodist_backend.omnc2019.workers.dev/recipes/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to delete recipe');
            }
            const data = await response.json();
            setRecipes(recipes.filter(recipe => recipe.id !== id));
        }
        catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    }
    
    const value = {
        recipes,
        isLoading,
        error,
        getAllRecipes,
        getRecipeById,
        createRecipe,
        updateRecipe,
        deleteRecipe
    };
    
    return (
        <RecipeContext.Provider value={value}>
            {children}
        </RecipeContext.Provider>
    );
};
    
   
