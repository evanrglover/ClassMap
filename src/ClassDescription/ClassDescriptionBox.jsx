import React from 'react';
import styles from './LoginBox.module.css'
import { useState } from "react";
import axios from "axios";
import { Navigate, useNavigate } from 'react-router-dom';

const ClassDescriptionBox = ({setToken}) => {
    const [className, setClassName] = useState("");
    const [classNumber, setClassNumber] = useState("");
    const [classCreditHours, setClassCreditHours] = useState("");
    const [classDescription, setClassDescription] = useState("");

    return(
        <div className = {styles['Container']}>
            <h1>{className}</h1>
            <h2>{classNumber}</h2>
            <h2>{classCreditHours}</h2>
            <p>{classDescription}</p>
        </div>
    )
}

export default ClassDescriptionBox;