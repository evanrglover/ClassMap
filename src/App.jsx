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
import { DndContext, closestCorners } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';

function App() {
    const { school, user } = useParams();
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [programs, setPrograms] = useState([]);
    const [selectedProgram, setSelectedProgram] = useState("");
    const [selectedProgramId, setSelectedProgramId] = useState("");
    const [programClasses, setProgramClasses] = useState([]);
    const [availableDrawerClasses, setAvailableDrawerClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({});
    
    // API base URL - change as needed
    const API_BASE_URL = "http://127.0.0.1:5000";
    // const API_BASE_URL = "https://ClassMap.onrender.com";
    
    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                console.log("Fetching programs...");
                const response = await axios.get(`${API_BASE_URL}/getPrograms`);
                console.log("API response:", response.data);
                setPrograms(response.data);
            } catch (error) {
                console.error("Error fetching programs:", error);
                setError("Failed to load programs");
            }
        };

        fetchPrograms();
    }, []);
    
    const handleDragEnd = (event) => {
        const { active, over } = event;
    
        if (!over || active.id === over.id) return;
    
        // Check if we're dragging from drawer to semester
        if (active.id.startsWith('drawer-') && over.id.startsWith('semester-')) {
            // Extract the real class ID and semester ID
            const classId = active.id.replace('drawer-', '');
            const targetSemester = over.id.replace('semester-', '');
            
            // Find the class in the drawer
            const classObj = availableDrawerClasses.find(c => c.className === classId);
            if (!classObj) return;
            
            // Add to semester
            const targetItems = [...(data[targetSemester] || [])];
            
            // Prevent duplicates
            if (targetItems.some(cls => cls.className === classId)) return;
            
            // Add class to semester
            targetItems.push({
                ...classObj,
                id: classId  // Ensure it has an ID for dragging
            });
            
            // Update data state
            setData({
                ...data,
                [targetSemester]: targetItems
            });
            
            // Remove from available drawer classes
            setAvailableDrawerClasses(prev => 
                prev.filter(c => c.className !== classId)
            );
            
            return;
        }
        
        // Handle movement between semesters
        const sourceSemester = Object.keys(data).find((semester) =>
            data[semester].some((cls) => cls.id === active.id || cls.className === active.id)
        );
        const targetSemester = over.id.replace('semester-', '');
    
        if (!sourceSemester || !targetSemester) return;
    
        // Don't do anything if dragging into same column
        if (sourceSemester === targetSemester) return;
    
        const sourceItems = [...data[sourceSemester]];
        const targetItems = [...(data[targetSemester] || [])];
    
        // Find the moved item
        const movedItemIndex = sourceItems.findIndex(
            (cls) => cls.id === active.id || cls.className === active.id
        );
        if (movedItemIndex === -1) return;
    
        const [movedItem] = sourceItems.splice(movedItemIndex, 1);
        
        // Prevent duplicates
        if (targetItems.some(cls => 
            cls.id === movedItem.id || 
            cls.className === movedItem.className ||
            cls.id === movedItem.className || 
            cls.className === movedItem.id
        )) return;
        
        targetItems.push(movedItem);
    
        setData({
            ...data,
            [sourceSemester]: sourceItems,
            [targetSemester]: targetItems,
        });
    };

    // Handle removing a class from semester back to drawer
    const handleRemoveFromSemester = (semesterName, classId) => {
        // Make sure the semester exists
        if (!data[semesterName]) return;
        
        // Find the class in the semester
        const classIndex = data[semesterName].findIndex(
            c => c.id === classId || c.className === classId
        );
        if (classIndex === -1) return;
        
        // Get class object
        const classObj = data[semesterName][classIndex];
        
        // Remove from semester
        const updatedSemester = [...data[semesterName]];
        updatedSemester.splice(classIndex, 1);
        
        // Update data state
        setData({
            ...data,
            [semesterName]: updatedSemester
        });
        
        // Add back to drawer if not already there
        const isInDrawer = availableDrawerClasses.some(
            c => c.className === classId || c.className === classObj.className
        );
        
        if (!isInDrawer) {
            setAvailableDrawerClasses(prev => [...prev, classObj]);
        }
    };

    const fetchProgramClasses = async (programId) => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/getProgramClasses/${programId}`);
            setProgramClasses(response.data);
            
            // Also fetch the drawer classes
            fetchAvailableDrawerClasses(programId);
        } catch (error) {
            console.error("Error fetching program classes:", error);
            setError("Failed to load classes for this program");
        } finally {
            setLoading(false);
        }
    };
    
    const fetchAvailableDrawerClasses = async (programId) => {
        try {
            // Set up headers with token if available
            const config = {};
            if (token) {
                config.headers = {
                    Authorization: `Bearer ${token}`
                };
            }
            
            const response = await axios.get(`${API_BASE_URL}/getAvailableDrawerClasses/${programId}`, config);
            setAvailableDrawerClasses(response.data);
        } catch (error) {
            console.error("Error fetching available drawer classes:", error);
            // Don't set error state here as this might be called before the drawer is populated
        }
    };

    const generatePlan = async (programId) => {
        try {
            // Set up headers with token if available
            const config = {};
            if (token) {
                config.headers = {
                    Authorization: `Bearer ${token}`
                };
            }
            
            const response = await axios.post(
                `${API_BASE_URL}/generatePlan/${programId}`,
                {
                    startSemester: "Spring", 
                    startYear: 2025
                },
                config
            );
            
            console.log("Generated plan:", response.data);
            const newData = {};
            Object.entries(response.data).forEach(([semester, classes]) => {
                newData[semester] = classes.map((cls) => ({
                    ...cls,
                    id: cls.className // Ensure unique ID
                }));
                console.log(`Assigning IDs for semester ${semester}:`);
                classes.forEach((cls) => {
                    console.log(` -> ${cls.className}`);
                });
            });
            
            setData(newData);
            console.log("Program classes:", response.data);
            
            // After generating the plan, fetch the updated available drawer classes
            fetchAvailableDrawerClasses(programId);

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
            const programId = selectedProgramObj.programid;
            setSelectedProgramId(programId);
            fetchProgramClasses(programId);
            generatePlan(programId);
        } else {
            setProgramClasses([]);
            setAvailableDrawerClasses([]);
            setData({});
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

    // Get all scheduled class names from the generated plan
    const scheduledClassNames = new Set(
        Object.values(data).flat().map(c => c.className)
    );

    // Filter the drawer classes to take out the ones in the schedule
    const availableDrawerClasses = programClasses.filter(
        cls => !scheduledClassNames.has(`${cls.department} ${cls.number}`)
    );

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
           {/*  <SaveButton onClick={handleSavePdf} /> */}
            <Drawer>
                <h2>Available Classes for {selectedProgram}</h2>
                <div className={styles["available-classes"]}>
                    {programClasses.length > 0 ? (
                        availableDrawerClasses.map((cls) => (
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