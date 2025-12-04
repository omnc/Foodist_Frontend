import React from 'react';
import { useAuth } from '../contexts/authContext';
import { useRecipe } from '../contexts/recipeContext';
import { Navigate } from 'react-router-dom';
import Header from '../components/header';

function MyPage() {
    const {user, isAuthenticated} = useAuth();
    const {recipes} = useRecipe();
    
    if(!isAuthenticated) {
        return <Navigate to="/login" />;
    }
    const myRecipes = recipes.filter(recipe => recipe.userId === user.id);
    return (
        <div>
            <Header />
            <div className="myRecipes">
                <h1>My Recipes</h1>
                <ul>
                    {myRecipes.map(recipe => (
                        <li key={recipe.id}>{recipe.name}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default MyPage;