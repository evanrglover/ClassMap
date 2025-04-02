import React from "react"
import styles from "../LoginPage/Login.module.css"
import ClassDescription from "../ClassDescription/ClassDescriptionBox.jsx";

function ClassDescription(){

    return(
        <div className={styles["container"]}>
            <ClassDescriptionBox />
        </div>
    );
}

export default ClassDescription;