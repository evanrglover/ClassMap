import React from 'react';
import { useState, useRef, useEffect } from 'react';
import styles from './LoginBox/LoginBox.module.css'
import axios from "axios";

import ClassCard from './ClassCard/ClassCard.jsx';
import ClassTable from './ClassTable/ClassTable.jsx';
import LoginPage from './pages/Login.jsx';
import Login from './pages/Login.jsx';
import Drawer from './Drawer/Drawer.jsx';
import SemesterColumn from './SemesterColumn/SemesterColumn.jsx';
import SemesterColumnContainer from './SemesterColumnContainer/SemesterColumn.jsx';
import SaveButton from './SaveButton/SaveButton.jsx';
import html2pdf from 'html2pdf.js'; // Import html2pdf
import { useNavigate, useParams } from 'react-router-dom';

function App() {
    const { school, user } = useParams();
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [programs, setPrograms] = useState([]);
    const [selectedProgram, setSelectedProgram] = useState(""); // Fixed program state
    
    //gets the program for the programs dropdown
    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                // const response = await axios.get("https://ClassMap.onrender.com/SelectSchool");
                const response = await axios.get("http://127.0.0.1:5000/getPrograms");
                console.log("API response:", response.data);
                setPrograms(response.data);
            } catch (error) {
                console.error("Error fetching programs:", error);
            }
        };

        fetchPrograms();
    }, []);
    
    useEffect(() => {
        getUserInfo();
    }, []);

    // Sample data for semesters and classes
    const data = {
        'Fall 2025': [
            { className: 'CS4400', description: 'Software Engineering 2' },
            { className: 'CS3200', description: 'Database Management' },
        ],
        'Spring 2026': [{ className: 'CS3500', description: 'Algorithms' }],
        'Fall 2026': [{ className: 'CS4100', description: 'Artificial Intelligence' }],
    };

    const getUserInfo = async() => {
        const response = await axios.get("http://127.0.0.1:5000/getPrograms", {});
        return null;
    }

    const containerRef = useRef(null); // Create a ref

    //saves the schedule as a pdf
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

    //handles the program change
    const handleProgramChange = (e) => {
        setSelectedProgram(e.target.value);
        console.log("Selected program:", e.target.value);
    };

    return (
        <>
            <h1>Welcome {localStorage.getItem("userName")} </h1>
            <div className={styles['InputGroup']}>
                {error && <p style={{ color: "red" }}>{error}</p>}
                <select value={selectedProgram} onChange={handleProgramChange}>
                    <option value="">Select a Program</option>
                    {programs.map((program) => (
                        <option key={program.programid} value={program.programname}>
                            {program.programname}
                        </option>
                    ))}
                </select>
            </div>
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
            <Drawer>
            </Drawer>
        </>
    );
}

export default App;