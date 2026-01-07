import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { useRecipe } from '../contexts/recipeContext';
import Header from '../components/header';
import '../design/postPage.css';

function PostPage() {
    const { isAuthenticated } = useAuth();
    const { createRecipe, isLoading: recipeLoading } = useRecipe();
    const navigate = useNavigate();
    
    // Basic recipe info
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [mealType, setMealType] = useState('BREAKFAST');
    const [servingSize, setServingSize] = useState(1);
    const [level, setLevel] = useState(1);
    const [prepTime, setPrepTime] = useState(0);
    const [cookTime, setCookTime] = useState(0);
    const [titleImage, setTitleImage] = useState(null);
    const [note, setNote] = useState('');
    
    // Dynamic fields
    const [ingredients, setIngredients] = useState([{ name: '', amount: '', unit: '' }]);
    const [descriptionBlocks, setDescriptionBlocks] = useState([{ step: 1, content: '', image: null }]);
    
    const [error, setError] = useState('');

    if (!isAuthenticated) {
        navigate('/login');
        return null;
    }

    const addIngredient = () => {
        setIngredients([...ingredients, { name: '', amount: '', unit: '' }]);
    };

    const removeIngredient = (index) => {
        setIngredients(ingredients.filter((_, i) => i !== index));
    };

    const updateIngredient = (index, field, value) => {
        const updated = ingredients.map((ing, i) => 
            i === index ? { ...ing, [field]: value } : ing
        );
        setIngredients(updated);
    };

    const addStep = () => {
        setDescriptionBlocks([...descriptionBlocks, { step: descriptionBlocks.length + 1, content: '', image: null }]);
    };

    const removeStep = (index) => {
        const updated = descriptionBlocks.filter((_, i) => i !== index);
        // Renumber steps
        updated.forEach((block, i) => block.step = i + 1);
        setDescriptionBlocks(updated);
    };

    const updateStep = (index, value) => {
        const updated = descriptionBlocks.map((block, i) => 
            i === index ? { ...block, content: value } : block
        );
        setDescriptionBlocks(updated);
    };

    const updateStepImage = (index, file) => {
        const updated = descriptionBlocks.map((block, i) => 
            i === index ? { ...block, image: file } : block
        );
        setDescriptionBlocks(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const formData = new FormData();
        
        // Add basic recipe info
        formData.append('title', title);
        formData.append('description', description);
        formData.append('mealtype', mealType);  // lowercase to match backend schema
        formData.append('servingSize', servingSize.toString());
        formData.append('level', level.toString());
        formData.append('prepTime', prepTime.toString());
        formData.append('cookTime', cookTime.toString());
        if (note) formData.append('note', note);
        
        // Add title image if exists
        if (titleImage) {
            formData.append('titleImage', titleImage);
        }
        
        // Add ingredients as JSON string
        formData.append('ingredients', JSON.stringify(ingredients));
        
        // Add description blocks (without images)
        const blocksData = descriptionBlocks.map(block => ({
            step: block.step,
            content: block.content
        }));
        formData.append('descriptionBlocks', JSON.stringify(blocksData));
        
        // Add step images
        descriptionBlocks.forEach((block, index) => {
            if (block.image) {
                formData.append(`stepImage_${index}`, block.image);
            }
        });

        const result = await createRecipe(formData);

        if (result.success) {
            navigate(`/recipe/${result.data.id}`);
        } else {
            setError(result.error || 'Failed to create recipe');
        }
    };

    return (
        <div className="post-page">
            <Header />
            <div className="post-container">
                <div className="post-header">
                    <h1>Share your recipe!</h1>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent ex sem libero laoreet ante sit.</p>
                </div>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit} className="post-form">
                    {/* Title and Description */}
                    <div className="form-section">
                        <div className="form-row">
                            <div>
                                <div className="form-group">
                                    <label>Title</label>
                                    <input 
                                        type="text" 
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="What's your recipe title?" 
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea 
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Write description of your recipe"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Thumbnail photo</label>
                                <div className="image-upload">
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={(e) => setTitleImage(e.target.files[0])}
                                        style={{ display: 'none' }}
                                        id="thumbnail-upload"
                                    />
                                    <label htmlFor="thumbnail-upload" style={{ cursor: 'pointer', display: 'block' }}>
                                        <div className="image-upload-icon">📷</div>
                                        <div className="image-upload-text">
                                            {titleImage ? titleImage.name : 'Click to upload image'}
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="form-section">
                        <h3>Additional information</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Meal type</label>
                                <select 
                                    value={mealType}
                                    onChange={(e) => setMealType(e.target.value)}
                                >
                                    <option value="BREAKFAST">Breakfast</option>
                                    <option value="LUNCH">Lunch</option>
                                    <option value="DINNER">Dinner</option>
                                    <option value="SNACK">Snack</option>
                                    <option value="DESSERT">Dessert</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Serving size</label>
                                <input 
                                    type="number" 
                                    value={servingSize}
                                    onChange={(e) => setServingSize(e.target.value)}
                                    min="1"
                                    required
                                    placeholder="1"
                                />
                            </div>
                            <div className="form-group">
                                <label>Level</label>
                                <select 
                                    value={level}
                                    onChange={(e) => setLevel(e.target.value)}
                                >
                                    <option value="1">Easy</option>
                                    <option value="2">Medium</option>
                                    <option value="3">Hard</option>
                                    <option value="4">Expert</option>
                                    <option value="5">Master</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Time */}
                    <div className="form-section">
                        <h3>Time</h3>
                        <div className="form-grid-2">
                            <div className="form-group">
                                <label>Prep time</label>
                                <input 
                                    type="number" 
                                    value={prepTime}
                                    onChange={(e) => setPrepTime(e.target.value)}
                                    min="0"
                                    required
                                    placeholder="Minutes"
                                />
                            </div>
                            <div className="form-group">
                                <label>Cook time</label>
                                <input 
                                    type="number" 
                                    value={cookTime}
                                    onChange={(e) => setCookTime(e.target.value)}
                                    min="0"
                                    required
                                    placeholder="Minutes"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Ingredients */}
                    <div className="form-section">
                        <h3>Ingredients</h3>
                        <div className="ingredient-header">
                            <input 
                                type="text" 
                                placeholder="Heading (e.g. For the sauce)"
                            />
                        </div>
                        <div className="ingredient-labels">
                            <span>Ingredient</span>
                            <span>Quantity</span>
                            <span>Unit</span>
                            <span></span>
                        </div>
                        {ingredients.map((ingredient, index) => (
                            <div key={index} className="ingredient-item">
                                <input 
                                    type="text" 
                                    value={ingredient.name}
                                    onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                                    placeholder="e.g. fresh tomato"
                                    required
                                />
                                <input 
                                    type="text" 
                                    value={ingredient.amount}
                                    onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                                    placeholder="e.g. 2"
                                    required
                                />
                                <input 
                                    type="text" 
                                    value={ingredient.unit}
                                    onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                                    placeholder="e.g. cups"
                                    required
                                />
                                <button 
                                    type="button" 
                                    onClick={() => removeIngredient(index)}
                                    className="remove-btn"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        <button 
                            type="button" 
                            onClick={addIngredient}
                            className="add-btn"
                        >
                            + Add ingredient
                        </button>
                    </div>

                    {/* Directions */}
                    <div className="form-section">
                        <h3>Directions</h3>
                        {descriptionBlocks.map((block, index) => (
                            <div key={index} className="step-item">
                                <div className="step-header">
                                    <label>Step {block.step}</label>
                                    <button 
                                        type="button" 
                                        onClick={() => removeStep(index)}
                                        className="remove-btn"
                                    >
                                        ×
                                    </button>
                                </div>
                                <div className="step-content">
                                    <textarea 
                                        value={block.content}
                                        onChange={(e) => updateStep(index, e.target.value)}
                                        placeholder="Write description of your recipe"
                                        required
                                    />
                                    <div className="image-upload" style={{ padding: '20px 10px' }}>
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={(e) => updateStepImage(index, e.target.files[0])}
                                            style={{ display: 'none' }}
                                            id={`step-image-${index}`}
                                        />
                                        <label htmlFor={`step-image-${index}`} style={{ cursor: 'pointer', display: 'block' }}>
                                            <div className="image-upload-icon" style={{ fontSize: '24px' }}>📷</div>
                                            {block.image && (
                                                <div className="image-upload-text" style={{ fontSize: '11px', marginTop: '4px' }}>
                                                    {block.image.name}
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button 
                            type="button" 
                            onClick={addStep}
                            className="add-btn"
                        >
                            + Add step
                        </button>
                    </div>

                    {/* Note (Optional) */}
                    <div className="form-section">
                        <h3>Note (Optional)</h3>
                        <div className="form-group">
                            <textarea 
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="If you want to add some extra information about the recipe you can do that here!"
                                rows={4}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="form-actions">
                        <button 
                            type="button" 
                            onClick={() => navigate('/')}
                            className="btn btn-cancel"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={recipeLoading}
                            className="btn btn-submit"
                        >
                            {recipeLoading ? 'Creating...' : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PostPage;