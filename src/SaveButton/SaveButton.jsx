import React from "react";
import styles from "./SaveButton.module.css"

function SaveButton({onClick}){
    return(
        <>
            <button className={styles['SaveButton']} onClick={onClick}>Save Schedule</button>
        </>
    )
}

export default SaveButton;