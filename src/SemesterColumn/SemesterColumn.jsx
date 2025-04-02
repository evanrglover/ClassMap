import React from "react";
import styles from "./SemesterColumn.module.css"

function SemesterColumn({SemesterName, ClassCards}){
    return(
        <>
            <div className={styles['SemesterColumn']}>
                <h2>{SemesterName}</h2>
                {ClassCards}
            </div>
        </>
    )
}

export default SemesterColumn;