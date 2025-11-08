import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/authContext.jsx';
import MainPage from './pages/mainPage.jsx';
import LogInPage from './pages/logInPage.jsx';
import SignInPage from './pages/signInPage.jsx';
import MyPage from './pages/myPage.jsx';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<MainPage />} />
                    <Route path="/login" element={<LogInPage />} />
                    <Route path="/signin" element={<SignInPage />} />
                    <Route path="/mypage" element={<MyPage />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;