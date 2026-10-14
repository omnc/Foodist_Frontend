import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { apiFetch, authHeaders } from '../lib/apiClient';
import { sortRecipes } from '../lib/sortRecipes';
import { SOCIAL_NETWORKS, loadSocialLinks, safeLinkHref } from '../lib/profileSocials';
import useMyRecipes from '../hooks/useMyRecipes';
import PageLayout from '../components/PageLayout/PageLayout';
import Avatar from '../components/Avatar/Avatar';
import Button from '../components/Button/Button';
import SortSelect from '../components/SortSelect/SortSelect';
import { RecipeCardGrid } from '../components/RecipeCard/RecipeCard';
import { ArrowRightIcon, FacebookIcon, GearIcon, HeartIcon, InstagramIcon, PencilIcon, PlusIcon, XIcon } from '../components/Icon/Icon';
import mascot from '../assets/brand/mascot-tomato.png';
import styles from './myPage.module.css';

const PREVIEW_COUNT = 6;
const SOCIAL_ORDER = ['facebook', 'x', 'instagram'];
const SOCIAL_ICONS = { facebook: FacebookIcon, instagram: InstagramIcon, x: XIcon };

function useSavedCount({ token, enabled }) {
    const [count, setCount] = useState(null);
    useEffect(() => {
        if (!enabled) return undefined;
        let cancelled = false;
        apiFetch('/saved-recipes', { headers: authHeaders({ token }) })
            .then((response) => (response.ok ? response.json() : []))
            .then((data) => {
                if (!cancelled) setCount(Array.isArray(data) ? data.length : 0);
            })
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, [enabled, token]);
    return count;
}

function MyPage() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const ready = !authLoading && isAuthenticated;
    const { recipes, loading, error } = useMyRecipes({ token: user?.token, enabled: ready });
    const savedCount = useSavedCount({ token: user?.token, enabled: ready });
    const [sort, setSort] = useState('newest');
    const sorted = useMemo(() => sortRecipes(recipes, sort), [recipes, sort]);
    const ratingTotal = recipes.reduce((total, recipe) => total + Number(recipe.ratingCount || 0), 0);

    if (!authLoading && !isAuthenticated) {
        return <Navigate to="/login" />;
    }

    const socials = loadSocialLinks(user?.id);
    const displayName = user?.username || user?.email?.split('@')[0] || 'Your profile';
    const visible = sorted.slice(0, PREVIEW_COUNT);

    return (
        <PageLayout mainClassName={styles.main}>
            <div className={styles.container}>
                <div className={styles.top}>
                    <section className={styles.profile} aria-label="Profile" data-testid="profile-card">
                        <div className={styles.banner} />
                        <Avatar src={user?.pfpUrl} alt={`${displayName}'s profile photo`} size={182} className={styles.avatar} />
                        <div className={styles.actions}>
                            <Link to="/changePassword" className={styles.gear} aria-label="Account settings: change password">
                                <GearIcon size={24} />
                            </Link>
                            <Button as={Link} to="/editProfile" variant="outline" size="sm" className={styles.editButton} icon={<PencilIcon size={14} />}>
                                Edit
                            </Button>
                        </div>
                        <div className={styles.info}>
                            <h2 className={styles.name} data-testid="profile-name">{displayName}</h2>
                            {user?.bio ? <p className={styles.bio} data-testid="profile-bio">{user.bio}</p> : <p className={styles.bioEmpty}>No bio yet.</p>}
                            <ul className={styles.socials} aria-label="Social links">
                                {SOCIAL_ORDER.map((key) => {
                                    const label = SOCIAL_NETWORKS.find((network) => network.key === key).label;
                                    const href = safeLinkHref(socials[key]);
                                    const Icon = SOCIAL_ICONS[key];
                                    return href ? (
                                        <li key={key}>
                                            <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
                                                <Icon size={28} {...(key === 'facebook' ? { circle: true } : {})} />
                                            </a>
                                        </li>
                                    ) : null;
                                })}
                            </ul>
                        </div>
                    </section>

                    <aside className={styles.aside} aria-label="Profile summary">
                        <div className={styles.stats}>
                            <img src={mascot} alt="" className={styles.mascot} />
                            <dl className={styles.statList}>
                                <div>
                                    <dt>Post</dt>
                                    <dd data-testid="stat-posts">{recipes.length}</dd>
                                </div>
                                <div>
                                    <dt>Ratings</dt>
                                    <dd data-testid="stat-ratings">{ratingTotal}</dd>
                                </div>
                            </dl>
                        </div>
                        <Link to="/saved" className={styles.savedLink} data-testid="saved-link">
                            <HeartIcon size={40} />
                            <span>{savedCount === null ? 'Saved recipes' : `${savedCount} saved recipes`}</span>
                            <ArrowRightIcon size={34} />
                        </Link>
                        <Button as={Link} to="/postPage" fullWidth icon={<PlusIcon size={34} />} className={styles.addButton}>
                            Add new recipe
                        </Button>
                    </aside>
                </div>

                <div className={styles.listHead}>
                    <h1>My recipes ({recipes.length})</h1>
                    <div className={styles.listTools}>
                        {sorted.length > PREVIEW_COUNT && (
                            <Link to="/myRecipes" className={styles.viewAll}>View all</Link>
                        )}
                        <SortSelect value={sort} onChange={setSort} />
                    </div>
                </div>

                {authLoading || loading ? (
                    <p>Loading recipes...</p>
                ) : error ? (
                    <p role="alert" className={styles.error}>{error}</p>
                ) : recipes.length === 0 ? (
                    <p>
                        You haven't created any recipes yet. <Link to="/postPage">Add a recipe</Link>.
                    </p>
                ) : (
                    <div className={styles.results}>
                        <RecipeCardGrid recipes={visible} />
                    </div>
                )}
            </div>
        </PageLayout>
    );
}

export default MyPage;
