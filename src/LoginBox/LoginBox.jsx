import React from 'react';
import styles from './LoginBox.module.css'
import { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from 'react-router-dom';

const Login = ({ setToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { school } = useParams();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      //local
      const response = await axios.post("http://127.0.0.1:5000/login", { email, password });
      //render
      //const response = await axios.post("https://ClassMap.onrender.com/login", { email, password });
      
      // Store token
      localStorage.setItem("token", response.data.access_token);
      
      // Get user info from the token
      const userData = JSON.parse(atob(response.data.access_token.split('.')[1]));
      const userId = userData.sub.UserID;
      const userName = response.data.name;
      console.log(userId);
      console.log(userName);
      
      // Store user info in localStorage for use across the app
      localStorage.setItem("userId", userId);
      localStorage.setItem("userName", userName);
      
      console.log("Login successful, navigating to homepage");
      navigate(`/${school}/${localStorage.getItem("userId")}/App`);
    } catch (err) {
      console.error(err);
      setError("Invalid credentials");
    }
  };

  return(
    <div className={styles['Container']}>
     <h1 className={styles.WelcomeText}>Welcome {school} student</h1>

      <div className={styles['InputGroup']}>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form onSubmit={handleLogin}>
          <input 
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit">Login</button>
        </form>
        <div className={styles['LoginOptions']}>
          <a href="#" className={styles['LoginOptions-Option']}><p>Forgot Password</p></a>
          <a href="#" className={styles['LoginOptions-Option']}><p>Create an Account</p></a>
        </div>
      </div>
    </div>
  );
}

export default Login;