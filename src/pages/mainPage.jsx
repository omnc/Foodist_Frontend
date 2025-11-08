import React from 'react';
import Header from '../components/header';
import CategoryDropdown from '../components/categoryDropdown';
import Carousel from '../components/carousel';

function MainPage() {
    return (
        <div>
            <Header />
            <CategoryDropdown />
            <Carousel />
        </div>
    );
}

export default MainPage;