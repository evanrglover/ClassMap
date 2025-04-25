import React from "react";
import styles from "./Drawer.module.css";
import { useDroppable } from "@dnd-kit/core";

function Drawer({ children, isOpen = true, toggleDrawer }) {
    const { isOver, setNodeRef } = useDroppable({ id: 'drawer' });

    return (
        <div className={`${styles.Drawer} ${isOpen ? styles.open : styles.closed}`}>
            <p>Available Classes</p>
            <button className={styles.toggleButton} onClick={toggleDrawer}>
                {isOpen ? "Hide Drawer" : "Show Drawer"}
            </button>
            <div ref={setNodeRef} className={styles.drawerContent}>
                {children}
            </div>
        </div>
    );
}

export default Drawer;