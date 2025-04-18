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
                console.log("hello");
                const response = await axios.get("https://ClassMap.onrender.com/getPrograms");
                //const response = await axios.get("https://127.0.0.1:5000/getPrograms");
                console.log("world");
                console.log("API response:", response.data);
                setPrograms(response.data);
            } catch (error) {
                console.error("Error fetching programs:", error);
            }
        };

        fetchPrograms();
    }, []);
    

    // const getUserInfo = async() => {
    //     //const response = await axios.get("https://127.0.0.1:5000/getPrograms", {});
    //     const response = await axios.get("https://ClassMap.onrender.com/getPrograms", {});

    //     return null;
    // }

    const fetchProgramClasses = async (programId) => {
        setLoading(true);
        try {
            //const response = await axios.get(`http://127.0.0.1:5000/getProgramClasses/${programId}`);
            const response = await axios.get(`https://ClassMap.onrender.com/getProgramClasses/${programId}`);

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
            // const response = await axios.post(
            //     `http://127.0.0.1:5000/generatePlan/${programId}`,
            //     {
            //         startSemester: "Spring", 
            //         startYear: 2025
            //     }
            // );
            const response = await axios.post(
                `https://ClassMap.onrender.com/generatePlan/${programId}`,
                {
                    startSemester: "Spring", 
                    startYear: 2025
                }
        );

            
            console.log("Generated plan:", response.data);
            setData(response.data);
            console.log("Program classes:", response.data);

        } catch (error) {
            console.error("Error generating plan:", error);
            setError("Failed to generate curriculum plan");
        }
    };

    const containerRef = useRef(null);

    const handleSavePdf = () => {
        if (containerRef.current) {
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
            generatePlan(selectedProgramObj.programid);
        } else {
            setProgramClasses([]);
        }
        
        console.log("Selected program:", programName);
    };

    // Helper function to sort semesters chronologically
    const sortSemesters = (semesters) => {
        const semesterOrder = {
            "Spring": 0,
            "Summer": 1,
            "Fall": 2
        };
        
        return semesters.sort((a, b) => {
            // Extract semester name and year
            const [semA, yearA] = a.split(" ");
            const [semB, yearB] = b.split(" ");
            
            // Compare years first
            if (yearA !== yearB) {
                return parseInt(yearA) - parseInt(yearB);
            }
            
            // If years are the same, compare semesters
            return semesterOrder[semA] - semesterOrder[semB];
        });
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
                    // Sort the semesters chronologically before mapping
                    sortSemesters(Object.keys(data)).map((semester) => (
                        <SemesterColumn
                            key={semester}
                            SemesterName={semester}
                            ClassCards={data[semester].map((c, index) => (
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