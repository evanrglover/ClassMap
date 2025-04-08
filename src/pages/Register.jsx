import React from "react"
import styles from "../LoginPage/Login.module.css"
import LoginBox from "../LoginBox/LoginBox.jsx"

function Register(){

    return(
        <div className={styles["container"]}>
            <LoginBox />
        </div>
    );
}

export default Register;