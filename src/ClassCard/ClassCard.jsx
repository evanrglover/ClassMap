import React, { useState } from 'react';
import styles from "./ClassCard.module.css"
import { useDraggable } from '@dnd-kit/core';
import ReactCardFlip from "react-card-flip";
import ClassDescription from "../ClassDescription/ClassDescriptionBox"

function ClassCard(props){
        const [isFlipped, setIsFlipped] = useState(false);


        const prereqs = [props.PreReqs];
        const postreqs = [props.PostReqs];

        const { attributes, listeners, setNodeRef, transform } = useDraggable({
            id: props.ClassName
        });

        const style = transform
        ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
        : undefined;
    
        const bgColor = props.ReqType === "core"
        ? "var(--CORE-BG-COLOR)"
        : props.ReqType === "general"
        ? "var(--GEN-BG-COLOR)"
        : "var(--NO-REQTYPE-BG-COLOR)";  // Default BG color for now.

        function flipCard() {
            setIsFlipped(!isFlipped);
        }
        
        return(
        <>
            #The Flipping Card
            <div ref={setNodeRef} {...listeners} {...attributes} className={styles["Card"]} style={{ backgroundColor: bgColor }}>
                <ReactCardFlip flipDirection="horizontal" isFlipped={isFlipped}>
                    <div className='card' onClick={flipCard}>
                        <h2 className={styles["Card-CourseId"]}>{props.ClassName}</h2>
                        <h3 className={styles["Card-CourseName"]}>{props.ClassDescription}</h3>
                        <p className={styles["Card-Credits"]}>Credits: {props.Credits}</p>
                        <p className={styles["Card-Semesters"]}>Semesters: {props.Semesters}</p>

                        <div className={styles["Card-Grid"]}>
                            {/* First row: Class Name and Description */}
                            <div className={styles["Card-Row"]}>
                            </div>
                            {/* Second row: Credits and Semesters */}
                            <div className={styles["Card-Row"]}>
                            </div>
                        </div>
                    </div>
                    <div className='card card-back' onClick={flipCard}>
                        {/*back of card here*/}
                        <ClassDescription
                            className = {props.ClassName}
                            ClassDescription = {props.ClassDescription}
                        />
                    </div>
                </ReactCardFlip>
            </div>
        </>
    )
}

export default ClassCard