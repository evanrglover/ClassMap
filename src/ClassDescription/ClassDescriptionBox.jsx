import React, { useState } from 'react';
import styles from '../ClassCard/ClassCard.module.css'
import axios from "axios";
import { Navigate, useNavigate } from 'react-router-dom';

const ClassDescriptionBox = ({className, classDescription}) => {
    
    return(
        <div className = {styles['Container']}>
            <h2>{className}</h2>
            <p>{classDescription}</p>
        </div>
    )
}

export default ClassDescriptionBox;