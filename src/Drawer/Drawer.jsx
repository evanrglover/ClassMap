import React from 'react';
import styles from './Drawer.module.css';

function Drawer({ children }) {
    return (
    <div className={styles.container}>{children}</div>
    )
}

export default Drawer;
