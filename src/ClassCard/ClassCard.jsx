import React from "react"
import styles from "./ClassCard.module.css"

function ClassCard(props){
    
        const bgColor = props.ReqType === "core"
        ? "var(--CORE-BG-COLOR)"
        : props.ReqType === "general"
        ? "var(--GEN-BG-COLOR)"
        : "var(--CARD-TEXT-COLOR)";  // Default BG color

        return(
        <>
            {/* <div className={styles["Card"]} style={{ backgroundColor: bgColor }}>
                <div style={{grid}}>
                    <h2 className={styles["Card-CourseId"]}>{props.ClassName}</h2>
                    <h3 className={styles["Card-CourseName"]}>{props.ClassDescription}</h3>
                </div>
            </div> */}

            <div className={styles["Card"]} style={{ backgroundColor: bgColor }}>
                <div className={styles["Card-Grid"]}>
                    {/* First row: Class Name and Description */}
                    <div className={styles["Card-Row"]}>
                        <h2 className={styles["Card-CourseId"]}>{props.ClassName}</h2>
                        <h3 className={styles["Card-CourseName"]}>{props.ClassDescription}</h3>
                    </div>
                    {/* Second row: Credits and Semesters */}
                    <div className={styles["Card-Row"]}>
                        <p className={styles["Card-Credits"]}>Credits: {props.Credits}</p>
                        <p className={styles["Card-Semesters"]}>Semesters: {props.Semesters}</p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ClassCard