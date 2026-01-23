import React, { useEffect } from 'react';
import { useAuth } from '../contexts/authContext';
import { useRecipe } from '../contexts/recipeContext';
import { Navigate, useNavigate } from 'react-router-dom';
import Header from '../components/header';
import '../design/myPage.css';

function MyPage() {
    const { user, isAuthenticated } = useAuth();
    const { recipes, getAllRecipes, isLoading } = useRecipe();
    const navigate = useNavigate();
    
    // Fetch all recipes when component mounts
    useEffect(() => {
        getAllRecipes();
    }, []);
    
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    // Filter recipes that belong to the current user
    const myRecipes = recipes.filter(recipe => 
        recipe.authorId === user.id || recipe.authorEmail === user.email
    );

    return (
        <div>
            <Header />
            <div className="myRecipes">
                <h1>My Recipes</h1>
                {isLoading ? (
                    <p>Loading recipes...</p>
                ) : myRecipes.length === 0 ? (
                    <p>You haven't created any recipes yet.</p>
                ) : (
                    <ul className="recipe-list">
                        {myRecipes.map(recipe => (
                            <li 
                                key={recipe.id} 
                                className="recipe-item"
                                onClick={() => navigate(`/recipe/${recipe.id}`)}
                            >
                                {recipe.title}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default MyPage;