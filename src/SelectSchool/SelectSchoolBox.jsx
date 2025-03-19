import React from 'react';
import styles from '../LoginBox/LoginBox.module.css'
import { useState } from "react";
import axios from "axios";
import { Navigate, useNavigate } from 'react-router-dom';

const SelectSchool = ({setToken}) => {
    const [school, setSchool] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    
    const handleSelectSchool = async (e) => {
        e.preventDefault();
        try {
          //local
          //const response = await axios.post("http://127.0.0.1:5000/login", { email, password });
          //render
          //const response = await axios.post("https://ClassMap.onrender.com/login", { email, password });
          //console.log(response);
          
          // Store token
          // setToken(response.data.access_token);
          // localStorage.setItem("token", response.data.access_token);
          //localStorage.setItem("token", response.data.access_token);
          
          console.log("SelectSchool successful, navigating to next page");
          navigate("/login");
        } catch (err) {
          console.error(err);
          setError("Invalid credentials");
        }
    };

    return(
        <div className={styles['Container']}>
            <h1>Select Your School</h1>
            <div className={styles['InputGroup']}>
                {error && <p style={{ color: "red" }}>{error}</p>}
                <form onSubmit={handleSelectSchool}>
                    <input type="school"
                    id="school"
                    name="school"
                    placeholder="School"
                    value = {school}
                    onChange = {(e) => setSchool(e.target.value)}
                    required
                    />
                <button type="submit">Next</button>
                </form>
            </div>
        </div>
    )
}

export default SelectSchool;