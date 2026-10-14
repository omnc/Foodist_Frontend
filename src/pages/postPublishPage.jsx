import React, { useEffect, useState } from 'react';
import { useRecipe } from '../contexts/recipeContext';
import { useAuth } from '../contexts/authContext';
import { apiFetch, authHeaders, describeApiError } from '../lib/apiClient';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageLayout from '../components/PageLayout/PageLayout';
import Button from '../components/Button/Button';
import Checkbox from '../components/Checkbox/Checkbox';
import Avatar from '../components/Avatar/Avatar';
import StarRating from '../components/StarRating/StarRating';
import RecipeCard, { mealTypeLabel } from '../components/RecipeCard/RecipeCard';
import { ShareIcon, PrintIcon, SaveHeartIcon, StarIcon } from '../components/Icon/Icon';
import styles from './postPublishPage.module.css';

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

    const formatDate = (value) =>
        new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const getLevelText = (level) => {
        const levels = ['Easy', 'Medium', 'Hard', 'Expert', 'Master'];
        return levels[level - 1] || 'Easy';
    };

    if (isLoading) {
        return (
            <PageLayout mainClassName={styles.main}>
                <p className={styles.status} role="status">Loading recipe...</p>
            </PageLayout>
        );
    }

    if (error || !currentRecipe) {
        return (
            <PageLayout mainClassName={styles.main}>
                <div className={styles.status}>
                    <h1 className={styles.statusTitle}>Recipe not found</h1>
                    <p>{error || 'The recipe you are looking for does not exist.'}</p>
                    <Button onClick={() => navigate('/')}>Back to Home</Button>
                </div>
            </PageLayout>
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
    const comments = currentRecipe.comments || [];
    const hasRating = currentRecipe.averageRating !== null && currentRecipe.averageRating !== undefined
        && !Number.isNaN(Number(currentRecipe.averageRating));
    const authorName = currentRecipe.authorName || currentRecipe.user?.username || currentRecipe.user?.email || 'Unknown author';
    const titleImage = currentRecipe.titleImageUrl || currentRecipe.titleImage;
    const steps = currentRecipe.descriptionBlocks || [];
    const mealType = mealTypeLabel(currentRecipe.mealtype) || 'Meal';
    const commenterName = isAuthenticated ? (user?.username || user?.email || 'You') : 'Guest';

    return (
        <PageLayout mainClassName={styles.main}>
            <div className={styles.layout}>
                <div className={styles.content}>
                    <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
                        <Link to="/">Home</Link>
                        <span aria-hidden="true">&gt;</span>
                        <Link to={`/search?mealtype=${currentRecipe.mealtype || ''}`}>{mealType}</Link>
                        <span aria-hidden="true">&gt;</span>
                        <span aria-current="page">{currentRecipe.title}</span>
                    </nav>

                    <header className={styles.header}>
                        <h1 className={styles.title} data-testid="recipe-title">{currentRecipe.title}</h1>
                        <div className={styles.meta} data-testid="recipe-rating">
                            {hasRating ? (
                                <span
                                    className={styles.rating}
                                    role="img"
                                    aria-label={`Rated ${Number(currentRecipe.averageRating).toFixed(1)} out of 5${currentRecipe.totalComments ? ` from ${currentRecipe.totalComments} ratings` : ''}`}
                                >
                                    <StarRating value={currentRecipe.averageRating} size={27} className={styles.stars} />
                                    <span className={styles.ratingValue}>{Number(currentRecipe.averageRating).toFixed(1)}</span>
                                </span>
                            ) : (
                                <span className={styles.rating}>
                                    <StarRating value={0} size={27} className={styles.stars} />
                                    <span className={styles.noRatings}>No ratings yet</span>
                                </span>
                            )}
                            <span>By {authorName} | Published {formatDate(currentRecipe.createdAt)}</span>
                        </div>
                        {currentRecipe.description && <p className={styles.description}>{currentRecipe.description}</p>}

                        <div className={`${styles.actions} no-print`}>
                            <Button variant="outline" size="sm" className={styles.action} onClick={handleShare} data-testid="share-recipe-btn">
                                <ShareIcon size={22} /> Share
                            </Button>
                            <Button variant="outline" size="sm" className={styles.action} onClick={handlePrint} data-testid="print-recipe-btn">
                                <PrintIcon size={22} /> Print
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className={styles.action}
                                onClick={handleSaveToggle}
                                disabled={saveLoading}
                                data-testid="save-recipe-btn"
                                aria-pressed={isSaved}
                                title={isAuthenticated ? (isSaved ? 'Remove from saved recipes' : 'Save this recipe') : 'Log in to save'}
                            >
                                <SaveHeartIcon size={22} />
                                {saveLoading ? 'Saving…' : isSaved ? 'Saved' : 'Save'}
                            </Button>
                        </div>
                        {saveError && (
                            <p role="alert" data-testid="save-error" className={styles.error}>
                                {saveError}
                            </p>
                        )}
                        {shareMessage && (
                            <p role="status" data-testid="share-status" aria-live="polite" className={styles.shareStatus}>
                                {shareMessage}
                            </p>
                        )}
                    </header>

                    {titleImage && <img src={titleImage} alt={currentRecipe.title} className={styles.hero} />}

                    <dl className={styles.facts}>
                        <div className={styles.fact}>
                            <dt>Servings</dt>
                            <dd>{currentRecipe.servingSize || 1}</dd>
                        </div>
                        <div className={styles.fact}>
                            <dt>Level</dt>
                            <dd>{getLevelText(currentRecipe.level)}</dd>
                        </div>
                        <div className={styles.fact}>
                            <dt>Prep time</dt>
                            <dd>{currentRecipe.prepTime || 0} mins</dd>
                        </div>
                        <div className={styles.fact}>
                            <dt>Cook time</dt>
                            <dd>{currentRecipe.cookTime || 0} mins</dd>
                        </div>
                        <div className={styles.fact}>
                            <dt>Total time</dt>
                            <dd>{totalTime} mins</dd>
                        </div>
                    </dl>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Ingredients</h2>
                        {ingredientGroups.length > 0 ? (
                            <div className={styles.ingredients} data-testid="recipe-ingredients">
                                {ingredientGroups.map((group, groupIndex) => (
                                    <div key={groupIndex} className={styles.ingredientGroup} data-testid={`recipe-ingredient-group-${groupIndex}`}>
                                        {group.heading && (
                                            <h3 className={styles.groupHeading} data-testid="ingredient-group-heading">{group.heading}</h3>
                                        )}
                                        <ul className={styles.ingredientList}>
                                            {group.items.map((ingredient, index) => {
                                                const key = `${groupIndex}-${index}`;
                                                const flatIndex = groupOffsets[groupIndex] + index;
                                                return (
                                                    <li key={key} data-testid={`recipe-ingredient-${flatIndex}`}>
                                                        <Checkbox
                                                            className={styles.ingredient}
                                                            checked={checkedIngredients[key] || false}
                                                            onChange={() => toggleIngredient(key)}
                                                            label={[ingredient.amount || ingredient.measurement, ingredient.unit, ingredient.name || ingredient.value]
                                                                .filter(Boolean)
                                                                .join(' ')}
                                                        />
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className={styles.empty}>No ingredients listed</p>
                        )}
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>Directions</h2>
                        {steps.length > 0 ? (
                            <ol className={styles.steps} data-testid="recipe-directions">
                                {steps.map((block, index) => (
                                    <li key={block.id || index} className={styles.step} data-testid={`recipe-step-${index}`}>
                                        <h3 className={styles.stepTitle}>Step {block.step || index + 1}</h3>
                                        <p className={styles.stepText}>{block.content || block.description}</p>
                                        {block.imageUrl && (
                                            <img src={block.imageUrl} alt={`Step ${block.step || index + 1}`} className={styles.stepImage} />
                                        )}
                                    </li>
                                ))}
                            </ol>
                        ) : (
                            <p className={styles.empty}>No directions listed</p>
                        )}
                    </section>

                    {currentRecipe.note && (
                        <section className={`${styles.section} ${styles.note}`}>
                            <h2 className={styles.sectionTitle}>Note</h2>
                            <p className={styles.stepText}>{currentRecipe.note}</p>
                        </section>
                    )}

                    <section className={`${styles.section} ${styles.comments}`}>
                        <h2 className={styles.sectionTitle}>
                            {comments.length > 0 ? `${comments.length} Comments` : 'Comments'}
                        </h2>

                        <div className={`${styles.comment} no-print`}>
                            <div className={styles.commenter}>
                                <Avatar src={isAuthenticated ? user?.pfpUrl : null} alt="" size={50} />
                                <div>
                                    <p className={styles.commenterName}>{commenterName}</p>
                                    <p className={styles.commentDate}>{formatDate(new Date())}</p>
                                </div>
                            </div>
                            {commentError && <p role="alert" className={styles.error}>{commentError}</p>}
                            <textarea
                                className={styles.commentInput}
                                placeholder={isAuthenticated ? 'Leave a comment for this recipe' : 'Log in to leave a comment'}
                                aria-label="Comment (optional)"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                disabled={!isAuthenticated || commentSubmitting}
                            />
                            <div className={styles.commentActions}>
                                <div className={styles.ratingInput} role="group" aria-label="Rating (required)" data-testid="comment-rating">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            type="button"
                                            key={star}
                                            className={styles.starButton}
                                            aria-label={`${star} stars`}
                                            aria-pressed={star === commentRating}
                                            onClick={() => setCommentRating(star)}
                                            disabled={!isAuthenticated || commentSubmitting}
                                        >
                                            <StarIcon size={38} filled={star <= commentRating} />
                                        </button>
                                    ))}
                                    <span className={styles.ratingScore}>{commentRating.toFixed(1)}</span>
                                </div>
                                <Button
                                    size="sm"
                                    className={styles.submit}
                                    onClick={handleCommentSubmit}
                                    disabled={!isAuthenticated || commentSubmitting || !commentRating}
                                    title={commentRating ? undefined : 'Choose a star rating first'}
                                    data-testid="comment-submit"
                                >
                                    {commentSubmitting ? 'Submitting…' : 'Submit'}
                                </Button>
                            </div>
                        </div>

                        {comments.length > 0 && (
                            <ul className={styles.commentList} data-testid="comments-list">
                                {comments.map(c => {
                                    const author = c.user?.username || c.user?.email || 'User';
                                    return (
                                        <li key={c.id} className={styles.comment} data-testid="comment-item">
                                            <div className={styles.commenter}>
                                                <Avatar src={c.user?.pfpUrl} alt="" size={50} />
                                                <div>
                                                    <p className={styles.commenterName}>{author}</p>
                                                    <p className={styles.commentDate}>{formatDate(c.createdAt)}</p>
                                                </div>
                                            </div>
                                            {c.body && <p className={styles.commentText}>{c.body}</p>}
                                            <div className={styles.commentRating}>
                                                <StarRating value={c.rating} size={27} className={styles.stars} />
                                                <span className={styles.ratingValue}>{Number(c.rating).toFixed(1)}</span>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>
                </div>

                <aside className={`${styles.sidebar} no-print`} data-testid="trending-recipes" aria-labelledby="trending-title">
                    <h2 className={styles.sidebarTitle} id="trending-title">What’s trending</h2>
                    {trendingRecipes.length > 0 ? (
                        <ul className={styles.trendingList}>
                            {trendingRecipes.map(recipe => (
                                <li key={recipe.id}>
                                    <RecipeCard recipe={recipe} />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className={styles.empty}>No other recipes yet</p>
                    )}
                </aside>
            </div>
        </PageLayout>
    );
}

export default PostPublishPage;
