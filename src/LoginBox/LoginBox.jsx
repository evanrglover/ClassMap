import React from 'react';
import styles from './LoginBox.module.css'
import { useState } from "react";
import axios from "axios";
import { Navigate, useNavigate } from 'react-router-dom';

const Login = ({ setToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:5000/login", { email, password });
      console.log(response);
      
      // Store token
      // setToken(response.data.access_token);
      // localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("token", response.data.access_token);
      
      console.log("Login successful, navigating to homepage");
      navigate("/App");
    } catch (err) {
      console.error(err);
      setError("Invalid credentials");
    }
  
  };
    return(
        <div className={styles['Container']}>
            <h1>Welcome</h1>
            <div className={styles['InputGroup']}>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleLogin}>
                <input type="email"
                id="email"
                name="email"
                placeholder="Email"
                value = {email}
                onChange = {(e) => setEmail(e.target.value)}
                required
                />
                <input type="password"
                id="password"
                name="password"
                value = {password}
                onChange = {(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                />
              <button type="submit">Login</button>
            </form>

            <div className={styles['LoginOptions']}>
                <a href="" className={styles['LoginOptions-Option']}><p>Forgot Password</p></a>
                <a href="" className={styles['LoginOptions-Option']}><p>Create an Account</p></a>
            </div>
            
            </div>
        </div>
    )
}

export default Login;