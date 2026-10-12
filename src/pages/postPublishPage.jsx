import React, { useEffect, useState } from 'react';
import { useRecipe } from '../contexts/recipeContext';
import { useAuth } from '../contexts/authContext';
import { API_URL } from '../config/api';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/header';
import '../design/postPublishPage.css';

function PostPublishPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentRecipe, getRecipeById, isLoading, error, recipes, getAllRecipes } = useRecipe();
    const [checkedIngredients, setCheckedIngredients] = useState({});
    const [comment, setComment] = useState('');
    const [commentRating, setCommentRating] = useState(5);
    const [commentError, setCommentError] = useState('');
    const [commentSubmitting, setCommentSubmitting] = useState(false);
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        if (id) {
            getRecipeById(id);
        }
        getAllRecipes();
    }, [id]);

    const toggleIngredient = (index) => {
        setCheckedIngredients(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const handleCommentSubmit = async () => {
        if (!comment.trim()) return;
        if (!isAuthenticated) {
            setCommentError('Please log in to comment');
            return;
        }
        setCommentError('');
        setCommentSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/recipes/${id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({ body: comment.trim(), rating: commentRating }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                setCommentError(data.error || 'Failed to post comment');
                return;
            }
            setComment('');
            await getRecipeById(id);
        } catch (err) {
            setCommentError(err.message || 'Failed to post comment');
        } finally {
            setCommentSubmitting(false);
        }
    };

    const getLevelText = (level) => {
        const levels = ['Easy', 'Medium', 'Hard', 'Expert', 'Master'];
        return levels[level - 1] || 'Easy';
    };

    const getMealTypeDisplay = (mealType) => {
        if (!mealType) return 'Meal';
        return mealType.charAt(0) + mealType.slice(1).toLowerCase();
    };

    const renderStars = (rating) => {
        if (rating === null || rating === undefined || Number.isNaN(Number(rating))) {
            return <span className="rating-empty">No ratings yet</span>;
        }
        const numeric = Number(rating);
        const stars = [];
        const fullStars = Math.floor(numeric);
        const hasHalf = numeric % 1 >= 0.5;
        
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<span key={i} className="star filled">★</span>);
            } else if (i === fullStars && hasHalf) {
                stars.push(<span key={i} className="star half">★</span>);
            } else {
                stars.push(<span key={i} className="star empty">☆</span>);
            }
        }
        return stars;
    };

    if (isLoading) {
        return (
            <div className="publish-page">
                <Header />
                <div className="publish-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading recipe...</p>
                </div>
            </div>
        );
    }

    if (error || !currentRecipe) {
        return (
            <div className="publish-page">
                <Header />
                <div className="publish-error">
                    <h2>Recipe not found</h2>
                    <p>{error || 'The recipe you are looking for does not exist.'}</p>
                    <button onClick={() => navigate('/')} className="back-btn">
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    const totalTime = (parseInt(currentRecipe.prepTime) || 0) + (parseInt(currentRecipe.cookTime) || 0);
    const trendingRecipes = recipes.filter(r => r.id !== currentRecipe.id).slice(0, 2);

    return (
        <div className="publish-page">
            <Header />
            
            {/* Navigation Menu */}
            <nav className="publish-nav">
                <ul className="nav-menu">
                    <li><Link to="/">Meals</Link></li>
                    <li><Link to="/">Ingredients</Link></li>
                    <li><Link to="/">Cuisines</Link></li>
                    <li><Link to="/">Desserts</Link></li>
                    <li><Link to="/">Cooking Tips</Link></li>
                    <li><Link to="/">About us</Link></li>
                </ul>
            </nav>

            <div className="publish-container">
                <main className="publish-main">
                    {/* Breadcrumb */}
                    <div className="breadcrumb">
                        <Link to="/">Home</Link>
                        <span className="separator">›</span>
                        <Link to="/">{getMealTypeDisplay(currentRecipe.mealtype)}</Link>
                        <span className="separator">›</span>
                        <span className="current">{currentRecipe.title}</span>
                    </div>

                    {/* Recipe Header */}
                    <div className="recipe-header">
                        <h1 className="recipe-title">{currentRecipe.title}</h1>
                        <div className="recipe-meta">
                            <div className="rating">
                                {renderStars(currentRecipe.averageRating)}
                                {currentRecipe.averageRating != null && (
                                    <span className="rating-value">{currentRecipe.averageRating}</span>
                                )}
                                {currentRecipe.totalComments != null && (
                                    <span className="rating-count">({currentRecipe.totalComments})</span>
                                )}
                            </div>
                            <span className="meta-separator">•</span>
                            <span className="author">
                                by {currentRecipe.authorName || currentRecipe.user?.username || currentRecipe.user?.email || 'Unknown author'}
                            </span>
                            <span className="meta-separator">•</span>
                            <span className="date">{new Date(currentRecipe.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <p className="recipe-description">{currentRecipe.description}</p>
                        
                        {/* Action Buttons — share/print not implemented yet */}
                        <div className="action-buttons">
                            <button type="button" className="action-btn" disabled title="Share is not available yet">
                                <span className="action-icon">↗</span> Share (unavailable)
                            </button>
                            <button type="button" className="action-btn" disabled title="Print is not available yet">
                                <span className="action-icon">🖨</span> Print (unavailable)
                            </button>
                            <button type="button" className="action-btn save-btn" disabled title="Wire save flow in a follow-up">
                                <span className="action-icon">♡</span> Save (coming soon)
                            </button>
                        </div>
                    </div>

                    {/* Title Image — accept both contract aliases */}
                    {(currentRecipe.titleImageUrl || currentRecipe.titleImage) && (
                        <div className="title-image-container">
                            <img 
                                src={currentRecipe.titleImageUrl || currentRecipe.titleImage} 
                                alt={currentRecipe.title}
                                className="title-image"
                            />
                        </div>
                    )}

                    {/* Recipe Info Cards */}
                    <div className="recipe-info-cards">
                        <div className="info-card">
                            <span className="info-label">Servings</span>
                            <span className="info-value">{currentRecipe.servingSize || 1}</span>
                        </div>
                        <div className="info-card">
                            <span className="info-label">Level</span>
                            <span className="info-value">{getLevelText(currentRecipe.level)}</span>
                        </div>
                        <div className="info-card">
                            <span className="info-label">Prep time</span>
                            <span className="info-value">{currentRecipe.prepTime || 0} min</span>
                        </div>
                        <div className="info-card">
                            <span className="info-label">Cook time</span>
                            <span className="info-value">{currentRecipe.cookTime || 0} min</span>
                        </div>
                        <div className="info-card highlight">
                            <span className="info-label">Total time</span>
                            <span className="info-value">{totalTime} min</span>
                        </div>
                    </div>

                    {/* Ingredients Section */}
                    <section className="recipe-section">
                        <h2>Ingredients</h2>
                        {currentRecipe.ingredients && currentRecipe.ingredients.length > 0 ? (
                            <div className="ingredients-list">
                                {currentRecipe.ingredients.map((ingredient, index) => (
                                    <div 
                                        key={index} 
                                        className={`ingredient-row ${checkedIngredients[index] ? 'checked' : ''}`}
                                        onClick={() => toggleIngredient(index)}
                                    >
                                        <input 
                                            type="checkbox" 
                                            checked={checkedIngredients[index] || false}
                                            onChange={() => toggleIngredient(index)}
                                            className="ingredient-checkbox"
                                        />
                                        <span className="ingredient-text">
                                            {[ingredient.amount || ingredient.measurement, ingredient.unit, ingredient.name || ingredient.value]
                                                .filter(Boolean)
                                                .join(' ')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="no-content">No ingredients listed</p>
                        )}
                    </section>

                    {/* Directions Section */}
                    <section className="recipe-section">
                        <h2>Directions</h2>
                        {currentRecipe.descriptionBlocks && currentRecipe.descriptionBlocks.length > 0 ? (
                            <div className="directions-list">
                                {currentRecipe.descriptionBlocks.map((block, index) => (
                                    <div key={block.id || index} className="direction-step">
                                        <h3 className="step-title">Step {block.step || index + 1}</h3>
                                        <p className="step-content">{block.content || block.description}</p>
                                        {block.imageUrl && (
                                            <div className="step-image-container">
                                                <img 
                                                    src={block.imageUrl} 
                                                    alt={`Step ${block.step || index + 1}`}
                                                    className="step-image"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="no-content">No directions listed</p>
                        )}
                    </section>

                    {/* Note Section */}
                    {currentRecipe.note && (
                        <section className="recipe-section note-section">
                            <h2>Note</h2>
                            <p className="note-content">{currentRecipe.note}</p>
                        </section>
                    )}

                    {/* Comments Section — persisted via API */}
                    <section className="recipe-section comments-section">
                        <h2>
                            {(currentRecipe.comments?.length || 0) > 0
                                ? `${currentRecipe.comments.length} Comments`
                                : 'Comments'}
                        </h2>
                        
                        <div className="comment-form">
                            <div className="comment-avatar">
                                <span>{(user?.username || user?.email || '?').charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="comment-input-wrapper">
                                <span className="comment-label">{isAuthenticated ? (user?.email || 'You') : 'Guest'}</span>
                                {commentError && <p role="alert" className="comment-error">{commentError}</p>}
                                <textarea 
                                    className="comment-input"
                                    placeholder={isAuthenticated ? 'Leave a comment for this recipe' : 'Log in to leave a comment'}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    disabled={!isAuthenticated || commentSubmitting}
                                />
                                <div className="comment-actions">
                                    <div className="rating-input" aria-label="Rating">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                type="button"
                                                key={star}
                                                className="star-input"
                                                aria-label={`${star} stars`}
                                                onClick={() => setCommentRating(star)}
                                                disabled={!isAuthenticated || commentSubmitting}
                                            >
                                                {star <= commentRating ? '★' : '☆'}
                                            </button>
                                        ))}
                                    </div>
                                    <button 
                                        className="submit-comment-btn"
                                        onClick={handleCommentSubmit}
                                        disabled={!isAuthenticated || commentSubmitting}
                                    >
                                        {commentSubmitting ? 'Submitting…' : 'Submit'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {(currentRecipe.comments?.length || 0) > 0 && (
                            <div className="comments-list">
                                {currentRecipe.comments.map(c => {
                                    const author = c.user?.username || c.user?.email || 'User';
                                    return (
                                        <div key={c.id} className="comment-item">
                                            <div className="comment-avatar">
                                                <span>{author.charAt(0).toUpperCase()}</span>
                                            </div>
                                            <div className="comment-body">
                                                <div className="comment-header">
                                                    <span className="comment-author">{author}</span>
                                                    <span className="comment-date">
                                                        {new Date(c.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                    </span>
                                                </div>
                                                <p className="comment-text">{c.body}</p>
                                                <div className="comment-rating">
                                                    {renderStars(c.rating)}
                                                    <span className="rating-value">{c.rating}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </main>

                {/* Sidebar */}
                <aside className="publish-sidebar">
                    <h3 className="sidebar-title">What's trending</h3>
                    <div className="trending-recipes">
                        {trendingRecipes.length > 0 ? (
                            trendingRecipes.map(recipe => (
                                <div 
                                    key={recipe.id} 
                                    className="trending-card"
                                    onClick={() => navigate(`/recipe/${recipe.id}`)}
                                >
                                    <div className="trending-image-container">
                                        {recipe.titleImageUrl ? (
                                            <img 
                                                src={recipe.titleImageUrl} 
                                                alt={recipe.title}
                                                className="trending-image"
                                            />
                                        ) : (
                                            <div className="trending-placeholder">
                                                <span>🍽</span>
                                            </div>
                                        )}
                                        <button className="save-icon">♡</button>
                                    </div>
                                    <div className="trending-info">
                                        <span className="trending-category">{getMealTypeDisplay(recipe.mealtype)}</span>
                                        <h4 className="trending-title">{recipe.title}</h4>
                                        <div className="trending-rating">
                                            {renderStars(4.4)}
                                            <span className="rating-value">4.4</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <>
                                <div className="trending-card placeholder">
                                    <div className="trending-image-container">
                                        <div className="trending-placeholder">
                                            <span>🍽</span>
                                        </div>
                                        <button className="save-icon">♡</button>
                                    </div>
                                    <div className="trending-info">
                                        <span className="trending-category">Dinner</span>
                                        <h4 className="trending-title">Lorem Ipsum</h4>
                                        <div className="trending-rating">
                                            {renderStars(4.4)}
                                            <span className="rating-value">4.4</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="trending-card placeholder">
                                    <div className="trending-image-container">
                                        <div className="trending-placeholder">
                                            <span>🍰</span>
                                        </div>
                                        <button className="save-icon">♡</button>
                                    </div>
                                    <div className="trending-info">
                                        <span className="trending-category">Dessert</span>
                                        <h4 className="trending-title">Lorem Ipsum</h4>
                                        <div className="trending-rating">
                                            {renderStars(4.4)}
                                            <span className="rating-value">4.4</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </aside>
            </div>

            {/* Footer */}
            <footer className="publish-footer">
                <div className="footer-wave"></div>
                <div className="footer-content">
                    <div className="footer-left">
                        <div className="footer-logo">
                            <span className="logo-text">Foodist</span>
                        </div>
                        <div className="footer-social">
                            <span className="social-label">Follow us</span>
                            <div className="social-icons">
                                <a href="#" className="social-icon">
                                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                                </a>
                                <a href="#" className="social-icon">
                                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                                </a>
                                <a href="#" className="social-icon">
                                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="footer-right">
                        <div className="footer-links">
                            <a href="#">About us</a>
                            <a href="#">Privacy Policy</a>
                            <a href="#">Careers</a>
                            <a href="#">Contact</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default PostPublishPage;
