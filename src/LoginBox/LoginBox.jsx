import React from 'react';
import styles from './LoginBox.module.css'

function LoginBox(){
    return(
        <div className={styles['Container']}>
            <h1>Welcome</h1>
            <div className={styles['InputGroup']}>
            <form>
                <input type="text"
                id="email"
                name="email"
                placeholder="Email"
                required
                />
                <input type="text"
                id="password"
                name="password"
                placeholder="Password"
                required
                />
            </form>
            <button type="submit">Login</button>

            <div className={styles['LoginOptions']}>
                <a href="" className={styles['LoginOptions-Option']}><p>Forgot Password</p></a>
                <a href="" className={styles['LoginOptions-Option']}><p>Create an Account</p></a>
            </div>
            
            </div>
        </div>
    )
}

export default LoginBox;