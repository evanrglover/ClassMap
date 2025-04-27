import React, { useRef } from "react";
import styles from "./Drawer.module.css";
import { useDroppable } from "@dnd-kit/core";

function Drawer({ children, isOpen = true, toggleDrawer }) {
    const { isOver, setNodeRef } = useDroppable({ id: 'drawer' });
    const drawerRef = useRef(null);
    
    // Combines both refs
    const setRefs = (element) => {
        drawerRef.current = element;
        setNodeRef(element);
    };

    return (
        <div 
            ref={setRefs} 
            className={`${styles.Drawer} ${isOpen ? styles.open : styles.closed}`}
        >
            <div className={styles.drawerHeader}>
                <h3>Available Classes</h3>
                <button className={styles.toggleButton} onClick={toggleDrawer}>
                    {isOpen ? "Hide Drawer" : "Show Drawer"}
                </button>
            </div>
            <div className={styles.drawerContent}>
                {children}
            </div>
        </div>
    );
}

export default Drawer;