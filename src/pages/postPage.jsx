import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { useRecipe } from '../contexts/recipeContext';
import { MEAL_TYPES } from '../config/api';
import PageLayout from '../components/PageLayout/PageLayout';
import Button from '../components/Button/Button';
import ImageDropzone from '../components/ImageDropzone/ImageDropzone';
import NumberStepper from '../components/NumberStepper/NumberStepper';
import { ChevronIcon, DragHandleIcon, PlusIcon, TrashIcon } from '../components/Icon/Icon';
import mascot from '../assets/brand/mascot-tomato.png';
import styles from './postPage.module.css';

const DEFAULT_GROUP_HEADING = 'Ingredients';
const INITIAL_INGREDIENT_ROWS = 3;
const INITIAL_STEPS = 2;

const emptyIngredient = () => ({ name: '' });
const emptyStep = () => ({ content: '', image: null });

let nextGroupKey = 1;
const newIngredientGroup = () => ({
    key: nextGroupKey++,
    heading: '',
    headingOn: true,
    items: Array.from({ length: INITIAL_INGREDIENT_ROWS }, emptyIngredient),
});

const LEVELS = [
    { value: '1', label: 'Easy' },
    { value: '2', label: 'Medium' },
    { value: '3', label: 'Hard' },
    { value: '4', label: 'Expert' },
    { value: '5', label: 'Master' },
];

function SelectField({ id, label, value, onChange, options, ...rest }) {
    return (
        <div className={styles.field}>
            <label htmlFor={id} className={styles.fieldLabel}>
                {label}
            </label>
            <div className={styles.selectWrap}>
                <select id={id} className={styles.select} value={value} onChange={onChange} {...rest}>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <ChevronIcon size={22} className={styles.selectChevron} />
            </div>
        </div>
    );
}

function PostPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { createRecipe, isLoading: recipeLoading } = useRecipe();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [mealType, setMealType] = useState('BREAKFAST');
    const [servingSize, setServingSize] = useState(1);
    const [level, setLevel] = useState('1');
    const [prepTime, setPrepTime] = useState(0);
    const [cookTime, setCookTime] = useState(0);
    const [titleImage, setTitleImage] = useState(null);
    const [note, setNote] = useState('');

    // Groups are ordered top-to-bottom as displayed; "Add new group" prepends, so groups stack upward.
    const [ingredientGroups, setIngredientGroups] = useState(() => [newIngredientGroup()]);
    const [steps, setSteps] = useState(() => Array.from({ length: INITIAL_STEPS }, emptyStep));

    const [error, setError] = useState('');

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [authLoading, isAuthenticated, navigate]);

    if (authLoading) {
        return (
            <PageLayout mainClassName={styles.page}>
                <p data-testid="post-auth-loading">Loading…</p>
            </PageLayout>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    const updateGroup = (groupIndex, patch) => {
        setIngredientGroups((groups) => groups.map((g, gi) => (gi === groupIndex ? { ...g, ...patch } : g)));
    };

    const addIngredientGroup = () => {
        setIngredientGroups((groups) => [newIngredientGroup(), ...groups]);
    };

    const removeIngredientGroup = (groupIndex) => {
        setIngredientGroups((groups) => groups.filter((_, gi) => gi !== groupIndex));
    };

    const addIngredient = (groupIndex) => {
        setIngredientGroups((groups) =>
            groups.map((g, gi) => (gi === groupIndex ? { ...g, items: [...g.items, emptyIngredient()] } : g))
        );
    };

    const removeIngredient = (groupIndex, index) => {
        setIngredientGroups((groups) =>
            groups.map((g, gi) => (gi === groupIndex ? { ...g, items: g.items.filter((_, i) => i !== index) } : g))
        );
    };

    const updateIngredient = (groupIndex, index, name) => {
        setIngredientGroups((groups) =>
            groups.map((g, gi) =>
                gi === groupIndex ? { ...g, items: g.items.map((ing, i) => (i === index ? { ...ing, name } : ing)) } : g
            )
        );
    };

    const addStep = () => setSteps((current) => [...current, emptyStep()]);
    const removeStep = (index) => setSteps((current) => current.filter((_, i) => i !== index));
    const updateStep = (index, patch) =>
        setSteps((current) => current.map((step, i) => (i === index ? { ...step, ...patch } : step)));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (ingredientGroups.some((g) => g.headingOn && !g.heading.trim())) {
            setError('Every ingredient group needs a heading');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('mealtype', mealType);
        formData.append('servingSize', servingSize.toString());
        formData.append('level', level.toString());
        formData.append('prepTime', prepTime.toString());
        formData.append('cookTime', cookTime.toString());
        if (note) formData.append('note', note);
        if (titleImage) formData.append('titleImage', titleImage);

        const groupsPayload = ingredientGroups.map((g) => ({
            heading: g.headingOn ? g.heading.trim() : DEFAULT_GROUP_HEADING,
            items: g.items.filter((item) => item.name.trim()).map((item) => ({ name: item.name.trim() })),
        }));
        formData.append('ingredientGroups', JSON.stringify(groupsPayload));
        // Flat copy for API versions that predate ingredient groups
        formData.append('ingredients', JSON.stringify(groupsPayload.flatMap((g) => g.items)));

        const filledSteps = steps.filter((step) => step.content.trim());
        formData.append(
            'descriptionBlocks',
            JSON.stringify(filledSteps.map((step, i) => ({ step: i + 1, content: step.content })))
        );
        filledSteps.forEach((step, index) => {
            if (step.image) formData.append(`stepImage_${index}`, step.image);
        });

        const result = await createRecipe(formData);

        if (result.success) {
            navigate(`/recipe/${result.data.id}`);
        } else {
            setError(result.error || 'Failed to create recipe');
        }
    };

    return (
        <PageLayout mainClassName={styles.page}>
            <div className={styles.wrap}>
                <img src={mascot} alt="" className={styles.mascot} />
                <div className={styles.panel}>
                    <div className={styles.intro}>
                        <h1 className={styles.title}>Share your recipe!</h1>
                        <p className={styles.introText}>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce eu dui quis libero laoreet lacinia.
                        </p>
                    </div>

                    {error && (
                        <div className={styles.error} role="alert" data-testid="post-error">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form} data-testid="post-form">
                        <div className={styles.basics}>
                            <div className={styles.basicsText}>
                                <div className={styles.field}>
                                    <label htmlFor="post-title" className={styles.heading}>
                                        Title
                                    </label>
                                    <input
                                        id="post-title"
                                        type="text"
                                        className={styles.input}
                                        data-testid="post-title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Write your recipe title"
                                        required
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label htmlFor="post-description" className={styles.heading}>
                                        Description
                                    </label>
                                    <textarea
                                        id="post-description"
                                        className={`${styles.input} ${styles.textarea}`}
                                        data-testid="post-description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Write description of your recipe"
                                        required
                                    />
                                </div>
                            </div>
                            <div className={styles.field}>
                                <p className={styles.heading}>Thumbnail photo</p>
                                <ImageDropzone
                                    className={styles.thumbnail}
                                    file={titleImage}
                                    onChange={setTitleImage}
                                    label="Thumbnail photo"
                                    testId="post-thumbnail"
                                />
                            </div>
                        </div>

                        <section className={styles.section} aria-labelledby="post-additional-heading">
                            <h2 id="post-additional-heading" className={styles.heading}>
                                Additional information
                            </h2>
                            <div className={styles.threeUp}>
                                <SelectField
                                    id="post-meal-type"
                                    label="Meal type"
                                    value={mealType}
                                    onChange={(e) => setMealType(e.target.value)}
                                    options={MEAL_TYPES}
                                />
                                <div className={styles.field}>
                                    <label htmlFor="post-serving-size" className={styles.fieldLabel}>
                                        Serving size
                                    </label>
                                    <NumberStepper
                                        id="post-serving-size"
                                        label="Serving size"
                                        value={servingSize}
                                        onChange={setServingSize}
                                        required
                                    />
                                </div>
                                <SelectField
                                    id="post-level"
                                    label="Level"
                                    value={level}
                                    onChange={(e) => setLevel(e.target.value)}
                                    options={LEVELS}
                                />
                            </div>
                            <div className={styles.threeUp}>
                                <div className={styles.field}>
                                    <label htmlFor="post-prep-time" className={styles.fieldLabel}>
                                        Prep time (minutes)
                                    </label>
                                    <input
                                        id="post-prep-time"
                                        type="number"
                                        className={styles.input}
                                        value={prepTime}
                                        onChange={(e) => setPrepTime(e.target.value)}
                                        min="0"
                                        required
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label htmlFor="post-cook-time" className={styles.fieldLabel}>
                                        Cook time (minutes)
                                    </label>
                                    <input
                                        id="post-cook-time"
                                        type="number"
                                        className={styles.input}
                                        value={cookTime}
                                        onChange={(e) => setCookTime(e.target.value)}
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>
                        </section>

                        <section className={`${styles.section} ${styles.sectionIngredients}`} aria-labelledby="post-ingredients-heading">
                            <h2 id="post-ingredients-heading" className={styles.heading}>
                                Ingredients
                            </h2>
                            <div className={styles.groups}>
                                {ingredientGroups.map((group, groupIndex) => (
                                    <div
                                        key={group.key}
                                        className={styles.group}
                                        data-testid={`ingredient-group-${groupIndex}`}
                                    >
                                        <div className={styles.groupHeader}>
                                            <DragHandleIcon size={24} className={styles.dragHandle} />
                                            <input
                                                type="text"
                                                className={styles.headingInput}
                                                aria-label={`Ingredient group ${groupIndex + 1} heading`}
                                                data-testid={`ingredient-heading-${groupIndex}`}
                                                value={group.heading}
                                                onChange={(e) => updateGroup(groupIndex, { heading: e.target.value })}
                                                placeholder="Heading"
                                                maxLength={120}
                                                required={group.headingOn}
                                                disabled={!group.headingOn}
                                            />
                                            <label className={styles.switch}>
                                                <span className={styles.switchLabel}>
                                                    Heading {group.headingOn ? 'on' : 'off'}
                                                </span>
                                                <input
                                                    type="checkbox"
                                                    role="switch"
                                                    className={styles.switchInput}
                                                    data-testid={`ingredient-heading-toggle-${groupIndex}`}
                                                    checked={group.headingOn}
                                                    onChange={(e) => updateGroup(groupIndex, { headingOn: e.target.checked })}
                                                />
                                                <span className={styles.switchTrack} aria-hidden="true" />
                                            </label>
                                            <button
                                                type="button"
                                                className={styles.iconButton}
                                                onClick={() => removeIngredientGroup(groupIndex)}
                                                disabled={ingredientGroups.length === 1}
                                                aria-label={`Remove ingredient group ${groupIndex + 1}`}
                                            >
                                                <TrashIcon size={24} />
                                            </button>
                                        </div>
                                        <div className={styles.groupBody}>
                                            {group.items.map((ingredient, index) => (
                                                <div key={index} className={styles.ingredientRow} data-testid={`ingredient-row-${groupIndex}-${index}`}>
                                                    <DragHandleIcon size={24} className={styles.dragHandle} />
                                                    <input
                                                        type="text"
                                                        className={styles.input}
                                                        aria-label={`Group ${groupIndex + 1} ingredient ${index + 1}`}
                                                        data-testid={`ingredient-name-${groupIndex}-${index}`}
                                                        value={ingredient.name}
                                                        onChange={(e) => updateIngredient(groupIndex, index, e.target.value)}
                                                        placeholder="Write ingredient"
                                                        required={index === 0}
                                                    />
                                                    <button
                                                        type="button"
                                                        className={styles.iconButton}
                                                        onClick={() => removeIngredient(groupIndex, index)}
                                                        disabled={group.items.length === 1}
                                                        aria-label={`Remove ingredient ${index + 1} from group ${groupIndex + 1}`}
                                                    >
                                                        <TrashIcon size={24} />
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                className={styles.addLink}
                                                onClick={() => addIngredient(groupIndex)}
                                                data-testid={`add-ingredient-${groupIndex}`}
                                            >
                                                Add new ingredient
                                                <PlusIcon size={24} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button
                                className={styles.addButton}
                                icon={<PlusIcon size={26} />}
                                onClick={addIngredientGroup}
                                data-testid="add-ingredient-group"
                            >
                                Add new group
                            </Button>
                        </section>

                        <section className={`${styles.section} ${styles.sectionSteps}`} aria-labelledby="post-steps-heading">
                            <h2 id="post-steps-heading" className={styles.heading}>
                                Description
                            </h2>
                            <div className={styles.steps}>
                                {steps.map((step, index) => (
                                    <div key={index} className={styles.step}>
                                        <div className={styles.stepHeader}>
                                            <label htmlFor={`post-step-${index}`} className={styles.fieldLabel}>
                                                Step {index + 1}
                                            </label>
                                            {steps.length > 1 && (
                                                <button
                                                    type="button"
                                                    className={styles.iconButton}
                                                    onClick={() => removeStep(index)}
                                                    aria-label={`Remove step ${index + 1}`}
                                                >
                                                    <TrashIcon size={22} />
                                                </button>
                                            )}
                                        </div>
                                        <div className={styles.stepBody}>
                                            <textarea
                                                id={`post-step-${index}`}
                                                className={`${styles.input} ${styles.stepText}`}
                                                data-testid={`step-content-${index}`}
                                                value={step.content}
                                                onChange={(e) => updateStep(index, { content: e.target.value })}
                                                placeholder="Write description of your recipe"
                                                required={index === 0}
                                            />
                                            <ImageDropzone
                                                className={styles.stepImage}
                                                file={step.image}
                                                onChange={(file) => updateStep(index, { image: file })}
                                                label={`Step ${index + 1} image`}
                                                testId={`step-image-${index}`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button
                                className={styles.addButton}
                                icon={<PlusIcon size={26} />}
                                onClick={addStep}
                                data-testid="add-step"
                            >
                                Add new step
                            </Button>
                        </section>

                        <section className={`${styles.section} ${styles.sectionNote}`} aria-labelledby="post-note-heading">
                            <h2 id="post-note-heading" className={styles.heading}>
                                Note (Optional)
                            </h2>
                            <textarea
                                className={`${styles.input} ${styles.textarea}`}
                                aria-labelledby="post-note-heading"
                                data-testid="post-note"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Write additional note or tip"
                            />
                        </section>

                        <div className={styles.actions}>
                            <Button type="submit" data-testid="post-submit" disabled={recipeLoading} className={styles.submit}>
                                {recipeLoading ? 'Creating…' : 'Submit'}
                            </Button>
                            <Button variant="text" className={styles.cancel} onClick={() => navigate('/')}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </PageLayout>
    );
}

export default PostPage;
