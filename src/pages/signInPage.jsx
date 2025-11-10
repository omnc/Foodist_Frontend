import React, { useState } from 'react';
import { useAuth } from '../contexts/authContext';
import { useNavigate } from 'react-router-dom';

function SignInPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { register } = useAuth();
    const {isloading} = useAuth();
   
    const navigate = useNavigate();
    const handleSignIn = async () => {
        await register(email, password);
        const result = await register(email, password);
        if (result.success) {
            navigate('/login');
        } else {
            setError(result.error);
        }
    } 
    if (isloading) {
        return <div>Loading...</div>;
    }
    else {
    return (
        <div>
            <h1>Sign In</h1>
            <form onSubmit={handleSignIn}>
                <input type="email" 
                id="email"
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                placeholder="Email" />
                <input type="password"
                id="password"
                autoComplete="new-password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                placeholder="Password" />
                <input type="password"
                id="confirmPassword"
                autoComplete="new-password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
                placeholder="Confirm Password" />
                <button type="submit">Register</button>
            </form>
            <div>
                <button onClick={() => navigate('/login')}>Do you have an account? Login</button>
            </div>
        </div>
    );
    }
}

export default SignInPage;