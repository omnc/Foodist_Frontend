import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/authContext.jsx';
import { RecipeProvider } from './contexts/recipeContext.jsx';
import MainPage from './pages/mainPage.jsx';
import LogInPage from './pages/logInPage.jsx';
import SignInPage from './pages/signInPage.jsx';
import MyPage from './pages/myPage.jsx';
import PostPage from './pages/postPage.jsx';
import PostPublishPage from './pages/postPublishPage.jsx';

function App() {
    return (
        <AuthProvider>
            <RecipeProvider>
                <HashRouter>
                    <Routes>
                        <Route path="/" element={<MainPage />} />
                        <Route path="/login" element={<LogInPage />} />
                        <Route path="/signin" element={<SignInPage />} />
                        <Route path="/myPage" element={<MyPage />} />
                        <Route path="/postPage" element={<PostPage />} />
                        <Route path="/recipe/:id" element={<PostPublishPage />} />
                    </Routes>
                </HashRouter>
            </RecipeProvider>
        </AuthProvider>
    );
}

export default App;