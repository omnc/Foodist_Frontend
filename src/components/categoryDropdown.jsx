import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mealTypeFromLabel } from '../config/api';
import '../design/categoryDropdown.css';

const CATEGORIES = [
  {
    name: 'Meals',
    type: 'meal',
    items: ['Breakfast', 'Lunch', 'Dinner', 'Appetizer', 'Dessert', 'Drink', 'Bread', 'Side Dish'],
  },
  {
    name: 'Ingredients',
    type: 'ingredient',
    items: ['Chicken', 'Beef', 'Pork', 'Seafood', 'Egg', 'Rice', 'Fruits', 'Vegetable'],
  },
  {
    name: 'Cuisines',
    type: 'cuisine',
    items: ['Italian', 'French', 'Greek', 'Indian', 'Chinese', 'Korean', 'Japanese', 'Filipino', 'Mexican'],
  },
  {
    name: 'Occasions',
    type: 'occasion',
    items: ['Passover', 'Easter', 'Thanksgiving', 'Holiday', 'Christmas'],
  },
  {
    name: 'Cooking Tips',
    type: 'cooking-tip',
    items: ['Knife Tips', 'Ingredient Prep', 'Baking Tips', 'BBQ Tips', 'Preserving Tips'],
  },
];

export default function CategoryDropdown() {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName) => {
    if (categoryName === 'Meals') {
      navigate('/search');
      return;
    }
    // Non-meal taxonomies are not modeled in the API yet — use text search
    navigate(`/search?q=${encodeURIComponent(categoryName)}`);
  };

  const handleItemClick = (itemName, categoryType) => {
    if (categoryType === 'meal') {
      const mealtype = mealTypeFromLabel(itemName);
      if (mealtype) {
        navigate(`/search?mealtype=${mealtype}`);
        return;
      }
    }
    navigate(`/search?q=${encodeURIComponent(itemName)}`);
  };

  return (
    <nav className="category-dropdown" aria-label="Recipe categories">
      <ul className="category-nav">
        {CATEGORIES.map((category) => (
          <li className="category-item" key={category.name} data-testid={`category-${category.type}`}>
            <button
              type="button"
              className="category-dropdown-header-item"
              aria-haspopup="true"
              onClick={() => handleCategoryClick(category.name)}
            >
              {category.name}
            </button>
            <ul className="category-submenu" aria-label={category.name}>
              {category.items.map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    className="category-dropdown-content-item"
                    onClick={() => handleItemClick(item, category.type)}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </li>
        ))}
        <li className="category-item" data-testid="category-about-us">
          <Link to="/aboutUs" className="category-dropdown-header-item">
            About us
          </Link>
        </li>
      </ul>
    </nav>
  );
}
