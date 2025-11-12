import React from 'react';
import { HashRouter, Routes, Route } from 'react-router';
import { AuthProvider } from './contexts/authContext.jsx';
import MainPage from './pages/mainPage.jsx';
import LogInPage from './pages/logInPage.jsx';
import SignInPage from './pages/signInPage.jsx';
import MyPage from './pages/myPage.jsx';

function App() {
    return (
        <AuthProvider>
            <HashRouter>
                <Routes>
                    <Route path="/" element={<MainPage />} />
                    <Route path="/login" element={<LogInPage />} />
                    <Route path="/signin" element={<SignInPage />} />
                    <Route path="/mypage" element={<MyPage />} />
                </Routes>
            </HashRouter>
        </AuthProvider>
    );
}

export default App;