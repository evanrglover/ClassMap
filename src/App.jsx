import React from 'react';
import { useState, useRef } from 'react';
import ClassCard from './ClassCard/ClassCard.jsx';
import ClassTable from './ClassTable/ClassTable.jsx';
import LoginPage from './pages/Login.jsx';
import Login from './pages/Login.jsx';
import Drawer from './Drawer/Drawer.jsx';
import { DndContext, closestCorners } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import SemesterColumn from './SemesterColumn/SemesterColumn.jsx';
import SemesterColumnContainer from './SemesterColumnContainer/SemesterColumn.jsx';
import SaveButton from './SaveButton/SaveButton.jsx';
import html2pdf from 'html2pdf.js'; // Import html2pdf

function App() {
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const data = {
        'Fall 2025': [
            { id: 'CS4400', className: 'CS4400', description: 'Software Engineering 2' },
            { id: 'CS3200', className: 'CS3200', description: 'Database Management' },
        ],
        'Spring 2026': [{ id: 'CS3500', className: 'CS3500', description: 'Algorithms' }],
        'Fall 2026': [{ id: 'CS4100', className: 'CS4100', description: 'Artificial Intelligence' }],
    };
    const [semesters, setSemesters] = useState(data);

    const [drawerClasses, setDrawerClasses] = useState([
        { id: 'CS4450', className: 'CS4450', description: 'Analysis of ProgLang' }
    ]);

    const containerRef = useRef(null); // Create a ref

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;

        const sourceSemester = Object.keys(semesters).find((key) =>
            semesters[key].some((c) => c.id === active.id)
        ) || 'drawer';

        const targetSemester = over.id;

        if (sourceSemester === targetSemester) return;

        let newSemesters = { ...semesters };
        let movedClass;

        if (sourceSemester === 'drawer') {
            movedClass = drawerClasses.find((c) => c.id === active.id);
            setDrawerClasses(drawerClasses.filter((c) => c.id !== active.id));
        } else {
            movedClass = newSemesters[sourceSemester].find((c) => c.id === active.id);
            if (!movedClass) {
                console.warn("Could not find moved class", active.id);
                return;
            }
        newSemesters[sourceSemester] = newSemesters[sourceSemester].filter(
            (c) => c.id !== active.id
        );
    }

    newSemesters[targetSemester] = [...(newSemesters[targetSemester] || []), movedClass];
    setSemesters(newSemesters);
};

    const handleSavePdf = () => {
        if (containerRef.current) { // Use containerRef.current
            const opt = {
                margin: 1,
                filename: 'schedule.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' },
            };

            html2pdf().from(containerRef.current).set(opt).save();
        } else {
            console.error('SemesterColumnContainer not found.');
        }
    };

    return (
        <>
            <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>

                <SemesterColumnContainer className="SemesterColumnContainer" ref={containerRef}>
                    {Object.entries(semesters).map(([semester, classes]) => (
                        <SemesterColumn
                            key={semester}
                            SemesterName={semester}
                            id={semester}
                            ClassCards={classes.map((c, index) => (
                                <ClassCard
                                    key={c.id || c.className}
                                    ClassName={c.className}
                                    ClassDescription={c.description}
                                    id={c.id}
                                />
                            ))}
                        />
                    ))}
                </SemesterColumnContainer>

                <SaveButton onClick={handleSavePdf} />
                
                <Drawer>
                    {drawerClasses.map((c, index) => (
                        <ClassCard
                            key={c.id || index}
                            ClassName={c.className}
                            ClassDescription={c.description}
                            id={c.id || `${index}`}
                        />
                    ))}
                </Drawer>
            </DndContext>
        </>
    );
}

export default App;
