import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../design/carousel.css';

export default function Carousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      id: 1,
      title: 'Delicious Recipes',
      description: 'Browse the latest recipes from the community',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=400&fit=crop',
      to: '/search',
    },
    {
      id: 2,
      title: 'Breakfast Ideas',
      description: 'Start the day with breakfast recipes',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=400&fit=crop',
      to: '/search?mealtype=BREAKFAST',
    },
    {
      id: 3,
      title: 'Desserts',
      description: 'Sweet finishes and baking projects',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=400&fit=crop',
      to: '/search?mealtype=DESSERT',
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="carousel">
      <div className="carousel-container">
        <button type="button" className="carousel-btn carousel-btn-prev" onClick={prevSlide} aria-label="Previous slide">
          &#8249;
        </button>

        <div className="carousel-inner">
          <div className="carousel-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {slides.map((slide) => (
              <button
                type="button"
                key={slide.id}
                className="carousel-slide"
                onClick={() => navigate(slide.to)}
                style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', textAlign: 'left' }}
              >
                <img src={slide.image} alt={slide.title} className="carousel-image" />
                <div className="carousel-content">
                  <h3 className="carousel-title">{slide.title}</h3>
                  <p className="carousel-description">{slide.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <button type="button" className="carousel-btn carousel-btn-next" onClick={nextSlide} aria-label="Next slide">
          &#8250;
        </button>
      </div>

      <div className="carousel-dots">
        {slides.map((slide, index) => (
          <button
            type="button"
            key={slide.id}
            className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
