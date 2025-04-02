import React from "react"
import styles from "../LoginPage/Login.module.css"
import LoginBox from "../LoginBox/LoginBox.jsx"
import SelectSchoolBox from "../SelectSchool/SelectSchoolBox.jsx";

function SelectSchool(){

    return(
        <div className={styles["container"]}>
            <SelectSchoolBox />
        </div>
    );
}

export default SelectSchool;