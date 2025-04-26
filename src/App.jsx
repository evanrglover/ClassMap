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
    
    // New state for schedules
    const [schedules, setSchedules] = useState([]);
    const [selectedSchedule, setSelectedSchedule] = useState("");
    const [selectedScheduleId, setSelectedScheduleId] = useState("");
    
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
        
        // Fetch existing schedules for this user
        const fetchSchedules = async () => {
            const userId = localStorage.getItem('userId');
            if (userId) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/getSchedules/${userId}`);
                    console.log("Schedules response:", response.data);
                    setSchedules(response.data);
                } catch (error) {
                    console.error("Error fetching schedules:", error);
                }
            }
        };
        
        fetchSchedules();
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
            console.log(`Fetching classes for program ID: ${programId}`);
            const response = await axios.get(`${API_BASE_URL}/getProgramClasses/${programId}`);
            console.log("Program classes response:", response.data);
            
            // Process the classes to ensure consistent format
            const formattedClasses = response.data.map(cls => ({
                ...cls,
                className: `${cls.department} ${cls.number}`,
                description: cls.title
            }));
            
            setProgramClasses(formattedClasses);
            
            // Directly set the drawer classes since we haven't generated a plan yet
            setAvailableDrawerClasses(formattedClasses);
        } catch (error) {
            console.error("Error fetching program classes:", error);
            setError("Failed to load classes for this program");
        } finally {
            setLoading(false);
        }
    };
    
    const fetchAvailableDrawerClasses = async (programId) => {
        // This function is only used after a plan is generated
        try {
            // Set up headers with token if available
            const config = {};
            if (token) {
                config.headers = {
                    Authorization: `Bearer ${token}`
                };
            }
            
            const response = await axios.get(`${API_BASE_URL}/getAvailableDrawerClasses/${programId}`, config);
            console.log("Available drawer classes response:", response.data);
            
            // Format the drawer classes to ensure consistency
            const formattedDrawerClasses = response.data.map(cls => {
                // Handle both formats from the two different endpoints
                return {
                    ...cls,
                    className: cls.className || `${cls.department} ${cls.number}`,
                    description: cls.description || cls.title
                };
            });
            
            setAvailableDrawerClasses(formattedDrawerClasses);
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

    // New function to load schedule from saved schedule
    const loadSchedule = async (scheduleId) => {
        setLoading(true);
        try {
            console.log(`Loading schedule ID: ${scheduleId}`);
            const response = await axios.get(`${API_BASE_URL}/getScheduleClasses/${scheduleId}`);
            console.log("Schedule classes response:", response.data);
            
            // Set the data directly from the response
            setData(response.data);
            
            // Find program ID for this schedule to update available drawer classes
            const schedule = schedules.find(s => s.scheduleId === scheduleId);
            if (schedule) {
                setSelectedProgramId(schedule.programId);
                setSelectedProgram(schedule.programName);
                
                // Fetch available drawer classes for this program
                fetchAvailableDrawerClasses(schedule.programId);
            }
        } catch (error) {
            console.error("Error loading schedule:", error);
            setError("Failed to load schedule");
        } finally {
            setLoading(false);
        }
    };
    

    const handleGenerateClick = () => {
        if (selectedProgramId) {
            setLoading(true);
            generatePlan(selectedProgramId)
                .finally(() => setLoading(false));
        } else {
            setError("Please select a program first");
        }
    };

    const containerRef = useRef(null);

    const handleSavePdf = async() => {

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
    const handleSaveSchedule = async () => {
        if (!selectedProgramId || Object.keys(data).length === 0) {
            setError("Cannot save empty schedule");
            return;
        }
    
        try {
            // Get user ID from localStorage
            const userId = localStorage.getItem('userId');
            if (!userId) {
                setError("You must be logged in to save schedules");
                return;
            }
    
            // Ask user for a schedule name if it's a new schedule
            let scheduleName = selectedSchedule;
            if (!selectedScheduleId) {
                const userInput = prompt("Enter a name for this schedule:", 
                                        `${selectedProgram} Plan`);
                if (!userInput) return; // User cancelled
                scheduleName = userInput;
            }
    
            const response = await axios.post(`${API_BASE_URL}/saveSchedule`, {
                userId: userId,
                programId: selectedProgramId,
                scheduleName: scheduleName,
                scheduleId: selectedScheduleId || null,
                semesterData: data
            });
    
            console.log("Save response:", response.data);
            
            // Update the scheduleId if this was a new schedule
            if (!selectedScheduleId) {
                setSelectedScheduleId(response.data.scheduleId);
                setSelectedSchedule(scheduleName);
                
                // Refresh the schedules list
                const schedulesResponse = await axios.get(`${API_BASE_URL}/getSchedules/${userId}`);
                setSchedules(schedulesResponse.data);
            }
            
            alert("Schedule saved successfully!");
        } catch (error) {
            console.error("Error saving schedule:", error);
            setError("Failed to save schedule");
        }
    };

    const handleProgramChange = async(e) => {

        const programName = e.target.value;
        setSelectedProgram(programName);
        setData({}); // Clear any existing schedule data
        
        // Reset schedule selection
        setSelectedSchedule("");
        setSelectedScheduleId("");
        
        // Find the selected program ID
        const selectedProgramObj = programs.find(p => p.programname === programName);
        if (selectedProgramObj) {
            const programId = selectedProgramObj.programid;
            setSelectedProgramId(programId);
            
            // Only fetch the classes to populate the drawer, don't generate plan automatically
            fetchProgramClasses(programId);
        } else {
            setProgramClasses([]);
            setAvailableDrawerClasses([]);
            setSelectedProgramId("");
        }
        
        console.log("Selected program:", programName);
    };
    
    // Handle schedule selection change
    const handleScheduleChange = (e) => {
        const scheduleId = e.target.value;
        setSelectedScheduleId(scheduleId);
        
        if (scheduleId) {
            // Find the schedule object - make sure to match property names from API
            const schedule = schedules.find(s => s.scheduleId.toString() === scheduleId);
            if (schedule) {
                setSelectedSchedule(schedule.scheduleName);
                
                // Load the schedule
                loadSchedule(scheduleId);
            }
        } else {
            // Clear the current data if no schedule is selected
            setSelectedSchedule("");
            setData({});
        }
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
                
                {/* Program Selection */}
                <select value={selectedProgram} onChange={handleProgramChange}>
                    <option value="">Select a Program</option>
                    {programs.map((program) => (
                        <option key={program.programid} value={program.programname}>
                            {program.programname}
                        </option>
                    ))}
                </select>
                
                <select value={selectedScheduleId} onChange={handleScheduleChange}>
                    <option value="">Select a Saved Schedule</option>
                    {schedules.map((schedule) => (
                        <option key={schedule.scheduleId} value={schedule.scheduleId}>
                            {schedule.scheduleName || "(Unnamed Schedule)"} 
                            {schedule.programName ? `(${schedule.programName})` : ""}
                        </option>
                    ))}
                </select>
                
                <button 
                    onClick={handleGenerateClick}
                    disabled={!selectedProgramId || loading}
                    className={styles['GenerateButton']}
                >
                    {loading ? "Generating..." : "Generate Schedule"}
                </button>
                {loading && <p>Loading classes...</p>}
            </div>
            <div className={styles['ButtonGroup']}>
                <button 
                    onClick={handleSavePdf} 
                    className={styles['SaveButton']}
                    disabled={Object.keys(data).length === 0}
                >
                    Save as PDF
                </button>
                <button 
                    onClick={handleSaveSchedule} 
                    className={styles['SaveButton']}
                    disabled={Object.keys(data).length === 0 || !selectedProgramId}
                >
                    Save Schedule
                </button>
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
                                    onRemove={() => handleRemoveFromSemester(semester, c.className || c.id)}
                                />
                            ))}
                        />
                    ))
                ) : (
                    <p>Click "Generate Schedule" to create a curriculum plan or select a saved schedule</p>
                )}
            </SemesterColumnContainer>
            <Drawer>
                <h2>Available Classes for {selectedProgram}</h2>
                <div className={styles["available-classes"]}>
                    {availableDrawerClasses.length > 0 ? (
                        availableDrawerClasses.map((cls) => (
                            <ClassCard
                                key={cls.classid || cls.className}
                                ClassName={cls.className || `${cls.department} ${cls.number}`}
                                ClassDescription={cls.description || cls.title}
                                Credits={cls.credits}
                                Semesters={Array.isArray(cls.semesters) ? cls.semesters.join(', ') : ''}
                                PreReqs={Array.isArray(cls.prerequisites) ? cls.prerequisites.join(', ') : ''}
                            />
                        ))
                    ) : (
                        <p>{selectedProgram ? "Loading classes..." : "Select a program to view available classes"}</p>
                    )}
                </div>
            </Drawer>
        </>
    );
}

export default App;