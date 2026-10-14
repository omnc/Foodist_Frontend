import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { squareImageDataUrl } from '../lib/resizeImage';
import { SOCIAL_NETWORKS, loadSocialLinks, saveSocialLinks } from '../lib/profileSocials';
import PageLayout from '../components/PageLayout/PageLayout';
import Button from '../components/Button/Button';
import ImageDropzone from '../components/ImageDropzone/ImageDropzone';
import styles from './editProfilePage.module.css';

const USERNAME_MAX = 40;
const BIO_MAX = 300;

function EditProfilePage() {
    const { user, isAuthenticated, isLoading: authLoading, updateProfile } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState(user?.username || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [links, setLinks] = useState(() => loadSocialLinks(user?.id));
    const [photo, setPhoto] = useState(null);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    if (!authLoading && !isAuthenticated) {
        return <Navigate to="/login" />;
    }

    const onSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSaving(true);
        try {
            const fields = { username: username.trim() || null, bio: bio.trim() || null };
            if (photo) fields.pfpUrl = await squareImageDataUrl(photo);
            const result = await updateProfile(fields);
            if (!result.success) {
                setError(result.error || 'Unable to update your profile');
                return;
            }
            saveSocialLinks(user.id, links);
            navigate('/myPage');
        } catch (err) {
            setError(err.message || 'Unable to update your profile');
        } finally {
            setSaving(false);
        }
    };

    return (
        <PageLayout mainClassName={styles.main}>
            <div className={styles.wrap}>
                <div className={styles.panel}>
                    <h1 className={styles.title}>Edit profile</h1>
                    {error && (
                        <div className={styles.error} role="alert" data-testid="profile-error">{error}</div>
                    )}
                    <form className={styles.form} onSubmit={onSubmit} data-testid="edit-profile-form">
                        <div className={`${styles.field} ${styles.photoField}`}>
                            <p className={styles.heading}>Profile photo</p>
                            <ImageDropzone
                                file={photo}
                                onChange={setPhoto}
                                label="Profile photo"
                                testId="edit-photo"
                                currentUrl={user?.pfpUrl || ''}
                                className={styles.dropzone}
                            />
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="edit-username" className={styles.heading}>User name</label>
                            <input
                                id="edit-username"
                                data-testid="edit-username"
                                className={styles.input}
                                value={username}
                                maxLength={USERNAME_MAX}
                                onChange={(event) => setUsername(event.target.value)}
                                placeholder="Write user name"
                            />
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="edit-bio" className={styles.heading}>Bio</label>
                            <textarea
                                id="edit-bio"
                                data-testid="edit-bio"
                                className={`${styles.input} ${styles.textarea}`}
                                value={bio}
                                maxLength={BIO_MAX}
                                onChange={(event) => setBio(event.target.value)}
                                placeholder="Tell us about yourself"
                            />
                        </div>

                        {SOCIAL_NETWORKS.map(({ key, label, placeholder }) => (
                            <div className={styles.field} key={key}>
                                <label htmlFor={`edit-${key}`} className={styles.heading}>{label}</label>
                                <input
                                    id={`edit-${key}`}
                                    data-testid={`edit-${key}`}
                                    className={styles.input}
                                    type="url"
                                    inputMode="url"
                                    value={links[key] || ''}
                                    onChange={(event) => setLinks((current) => ({ ...current, [key]: event.target.value }))}
                                    placeholder={placeholder}
                                />
                            </div>
                        ))}

                        <div className={styles.actions}>
                            <Button type="submit" disabled={saving} data-testid="edit-submit" className={styles.submit}>
                                {saving ? 'Saving…' : 'Submit'}
                            </Button>
                            <Link to="/myPage" className={styles.cancel}>Cancel</Link>
                        </div>
                    </form>
                </div>
            </div>
        </PageLayout>
    );
}

export default EditProfilePage;
