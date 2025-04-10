import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login({ successJob, token }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    if (token) {
        navigate('/home');
    }

    const login = async () => {
        try {
            const response = await axios.post(`http://localhost:5005/admin/auth/login`, {
                email: email,
                password: password,
            });
            const token = response.data.token;
            successJob(token);
        } catch (err) {
            console.log(err);
            alert(err.response.data.error);
        }
    }
    return (
        <>
        <div className="mt-10 mx-auto flex max-w-sm items-center gap-x-4 rounded-xl bg-white p-6 shadow-lg outline outline-black/5 dark:bg-slate-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10">
            <div>
                <h1 className="text-xl font-large text-black dark:text-white">Login</h1>   
                <form onSubmit={login}>
                    <div className="max-w-sm mx-auto mt-5">
                        <label htmlFor="login-email" className="text-md font-normal text-black dark:text-white">Email</label>
                        <input
                            id='login-email' 
                            value={email} 
                            onChange={e => setEmail(e.target.value)}
                            type="email"
                            className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                    <div className="max-w-sm mx-auto mt-5">
                        <label htmlFor="login-password" className="text-md font-normal text-black dark:text-white">Password</label>
                        <input
                            id='login-password'
                            value={password} 
                            onChange={e => setPassword(e.target.value)}
                            type="password"
                            className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                    <button type='submit' className="mt-5 px-4 py-2 w-full bg-blue-500 text-white rounded-lg hover:bg-blue-600" >{"login"}</button>
                </form>              
            </div>
        </div>
    </>
    )
}

export default Login;