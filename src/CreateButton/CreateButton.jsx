import React from "react";
import styles from "./CreateButton.module.css"

function CreateButton({onClick}){
    return(
        <>
            <button className={styles['CreateButton']} onClick={onClick}>Create Schedule</button>
        </>
    )
}

export default CreateButton;