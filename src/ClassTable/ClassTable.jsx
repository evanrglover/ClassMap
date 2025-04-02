<<<<<<< HEAD
import React from 'react'
=======
import React from "react"
>>>>>>> tylers_branch
import styles from './ClassTable.module.css';

function ClassTable({ columns, data }) {
    
    return (
        <table className={styles['ClassTable']}>
            <thead className={styles['ClassTable__Title']}>
                <tr>
                    {columns.map((col, index) => (
                        <th key={index}>{col}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {columns.map((col, colIndex) => (
                            <td key={colIndex}>{row[col]}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

<<<<<<< HEAD
export default ClassTable;
=======
export default ClassTable;
>>>>>>> tylers_branch
