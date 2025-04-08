import React from "react"
import styles from "../LoginPage/Login.module.css"
import LoginBox from "../LoginBox/LoginBox.jsx"

function Login(){

    return(
        <div className={styles["container"]}>
            <LoginBox />
        </div>
    );
}

export default Login;