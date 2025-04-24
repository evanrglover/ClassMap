import React, { useRef, useEffect } from "react";
import styles from "./Drawer.module.css";

function Drawer({ children, isOpen = true }) {
    const drawerRef = useRef(null);

    let startY = 0;
    let startTop = 0;

    const startDrag = (e) => {
        e.preventDefault();
        startY = e.touches ? e.touches[0].clientY : e.clientY;
        startTop = drawerRef.current.getBoundingClientRect().top;
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchmove', onDrag);
        document.addEventListener('touchend', endDrag);
    };

    const onDrag = (e) => {
        const currentY = e.touches ? e.touches[0].clientY : e.clientY;
        const deltaY = currentY - startY;
        let newTop = startTop + deltaY;

        // Limit dragging area
        const maxTop = window.innerHeight - 100;
        const minTop = 50;
        newTop = Math.max(minTop, Math.min(newTop, maxTop));

        drawerRef.current.style.top = `${newTop}px`;
    };

    const endDrag = () => {
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', endDrag);
        document.removeEventListener('touchmove', onDrag);
        document.removeEventListener('touchend', endDrag);
    };

    return (
        <div ref={drawerRef} className={`${styles.drawer} ${isOpen ? styles.open : ''}`}>
            <div className={styles.handle} onMouseDown={startDrag} onTouchStart={startDrag} />
            <div className={styles.drawerContent}>
                {children}
            </div>
        </div>
    );
}

export default Drawer;
