import React from "react";
import styles from "./Drawer.module.css";

function Drawer({ children, isOpen = true }) {
    return (
        <div className={`${styles.drawer} ${isOpen ? styles.open : ''}`}>
            <div className={styles.drawerContent}>
                {children}
            </div>
        </div>
    );
}

export default Drawer;