import React from "react";
import styles from "./Drawer.module.css";

function Drawer({ children, isOpen = true, toggleDrawer }) {

    return (
        <div className={`${styles.Drawer} ${isOpen ? styles.open : styles.closed}`}>
            <p>Available Classes</p>
            <button className={styles.toggleButton} onClick={toggleDrawer}>
                {isOpen ? "Hide Drawer" : "Show Drawer"}
            </button>
            <div className={styles.drawerContent}>
                {children}
            </div>
        </div>
    );
}

export default Drawer;