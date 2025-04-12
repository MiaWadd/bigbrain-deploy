import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Register({ successJob, token }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate('/home');
    }
  }, [token, navigate]);

  const register = async () => {
    e.preventDefault();
    // Error checking
    if (password !== confirmPassword) {
      alert("Password's do not match");
      return;
    }
    try {
      console.log("registering user");
      const response = await axios.post(`http://localhost:5005/admin/auth/register`, {
        email: email,
        password: password,
        name: name
      });
      const token = response.data.token;
      successJob(token);
    } catch (err) {
      console.log("failed to register user");
      console.log(err);
      alert(err.response.data.error);
    }
  }
  return (
    <>
      <div className="mt-10 mx-auto flex max-w-sm items-center gap-x-4 rounded-xl bg-white p-6 shadow-lg outline outline-black/5 dark:bg-slate-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10">
        <div className='w-full'>
          <h1 className="text-3xl text-center font-large text-black dark:text-white">Register</h1>  
          <form onSubmit={register}>
            <div className="max-w-sm mx-auto mt-5">
              <label className="text-md font-normal text-black dark:text-white">Email</label>
              <input
                value={email} 
                onChange={e => setEmail(e.target.value)}
                required
                type="email"
                className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="max-w-sm mx-auto mt-5">
              <label className="text-md font-normal text-black dark:text-white">Name</label>
              <input
                value={name} 
                onChange={e => setName(e.target.value)}
                required
                type="text"
                className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="max-w-sm mx-auto mt-5">
              <label className="text-md font-normal text-black dark:text-white">Password</label>
              <input
                value={password} 
                onChange={e => setPassword(e.target.value)}
                required
                type="password"
                className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="max-w-sm mx-auto mt-5">
              <label className="text-md font-normal text-black dark:text-white">Confirm Password</label>
              <input
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)}
                required
                type="password"
                className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button type='submit' className="mt-6 px-4 py-2 w-full bg-blue-500 text-white rounded-lg hover:bg-blue-600" >{"Register"}</button>
          </form> 
          <p className="mt-5 text-center text-md font-normal text-black dark:text-white">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-500 hover:underline hover:text-blue-700">Login</Link>
          </p>               
        </div>
      </div>
    </>
  )
}

export default Register;