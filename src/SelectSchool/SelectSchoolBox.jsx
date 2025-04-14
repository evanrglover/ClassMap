import React from 'react';
import styles from './SelectSchool.module.css'
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { Navigate, useNavigate } from 'react-router-dom';

const SelectSchool = ({setToken}) => {
    const [school, setSchool] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [universities, setUniversities] = useState([]);
    
        useEffect(() => {
            const fetchUniversities = async () => {
                try {
                    // const response = await axios.get("https://ClassMap.onrender.com/SelectSchool");
                    const response = await axios.get("http://127.0.0.1:5000/SelectSchool");
                    console.log("API response:", response.data);
                    setUniversities(response.data);
                } catch (error) {
                    console.error("Error fetching universities:", error);
                }
            };
    
            fetchUniversities();
        }, []);

        const handleNext = () => {
            if (!school) {
                setError("Please select a university.");
                return;
            }
            //navigate('$/{school}/login', { state: { selectedSchool: school } });  // 🔹 Pass school as state (optional)
            console.log("Selected school:", school);
            navigate(`/${school}/login`);
        };
    
    
   

    return(
        <div className={styles['Container']}>
            <h1>Select Your School</h1>
            <div className={styles['InputGroup']}>
                {error && <p style={{ color: "red" }}>{error}</p>}
                <select value={school} onChange={(e) => setSchool(e.target.value)}>
                    <option value="">Select a university</option>
                    {universities.map((university) => (
                        <option key={university.schoolid} value={university.name}>
                            {university.schoolname}
                        </option>
                    ))}
                </select>
                <button onClick={handleNext}>Next</button>
            </div>
        </div>
    )
}

export default SelectSchool;