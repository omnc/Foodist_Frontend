import React, { useState } from 'react';
import '../design/carousel.css';

export default function Carousel() {
    const [currentSlide, setCurrentSlide] = useState(0);
    
    const slides = [
        {
            id: 1,
            title: "Delicious Recipes",
            description: "Discover amazing recipes from around the world",
            image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=400&fit=crop",
            action: () => console.log("Clicked on Delicious Recipes")
        },
        {
            id: 2,
            title: "Fresh Ingredients",
            description: "Find the best local ingredients for your cooking",
            image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=400&fit=crop",
            action: () => console.log("Clicked on Fresh Ingredients")
        },
        {
            id: 3,
            title: "Cooking Tips",
            description: "Learn professional cooking techniques and tips",
            image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=400&fit=crop",
            action: () => console.log("Clicked on Cooking Tips")
        }
    ];

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    const handleSlideClick = (slide) => {
        slide.action();
    };

    return (
        <div className="carousel">
            <div className="carousel-container">
                <button className="carousel-btn carousel-btn-prev" onClick={prevSlide}>
                    &#8249;
                </button>
                
                <div className="carousel-inner">
                    <div 
                        className="carousel-track" 
                        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    >
                        {slides.map((slide, index) => (
                            <div 
                                key={slide.id} 
                                className="carousel-slide"
                                onClick={() => handleSlideClick(slide)}
                            >
                                <img 
                                    src={slide.image} 
                                    alt={slide.title}
                                    className="carousel-image"
                                />
                                <div className="carousel-content">
                                    <h3 className="carousel-title">{slide.title}</h3>
                                    <p className="carousel-description">{slide.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <button className="carousel-btn carousel-btn-next" onClick={nextSlide}>
                    &#8250;
                </button>
            </div>
            
            <div className="carousel-indicators">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        className={`carousel-indicator ${index === currentSlide ? 'active' : ''}`}
                        onClick={() => goToSlide(index)}
                    />
                ))}
            </div>
        </div>
    );
}