import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronIcon } from './Icon/Icon';
import heroCookies from '../assets/home/hero-cookies.webp';
import styles from './Carousel/HomeHero.module.css';

const SLIDES = [
  {
    eyebrow: 'Monthly recommendation',
    title: 'The Best Ten\nCookie Recipes',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In odio massa, gravida sit amet fringilla rhoncus, egestas.',
    to: '/search?q=cookie',
  },
  {
    eyebrow: 'Editor’s choice',
    title: 'Recipes worth\nsharing',
    description: 'Discover community favourites, seasonal ideas and dishes made for cooking together.',
    to: '/search',
  },
  {
    eyebrow: 'Weekend baking',
    title: 'Something sweet\nfor everyone',
    description: 'Find a new bake, save it for later and share your own favourite recipe with Foodist.',
    to: '/search?mealtype=DESSERT',
  },
];

/** Home hero carousel. The artwork is decorative; each visible slide remains a keyboard-accessible link button. */
export default function Carousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const move = (delta) => setCurrentSlide((current) => (current + delta + SLIDES.length) % SLIDES.length);

  return (
    <section className={`${styles.hero} carousel`} aria-label="Featured recipes">
      <img className={styles.art} src={heroCookies} alt="" aria-hidden="true" />
      <div className={`${styles.viewport} carousel-inner`}>
        <div className={`${styles.track} carousel-track`} style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {SLIDES.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              className={`${styles.slide} carousel-slide`}
              data-testid={`carousel-slide-${index}`}
              aria-hidden={index !== currentSlide}
              tabIndex={index === currentSlide ? 0 : -1}
              onClick={() => navigate(slide.to)}
            >
              <span className={styles.eyebrow}>{slide.eyebrow}</span>
              <span className={styles.title}>{slide.title}</span>
              <span className={styles.description}>{slide.description}</span>
            </button>
          ))}
        </div>
      </div>
      <div className={styles.controls}>
        <button type="button" className={styles.arrow} onClick={() => move(-1)} aria-label="Previous slide">
          <ChevronIcon direction="left" size={18} />
        </button>
        <div className={styles.dots}>
          {SLIDES.map((slide, index) => (
            <button
              type="button"
              key={slide.title}
              className={`${styles.dot} ${index === currentSlide ? styles.active : ''}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentSlide}
            />
          ))}
        </div>
        <button type="button" className={styles.arrow} onClick={() => move(1)} aria-label="Next slide">
          <ChevronIcon direction="right" size={18} />
        </button>
      </div>
    </section>
  );
}
