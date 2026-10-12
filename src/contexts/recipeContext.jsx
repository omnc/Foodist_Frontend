import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './authContext';
import { API_URL } from '../config/api';

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
    const [currentRecipe, setCurrentRecipe] = useState(null); // Added for single recipe
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user, isAuthenticated } = useAuth();

    // Helper to get auth headers
    const getAuthHeaders = () => {
        if (!user?.token) return {};
        return { 'Authorization': `Bearer ${user.token}` };
    };

    const getAllRecipes = async (params = {}) => {
        setIsLoading(true);
        setError(null);
        try {
            const query = new URLSearchParams();
            if (params.q) query.set('q', params.q);
            if (params.mealtype) query.set('mealtype', params.mealtype);
            if (params.limit) query.set('limit', String(params.limit));

            const path = params.q || params.mealtype
                ? `${API_URL}/recipes/search?${query.toString()}`
                : `${API_URL}/recipes${query.toString() ? `?${query}` : ''}`;

            const response = await fetch(path);
            if (!response.ok) {
                throw new Error('Failed to fetch recipes');
            }
            const data = await response.json();
            setRecipes(data);
            return { success: true, data };
        } catch (error) {
            setError(error.message);
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    const getRecipeById = async (id) => {
        setIsLoading(true); // Added
        setError(null);
        try {
            const response = await fetch(`${API_URL}/recipes/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch recipe');
            }
            const data = await response.json();
            setCurrentRecipe(data); // Fixed: was setRecipe
            return { success: true, data };
        } catch (error) {
            setError(error.message);
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    const createRecipe = async (formData) => {
        if (!isAuthenticated) {
            return { success: false, error: 'Unauthorized', statusCode: 401 };
        }
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_URL}/recipes`, {
                method: 'POST',
                headers: getAuthHeaders(),
                // Don't set Content-Type - browser handles it for FormData
                body: formData
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                // Backend returns { error: '...' } not { message: '...' }
                return { success: false, error: data.error || 'Failed to create recipe', statusCode: response.status };
            }
            
            setRecipes(prev => [...prev, data]);
            return { success: true, data };
        } catch (error) {
            setError(error.message);
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    const updateRecipe = async (id, formData) => {
        if (!isAuthenticated) {
            return { success: false, error: 'Unauthorized', statusCode: 401 };
        }
        setIsLoading(true); // Added
        setError(null);
        try {
            const response = await fetch(`${API_URL}/recipes/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(), // Added auth
                body: formData // Changed to formData (backend expects FormData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                return { success: false, error: data.error || 'Failed to update recipe', statusCode: response.status };
            }
            
            setCurrentRecipe(data); // Fixed
            setRecipes(prev => prev.map(r => r.id === id ? data : r));
            return { success: true, data };
        } catch (error) {
            setError(error.message);
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    const deleteRecipe = async (id) => {
        if (!isAuthenticated) {
            return { success: false, error: 'Unauthorized', statusCode: 401 };
        }
        setIsLoading(true); // Added
        setError(null);
        try {
            const response = await fetch(`${API_URL}/recipes/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders() // Fixed: was using separate token
            });
            
            if (!response.ok) {
                const data = await response.json();
                return { success: false, error: data.error || 'Failed to delete recipe', statusCode: response.status };
            }
            
            setRecipes(prev => prev.filter(recipe => recipe.id !== id));
            return { success: true };
        } catch (error) {
            setError(error.message);
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    const checkRecipeSaved = async (recipeId) => {
        if (!isAuthenticated) {
            return { success: true, isSaved: false };
        }
        try {
            const response = await fetch(`${API_URL}/saved-recipes/check/${recipeId}`, {
                headers: getAuthHeaders(),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                return { success: false, error: data.error || 'Failed to check saved state', isSaved: false };
            }
            return { success: true, isSaved: !!data.isSaved, savedRecipe: data.savedRecipe || null };
        } catch (error) {
            return { success: false, error: error.message, isSaved: false };
        }
    };

    const saveRecipe = async (recipeId, note = null) => {
        if (!isAuthenticated) {
            return { success: false, error: 'Unauthorized', statusCode: 401 };
        }
        try {
            const response = await fetch(`${API_URL}/saved-recipes/${recipeId}`, {
                method: 'POST',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ note }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                // Treat already-saved as success for duplicate-safe UX
                if (response.status === 400 && /already saved/i.test(data.error || '')) {
                    return { success: true, alreadySaved: true, data };
                }
                return { success: false, error: data.error || 'Failed to save recipe', statusCode: response.status };
            }
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const unsaveRecipe = async (recipeId) => {
        if (!isAuthenticated) {
            return { success: false, error: 'Unauthorized', statusCode: 401 };
        }
        try {
            const response = await fetch(`${API_URL}/saved-recipes/${recipeId}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                return { success: false, error: data.error || 'Failed to unsave recipe', statusCode: response.status };
            }
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };
    
    const value = {
        recipes,
        currentRecipe, // Added
        isLoading,
        error,
        getAllRecipes,
        getRecipeById,
        createRecipe,
        updateRecipe,
        deleteRecipe,
        checkRecipeSaved,
        saveRecipe,
        unsaveRecipe,
        setCurrentRecipe // Added for clearing
    };
    
    return (
        <RecipeContext.Provider value={value}>
            {children}
        </RecipeContext.Provider>
    );
};