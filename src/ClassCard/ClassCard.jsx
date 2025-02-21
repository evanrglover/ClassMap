import styles from "./ClassCard.module.css"

function ClassCard(props){
    return(
        <>
            <div className={styles["Card"]}>
                <h2 className={styles["Card-CourseId"]}>{props.ClassName}</h2>
                <h3 className={styles["Card-CourseName"]}>{props.ClassDescription}</h3>
                
            </div>
        </>
    )
}

export default ClassCard