import React from "react";
import styles from "./SemesterColumn.module.css";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";

function SemesterColumn({SemesterName, ClassCards}){

    const { setNodeRef } = useDroppable({
        id: SemesterName
    });

    return(
        <>
            <div ref={setNodeRef} className={styles['SemesterColumn']}>
                <h2>{SemesterName}</h2>
                <SortableContext items={ClassCards.map(card => card.props.id)}>
                    {ClassCards}
                </SortableContext>
            </div>
        </>
    )
}

export default SemesterColumn;