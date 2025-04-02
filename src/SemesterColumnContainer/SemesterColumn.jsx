import React, { forwardRef } from "react";
import styles from "./SemesterColumnContainer.module.css";

const SemesterColumnContainer = forwardRef(({ children, className, ...rest }, ref) => {
    return (
        <div className={`${styles['SemesterColumnContainer']} ${className || ''}`} ref={ref} {...rest}>
            {children}
        </div>
    );
});

export default SemesterColumnContainer;