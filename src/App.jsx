import React from 'react';
import { useState, useRef } from 'react';
import ClassCard from './ClassCard/ClassCard.jsx';
import ClassTable from './ClassTable/ClassTable.jsx';
import LoginPage from './pages/Login.jsx';
import Login from './pages/Login.jsx';
import SemesterColumn from './SemesterColumn/SemesterColumn.jsx';
import SemesterColumnContainer from './SemesterColumnContainer/SemesterColumn.jsx';
import SaveButton from './SaveButton/SaveButton.jsx';
import html2pdf from 'html2pdf.js'; // Import html2pdf
import { useNavigate, useParams } from 'react-router-dom';


function App() {
    const { school, user} = useParams();
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const data = {
        'Fall 2025': [
            { className: 'CS4400', description: 'Software Engineering 2' },
            { className: 'CS3200', description: 'Database Management' },
        ],
        'Spring 2026': [{ className: 'CS3500', description: 'Algorithms' }],
        'Fall 2026': [{ className: 'CS4100', description: 'Artificial Intelligence' }],
    };

    const containerRef = useRef(null); // Create a ref

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
            <h1>Welcome {localStorage.getItem("userName")} </h1>
            <SemesterColumnContainer className="SemesterColumnContainer" ref={containerRef}>
                {Object.entries(data).map(([semester, classes]) => (
                    <SemesterColumn
                        key={semester}
                        SemesterName={semester}
                        ClassCards={classes.map((c, index) => (
                            <ClassCard
                                key={index}
                                ClassName={c.className}
                                ClassDescription={c.description}
                            />
                        ))}
                    />
                ))}
            </SemesterColumnContainer>
            <SaveButton onClick={handleSavePdf} />
        </>
    );
}

export default App;
