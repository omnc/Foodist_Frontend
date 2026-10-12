import React from 'react';
import { useNavigate } from 'react-router-dom';
import { mealTypeFromLabel } from '../config/api';
import '../design/categoryDropdown.css';

export default function CategoryDropdown() {
  const navigate = useNavigate();

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
    { id: 9, name: 'Side Dishes' },
  ];

  const ingredients = [
    { id: 1, name: 'Chicken' },
    { id: 2, name: 'Beef' },
    { id: 3, name: 'Pork' },
    { id: 4, name: 'Seafood' },
    { id: 5, name: 'Eggs' },
    { id: 6, name: 'Rice' },
    { id: 7, name: 'Fruits' },
    { id: 8, name: 'Vegetables' },
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
    { id: 4, name: "Valentine's Day" },
    { id: 5, name: 'Easter' },
  ];

  const cookingTips = [
    { id: 1, name: 'Knife Tips' },
    { id: 2, name: 'Ingredients Prep' },
    { id: 3, name: 'Baking Tips' },
    { id: 4, name: 'BBQ Tips' },
    { id: 5, name: 'Preserving Tips' },
  ];

  const handleCategoryClick = (categoryName) => {
    if (categoryName === 'Meals') {
      navigate('/search');
      return;
    }
    // Non-meal taxonomies are not modeled in the API yet — use text search
    navigate(`/search?q=${encodeURIComponent(categoryName)}`);
  };

  const handleContentClick = (contentName, categoryType) => {
    if (categoryType === 'meal') {
      const mealtype = mealTypeFromLabel(contentName);
      if (mealtype) {
        navigate(`/search?mealtype=${mealtype}`);
        return;
      }
    }
    navigate(`/search?q=${encodeURIComponent(contentName)}`);
  };

  return (
    <div className="category-dropdown">
      <div className="category-dropdown-header">
        {categories.map((category) => (
          <button
            type="button"
            className="category-dropdown-header-item"
            key={category.id}
            onClick={() => handleCategoryClick(category.name)}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="category-dropdown-content">
        <div className="content-section">
          <div className="content-section-title">Meals</div>
          {meals.map((meal) => (
            <button
              type="button"
              className="category-dropdown-content-item"
              key={`meal-${meal.id}`}
              onClick={() => handleContentClick(meal.name, 'meal')}
            >
              {meal.name}
            </button>
          ))}
        </div>

        <div className="content-section">
          <div className="content-section-title">Ingredients</div>
          {ingredients.map((ingredient) => (
            <button
              type="button"
              className="category-dropdown-content-item"
              key={`ingredient-${ingredient.id}`}
              onClick={() => handleContentClick(ingredient.name, 'ingredient')}
            >
              {ingredient.name}
            </button>
          ))}
        </div>

        <div className="content-section">
          <div className="content-section-title">Cuisines</div>
          {cuisines.map((cuisine) => (
            <button
              type="button"
              className="category-dropdown-content-item"
              key={`cuisine-${cuisine.id}`}
              onClick={() => handleContentClick(cuisine.name, 'cuisine')}
            >
              {cuisine.name}
            </button>
          ))}
        </div>

        <div className="content-section">
          <div className="content-section-title">Occasions</div>
          {occasions.map((occasion) => (
            <button
              type="button"
              className="category-dropdown-content-item"
              key={`occasion-${occasion.id}`}
              onClick={() => handleContentClick(occasion.name, 'occasion')}
            >
              {occasion.name}
            </button>
          ))}
        </div>

        <div className="content-section">
          <div className="content-section-title">Cooking Tips</div>
          {cookingTips.map((cookingTip) => (
            <button
              type="button"
              className="category-dropdown-content-item"
              key={`tip-${cookingTip.id}`}
              onClick={() => handleContentClick(cookingTip.name, 'cooking-tip')}
            >
              {cookingTip.name}
            </button>
          ))}
        </div>

        <div className="content-section about-us" />
      </div>
    </div>
  );
}
