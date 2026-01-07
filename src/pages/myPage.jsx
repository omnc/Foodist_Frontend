import React, { useEffect } from 'react';
import { useAuth } from '../contexts/authContext';
import { useRecipe } from '../contexts/recipeContext';
import { Navigate, useNavigate } from 'react-router-dom';
import Header from '../components/header';

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
            <div className="myRecipes" style={{ padding: '120px 40px 40px' }}>
                <h1>My Recipes</h1>
                {isLoading ? (
                    <p>Loading recipes...</p>
                ) : myRecipes.length === 0 ? (
                    <p>You haven't created any recipes yet.</p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {myRecipes.map(recipe => (
                            <li 
                                key={recipe.id} 
                                onClick={() => navigate(`/recipe/${recipe.id}`)}
                                style={{ 
                                    padding: '16px', 
                                    marginBottom: '12px', 
                                    background: '#fff', 
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    cursor: 'pointer'
                                }}
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