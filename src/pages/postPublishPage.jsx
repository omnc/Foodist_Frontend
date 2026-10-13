import React, { useEffect, useState } from 'react';
import { useRecipe } from '../contexts/recipeContext';
import { useAuth } from '../contexts/authContext';
import { apiFetch, authHeaders, describeApiError } from '../lib/apiClient';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/header';
import RatingSummary from '../components/ratingSummary';
import '../design/postPublishPage.css';

function PostPublishPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const {
        currentRecipe,
        getRecipeById,
        isLoading,
        error,
        recipes,
        getAllRecipes,
        checkRecipeSaved,
        saveRecipe,
        unsaveRecipe,
    } = useRecipe();
    const [checkedIngredients, setCheckedIngredients] = useState({});
    const [comment, setComment] = useState('');
    const [commentRating, setCommentRating] = useState(0);
    const [commentError, setCommentError] = useState('');
    const [commentSubmitting, setCommentSubmitting] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [shareMessage, setShareMessage] = useState('');
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        if (id) {
            getRecipeById(id);
        }
        getAllRecipes();
    }, [id]);

    useEffect(() => {
        let cancelled = false;
        const loadSavedState = async () => {
            if (!id || !isAuthenticated) {
                setIsSaved(false);
                return;
            }
            const result = await checkRecipeSaved(id);
            if (cancelled) return;
            if (result.success) {
                setIsSaved(!!result.isSaved);
            } else {
                setSaveError(result.error);
            }
        };
        loadSavedState();
        return () => {
            cancelled = true;
        };
    }, [id, isAuthenticated, user?.token]);

    const handleSaveToggle = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (saveLoading) return;
        setSaveError('');
        setSaveLoading(true);
        try {
            if (isSaved) {
                const result = await unsaveRecipe(id);
                if (!result.success) {
                    setSaveError(result.error || 'Failed to unsave');
                    return;
                }
                setIsSaved(false);
            } else {
                const result = await saveRecipe(id);
                if (!result.success) {
                    setSaveError(result.error || 'Failed to save');
                    return;
                }
                setIsSaved(true);
            }
        } finally {
            setSaveLoading(false);
        }
    };

    const handleShare = async () => {
        setShareMessage('');
        const shareUrl = window.location.href;
        const shareData = {
            title: currentRecipe?.title || 'Foodist recipe',
            text: currentRecipe?.description || 'Check out this recipe on Foodist',
            url: shareUrl,
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
                setShareMessage('Shared');
                return;
            }
            await navigator.clipboard.writeText(shareUrl);
            setShareMessage('Link copied to clipboard');
        } catch (err) {
            if (err?.name === 'AbortError') return;
            setShareMessage('Unable to share — copy the URL from the address bar');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const toggleIngredient = (index) => {
        setCheckedIngredients(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const handleCommentSubmit = async () => {
        if (!isAuthenticated) {
            setCommentError('Please log in to comment');
            return;
        }
        if (!commentRating) {
            setCommentError('Please choose a star rating');
            return;
        }
        setCommentError('');
        setCommentSubmitting(true);
        try {
            const response = await apiFetch(`/recipes/${id}/comments`, {
                method: 'POST',
                headers: authHeaders({ token: user?.token, json: true, mutating: true }),
                body: JSON.stringify({ body: comment.trim(), rating: commentRating }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                setCommentError(describeApiError(response, data, 'Failed to post comment'));
                return;
            }
            setComment('');
            setCommentRating(0);
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
    // Groups render in the order they were entered on the post page; older API responses only have a flat list.
    const ingredientGroups = currentRecipe.ingredientGroups?.length
        ? currentRecipe.ingredientGroups
        : currentRecipe.ingredients?.length
            ? [{ heading: null, items: currentRecipe.ingredients }]
            : [];
    const groupOffsets = ingredientGroups.reduce(
        (offsets, group, i) => [...offsets, offsets[i] + group.items.length],
        [0]
    );

    return (
        <div className="publish-page">
            <Header />
            
            {/* Navigation Menu */}
            <nav className="publish-nav" aria-label="Recipe sections">
                <ul className="nav-menu">
                    <li><Link to="/search?mealtype=BREAKFAST">Meals</Link></li>
                    <li><Link to="/search">Ingredients</Link></li>
                    <li><Link to="/search">Cuisines</Link></li>
                    <li><Link to="/search?mealtype=DESSERT">Desserts</Link></li>
                    <li><Link to="/search">Cooking Tips</Link></li>
                    <li><Link to="/aboutUs">About us</Link></li>
                </ul>
            </nav>

            <div className="publish-container">
                <main id="main-content" tabIndex={-1} className="publish-main">
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
                        <h1 className="recipe-title" data-testid="recipe-title">{currentRecipe.title}</h1>
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
                        
                        <div className="action-buttons">
                            <button
                                type="button"
                                className="action-btn"
                                onClick={handleShare}
                                data-testid="share-recipe-btn"
                            >
                                <span className="action-icon" aria-hidden="true">↗</span> Share
                            </button>
                            <button
                                type="button"
                                className="action-btn"
                                onClick={handlePrint}
                                data-testid="print-recipe-btn"
                            >
                                <span className="action-icon" aria-hidden="true">🖨</span> Print
                            </button>
                            <button
                                type="button"
                                className={`action-btn save-btn ${isSaved ? 'saved' : ''}`}
                                onClick={handleSaveToggle}
                                disabled={saveLoading}
                                data-testid="save-recipe-btn"
                                aria-pressed={isSaved}
                                title={isAuthenticated ? (isSaved ? 'Remove from saved recipes' : 'Save this recipe') : 'Log in to save'}
                            >
                                <span className="action-icon">{isSaved ? '♥' : '♡'}</span>
                                {saveLoading ? 'Saving…' : isSaved ? 'Saved' : 'Save'}
                            </button>
                        </div>
                        {saveError && (
                            <p role="alert" data-testid="save-error" style={{ color: 'crimson' }}>
                                {saveError}
                            </p>
                        )}
                        {shareMessage && (
                            <p role="status" data-testid="share-status" aria-live="polite">
                                {shareMessage}
                            </p>
                        )}
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
                        {ingredientGroups.length > 0 ? (
                            <div className="ingredients-list" data-testid="recipe-ingredients">
                                {ingredientGroups.map((group, groupIndex) => (
                                    <div key={groupIndex} className="ingredient-group-view" data-testid={`recipe-ingredient-group-${groupIndex}`}>
                                        {group.heading && <h3 className="ingredient-group-heading">{group.heading}</h3>}
                                        {group.items.map((ingredient, index) => {
                                            const key = `${groupIndex}-${index}`;
                                            const flatIndex = groupOffsets[groupIndex] + index;
                                            return (
                                                <div 
                                                    key={key} 
                                                    className={`ingredient-row ${checkedIngredients[key] ? 'checked' : ''}`}
                                                    onClick={() => toggleIngredient(key)}
                                                    data-testid={`recipe-ingredient-${flatIndex}`}
                                                >
                                                    <input 
                                                        type="checkbox" 
                                                        checked={checkedIngredients[key] || false}
                                                        onChange={() => toggleIngredient(key)}
                                                        className="ingredient-checkbox"
                                                    />
                                                    <span className="ingredient-text">
                                                        {[ingredient.amount || ingredient.measurement, ingredient.unit, ingredient.name || ingredient.value]
                                                            .filter(Boolean)
                                                            .join(' ')}
                                                    </span>
                                                </div>
                                            );
                                        })}
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
                            <div className="directions-list" data-testid="recipe-directions">
                                {currentRecipe.descriptionBlocks.map((block, index) => (
                                    <div key={block.id || index} className="direction-step" data-testid={`recipe-step-${index}`}>
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
                                    placeholder={isAuthenticated ? 'Leave a comment for this recipe (optional)' : 'Log in to leave a comment'}
                                    aria-label="Comment (optional)"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    disabled={!isAuthenticated || commentSubmitting}
                                />
                                <div className="comment-actions">
                                    <div className="rating-input" role="group" aria-label="Rating (required)" data-testid="comment-rating">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                type="button"
                                                key={star}
                                                className="star-input"
                                                aria-label={`${star} stars`}
                                                aria-pressed={star === commentRating}
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
                                        disabled={!isAuthenticated || commentSubmitting || !commentRating}
                                        title={commentRating ? undefined : 'Choose a star rating first'}
                                        data-testid="comment-submit"
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
                                                {c.body && <p className="comment-text">{c.body}</p>}
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
                                            <RatingSummary averageRating={recipe.averageRating} ratingCount={recipe.ratingCount} />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-content">No other recipes yet</p>
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
