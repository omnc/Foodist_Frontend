import React, { useState } from 'react';
import { useAuth } from '../contexts/authContext';
import { useNavigate } from 'react-router-dom';

function LogInPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading } = useAuth();
    const navigate = useNavigate();
    if (isLoading) {
        return <div>Loading...</div>;
    }
    const handleLogin = async (e) => {
        e.preventDefault();
        await login(email, password);
        const result = await login(email, password);
        if (result.success) {
            navigate('/');
            console.log('Logged in successfully');
        } else if (result.statuscode === 404) {
            setError(result.error);
        }else if (result.statuscode === 401) {
            setError(result.error);
        }else{
            setError('An unknown error occurred');
        }
    }
    return (
        <div>
            <h1>Log In</h1>
            <form onSubmit={handleLogin}>
                <input type="email" 
                id="email"
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                placeholder="Email" />
                <input type="password"
                id="password"
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                placeholder="Password" />
                <button type="submit">Log In</button>
            </form>
            <div>
                <button onClick={() => navigate('/signin')}>Don't have an account? Sign In</button>
            </div>
        </div>
    );
}

export default LogInPage;