import React from "react";
import styles from "./SemesterColumnContainer.module.css";

function SemesterColumnContainer({children}){
    return(
        <>
            <div className={styles['SemesterColumnContainer']}>
                {children}
            </div>
        </>
    )
}

export default SemesterColumnContainer;