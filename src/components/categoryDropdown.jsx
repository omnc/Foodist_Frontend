import React from 'react';
import '../design/categoryDropdown.css';

export default function CategoryDropdown() {
    const categories = [
        { id: 1, name: 'Meals' },
        { id: 2, name: 'Ingredients' },
        { id: 3, name: 'Cuisines' },
        { id: 4, name: 'Occasions' },
        { id: 5, name: 'Cooking Tips' },
        { id: 6, name: 'About Us' },
    ];

    const meals = [
        { id: 1, name: 'Breakfast' },
        { id: 2, name: 'Lunch' },
        { id: 3, name: 'Dinner' },
        { id: 4, name: 'Snack' },
        { id: 5, name: 'Appetizer' },
        { id: 6, name: 'Dessert' },
        { id: 7, name: 'Drink' },
        { id: 8, name: 'Bread' },
        { id: 9, name: 'Side Dishes' }
    ];

    const ingredients = [
        { id: 1, name: 'Chicken' },
        { id: 2, name: 'Beef' },
        { id: 3, name: 'Pork' },
        { id: 4, name: 'Seafood' },
        { id: 5, name: 'Eggs' },
        { id: 6, name: 'Rice' },
        { id: 7, name: 'Fruits' },
        { id: 8, name: 'Vegetables' }
    ];

    const cuisines = [
        { id: 1, name: 'Italian' },
        { id: 2, name: 'French' },
        { id: 3, name: 'Greek' },
        { id: 4, name: 'Indian' },
        { id: 5, name: 'Chinese' },
        { id: 6, name: 'Korean' },
        { id: 7, name: 'Japanese' },
        { id: 8, name: 'Filipino' },
        { id: 9, name: 'Mexican' },
    ];

    const occasions = [
        { id: 1, name: 'Christmas' },
        { id: 2, name: 'Thanksgiving' },
        { id: 3, name: 'New Year' },
        { id: 4, name: 'Valentine\'s Day' },
        { id: 5, name: 'Easter' },
    ];

    const cookingTips = [
        { id: 1, name: 'Knife Tips' },
        { id: 2, name: 'Ingredients Prep' },
        { id: 3, name: 'Baking Tips' },
        { id: 4, name: 'BBQ Tips' },
        { id: 5, name: 'Preserving Tips' },
    ];

    // Handle click events for future navigation
    const handleCategoryClick = (categoryName) => {
        console.log(`Navigate to search page for category: ${categoryName}`);
        // TODO: Navigate to search page with category filter
    };

    const handleContentClick = (contentName, categoryType) => {
        console.log(`Navigate to search page for ${categoryType}: ${contentName}`);
        // TODO: Navigate to search page with specific content filter
    };

    return (
        <div className="category-dropdown">
            <div className="category-dropdown-header">
                {categories.map((category) => (
                    <div 
                        className="category-dropdown-header-item" 
                        key={category.id}
                        onClick={() => handleCategoryClick(category.name)}
                    >
                        {category.name}
                    </div>
                ))}
            </div>

            <div className="category-dropdown-content">
                {/* Meals Section */}
                <div className="content-section">
                    <div className="content-section-title">Meals</div>
                    {meals.map((meal) => (
                        <div 
                            className="category-dropdown-content-item" 
                            key={`meal-${meal.id}`}
                            onClick={() => handleContentClick(meal.name, 'meal')}
                        >
                            {meal.name}
                        </div>
                    ))}
                </div>

                {/* Ingredients Section */}
                <div className="content-section">
                    <div className="content-section-title">Ingredients</div>
                    {ingredients.map((ingredient) => (
                        <div 
                            className="category-dropdown-content-item" 
                            key={`ingredient-${ingredient.id}`}
                            onClick={() => handleContentClick(ingredient.name, 'ingredient')}
                        >
                            {ingredient.name}
                        </div>
                    ))}
                </div>

                {/* Cuisines Section */}
                <div className="content-section">
                    <div className="content-section-title">Cuisines</div>
                    {cuisines.map((cuisine) => (
                        <div 
                            className="category-dropdown-content-item" 
                            key={`cuisine-${cuisine.id}`}
                            onClick={() => handleContentClick(cuisine.name, 'cuisine')}
                        >
                            {cuisine.name}
                        </div>
                    ))}
                </div>

                {/* Occasions Section */}
                <div className="content-section">
                    <div className="content-section-title">Occasions</div>
                    {occasions.map((occasion) => (
                        <div 
                            className="category-dropdown-content-item" 
                            key={`occasion-${occasion.id}`}
                            onClick={() => handleContentClick(occasion.name, 'occasion')}
                        >
                            {occasion.name}
                        </div>
                    ))}
                </div>

                {/* Cooking Tips Section */}
                <div className="content-section">
                    <div className="content-section-title">Cooking Tips</div>
                    {cookingTips.map((cookingTip) => (
                        <div 
                            className="category-dropdown-content-item" 
                            key={`tip-${cookingTip.id}`}
                            onClick={() => handleContentClick(cookingTip.name, 'cooking-tip')}
                        >
                            {cookingTip.name}
                        </div>
                    ))}
                </div>

                {/* About Us Section - No content */}
                <div className="content-section about-us">
                    {/* About Us has no dropdown content */}
                </div>
            </div>
        </div>
    );
}