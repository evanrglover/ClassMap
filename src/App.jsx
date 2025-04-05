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
    const [selectedProgram, setSelectedProgram] = useState("");
    const [programClasses, setProgramClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({});
    
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

    // const data = {
    //     'Fall 2025': [
    //         { className: 'CS4400', description: 'Software Engineering 2' },
    //         { className: 'CS3200', description: 'Database Management' },
    //     ],
    //     'Spring 2026': [{ className: 'CS3500', description: 'Algorithms' }],
    //     'Fall 2026': [{ className: 'CS4100', description: 'Artificial Intelligence' }],
    // };

    const getUserInfo = async() => {
        const response = await axios.get("http://127.0.0.1:5000/getPrograms", {});
        return null;
    }

    const fetchProgramClasses = async (programId) => {
        setLoading(true);
        try {
            const response = await axios.get(`http://127.0.0.1:5000/getProgramClasses/${programId}`);
            //console.log("Program classes:", response.data);
            setProgramClasses(response.data);
        } catch (error) {
            console.error("Error fetching program classes:", error);
            setError("Failed to load classes for this program");
        } finally {
            setLoading(false);
        }
    };

    const generatePlan = async (programId) => {
        try {
            const response = await axios.post(
                `http://127.0.0.1:5000/generatePlan/${programId}`,
                {
                    startSemester: "Spring",  // You can make these configurable with UI inputs
                    startYear: 2025
                }
            );
            
            console.log("Generated plan:", response.data);
            setData(response.data);  // Assuming you have a state variable called 'data'
            console.log("Program classes:", response.data);

        } catch (error) {
            console.error("Error generating plan:", error);
            setError("Failed to generate curriculum plan");
        }
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

    const handleProgramChange = (e) => {
        const programName = e.target.value;
        setSelectedProgram(programName);
        
        // Find the selected program ID
        const selectedProgramObj = programs.find(p => p.programname === programName);
        if (selectedProgramObj) {
            fetchProgramClasses(selectedProgramObj.programid);
            generatePlan(selectedProgramObj.programid);  // Add this line
        } else {
            setProgramClasses([]);
        }
        
        console.log("Selected program:", programName);
    };

    return (
        <>
            <h1>Welcome {localStorage.getItem("userName")} </h1>
            <div className={styles['InputGroup'] }>
                {error && <p style={{ color: "red" }}>{error}</p>}
                <select value={selectedProgram} onChange={handleProgramChange}>
                    <option value="">Select a Program</option>
                    {programs.map((program) => (
                        <option key={program.programid} value={program.programname}>
                            {program.programname}
                        </option>
                    ))}
                </select>
                {loading && <p>Loading classes...</p>}
            </div>
            <SemesterColumnContainer className="SemesterColumnContainer" ref={containerRef}>
                {Object.entries(data).length > 0 ? (
                    Object.entries(data).map(([semester, classes]) => (
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
                    ))
                ) : (
                    <p>Select a program to generate a curriculum plan</p>
                )}
            </SemesterColumnContainer>
            <SaveButton onClick={handleSavePdf} />
            <Drawer>
                <h2>Available Classes for {selectedProgram}</h2>
                <div className="available-classes">
                    {programClasses.length > 0 ? (
                        programClasses.map((cls) => (
                            <ClassCard
                                key={cls.classid}
                                ClassName={`${cls.department} ${cls.number}`}
                                ClassDescription={cls.title}
                                Credits={cls.credits}
                                Semesters={Array.isArray(cls.semesters) ? cls.semesters.join(', ') : ''}
                                PreReqs={cls.prerequisites.join(', ')}
                            />
                        ))
                    ) : (
                        <p>{selectedProgram ? "No classes found for this program" : "Select a program to view available classes"}</p>
                    )}
                </div>
            </Drawer>
        </>
    );
}

export default App;