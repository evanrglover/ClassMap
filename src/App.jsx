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
import { DndContext, pointerWithin, rectIntersection } from '@dnd-kit/core';
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
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({});
    const [isDrawerOpen, setIsDrawerOpen] = useState(true);
    
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

    // Function to create empty semesters based on start semester and number of semesters
    const createEmptySemesters = (startSemester = "Spring", startYear = 2025, numSemesters = 8) => {
        const semesters = ["Spring", "Summer", "Fall"];
        const emptySemesters = {};
        
        let currentSemesterIndex = semesters.indexOf(startSemester);
        let currentYear = startYear;
        
        for (let i = 0; i < numSemesters; i++) {
            const semesterName = `${semesters[currentSemesterIndex]} ${currentYear}`;
            emptySemesters[semesterName] = [];
            
            // Move to next semester
            currentSemesterIndex = (currentSemesterIndex + 1) % semesters.length;
            if (currentSemesterIndex === 0) {
                // Increment year when we circle back to Spring
                currentYear++;
            }
        }
        
        return emptySemesters;
    };

    // Custom collision detection algorithm from drag-and-drop implementation
    function customCollisionDetectionAlgorithm(args) {
        const pointerCollisions = pointerWithin(args);
        if (pointerCollisions.length > 0) {
          return pointerCollisions;
        }
        return rectIntersection(args);
    }
    
    // Improved handleDragEnd that merges both implementations
    const handleDragEnd = (event) => {
        const { active, over } = event;
    
        if (!over || active.id === over.id) return;
    
        // Debugging
        console.log('Active ID:', active.id);
        console.log('Over ID:', over.id);
        
        const drawerId = 'drawer';
    
        // Find source container
        const sourceSemester = Object.keys(data).find(semester =>
            data[semester].some(cls => cls.id === active.id || cls.className === active.id)
        ) || (drawerItems.some(cls => cls.id === active.id) ? drawerId : null);
    
        const targetSemester = over.id;
    
        if (!sourceSemester || !targetSemester) return;
        if (sourceSemester === targetSemester) return;
    
        let updatedData = { ...data };
        let sourceItems = sourceSemester === drawerId ? [...drawerItems] : [...data[sourceSemester]];
        let targetItems = targetSemester === drawerId ? [...drawerItems] : [...(data[targetSemester] || [])];
    
        const movedItemIndex = sourceItems.findIndex(cls => cls.id === active.id || cls.className === active.id);
        if (movedItemIndex === -1) return;
    
        const [movedItem] = sourceItems.splice(movedItemIndex, 1);

        // Format item consistently for the target container
        const normalizedItem = {
            id: movedItem.id || `${movedItem.department} ${movedItem.number}`,
            className: movedItem.className || `${movedItem.department} ${movedItem.number}`,
            description: movedItem.description || movedItem.title || '',
            prerequisites: movedItem.prerequisites || [],
            requiresMatriculation: movedItem.requiresMatriculation || false,
            semesters: movedItem.semesters || [],
            credits: movedItem.credits || 0,
        };
    
        // Prevent duplicates
        if (targetItems.some(cls => cls.id === active.id || cls.className === active.id)) return;
    
        targetItems.push(sourceSemester === drawerId ? normalizedItem : movedItem);
        console.log("Target Items: ", targetItems);
    
        if (sourceSemester !== drawerId) updatedData[sourceSemester] = sourceItems;
        if (targetSemester !== drawerId) updatedData[targetSemester] = targetItems;
    
        setData(updatedData);
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
                id: `${cls.department} ${cls.number}`,
                className: `${cls.department} ${cls.number}`,
                description: cls.title
            }));
            
            setProgramClasses(formattedClasses);
        } catch (error) {
            console.error("Error fetching program classes:", error);
            setError("Failed to load classes for this program");
        } finally {
            setLoading(false);
        }
    };

    const toggleDrawer = () => {
        setIsDrawerOpen(prev => !prev);
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

            const prePlacedClasses = {};
            Object.entries(data).forEach(([semester, classes]) => {
                if (classes.length > 0) {
                    prePlacedClasses[semester] = classes.map(c => c.className || c.id);
                }
            });
            
            const response = await axios.post(
                `${API_BASE_URL}/generatePlan/${programId}`,
                {
                    startSemester: "Spring", 
                    startYear: 2025,
                    prePlacedClasses: prePlacedClasses
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
        } catch (error) {
            console.error("Error generating plan:", error);
            setError("Failed to generate curriculum plan");
        }
    };

    const loadSchedule = async (scheduleId) => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/getScheduleClasses/${scheduleId}`);
            
            // Process data similar to generatePlan function
            const newData = {};
            
            // Ensure we're processing the response data correctly
            if (response.data && typeof response.data === 'object') {
                Object.entries(response.data).forEach(([semester, classes]) => {
                    // Make sure classes is an array before mapping
                    if (Array.isArray(classes)) {
                        newData[semester] = classes.map((cls) => ({
                            ...cls,
                            id: cls.className || `${cls.department} ${cls.number}` // Ensure unique ID
                        }));
                        
                        console.log(`Semester ${semester} has ${classes.length} classes`);
                        classes.forEach((cls) => {
                            console.log(` -> ${cls.department} ${cls.coursenum}`);
                        });
                    } else {
                        console.error(`Classes for semester ${semester} is not an array:`, classes);
                        newData[semester] = []; // Initialize as empty array
                    }
                });
                
                // Set the data with processed format
                setData(newData);
            } else {
                console.error("Unexpected response format:", response.data);
                setError("Invalid schedule data format");
            }
            
            // Find program ID for this schedule
            const schedule = schedules.find(s => s.scheduleId === scheduleId);
            if (schedule) {
                setSelectedProgramId(schedule.programId);
                setSelectedProgram(schedule.programName);
                // Fetch program classes
                fetchProgramClasses(schedule.programId);
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

    const handleProgramChange = (e) => {
        const programName = e.target.value;
        setSelectedProgram(programName);
        
        // Reset schedule selection
        setSelectedSchedule("");
        setSelectedScheduleId("");
        
        // Find the selected program ID
        const selectedProgramObj = programs.find(p => p.programname === programName);
        if (selectedProgramObj) {
            const programId = selectedProgramObj.programid;
            setSelectedProgramId(programId);
            
            // Fetch program classes
            fetchProgramClasses(programId);
            
            // Create empty semester columns for the new program
            const emptySemesters = createEmptySemesters("Spring", 2025, 8);
            setData(emptySemesters);
        } else {
            setProgramClasses([]);
            setSelectedProgramId("");
            setData({});  // Clear any existing data
        }
        
        console.log("Selected program:", programName);
    };
    
    // Handle schedule selection change
    const handleScheduleChange = (e) => {
        const scheduleId = e.target.value;
        setSelectedScheduleId(scheduleId);
        
        if (scheduleId) {
            // Find the schedule object
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

    // Get all scheduled class names from the generated plan
    const scheduledClassNames = new Set(
        Object.values(data).flat().map(c => c.className || c.id)
    );

    // Filter the drawer classes to take out the ones in the schedule
    const drawerItems = programClasses.filter(
        cls => {
            const className = cls.className || `${cls.department} ${cls.number}`;
            return !scheduledClassNames.has(className);
        }
    ).map(cls => ({
        ...cls,
        id: cls.id || `${cls.department} ${cls.number}`
    }));

    const handleClearSchedule = async () => {
        if (!selectedProgramId) {
            setError("No program selected");
            return;
        }
    
        // Confirm with user
        if (!window.confirm("Are you sure you want to clear all classes from your schedule?")) {
            return;
        }
    
        try {
            // Set up headers with token if available
            const config = {};
            if (token) {
                config.headers = {
                    Authorization: `Bearer ${token}`
                };
            }
            
            // Call backend to clear schedule
            await axios.post(
                `${API_BASE_URL}/clearSchedule/${selectedProgramId}`,
                {},
                config
            );
            
            // Move all classes back to drawer by creating empty semesters
            // but keeping the same structure
            const emptySemesters = {};
            Object.keys(data).forEach(semester => {
                emptySemesters[semester] = [];
            });
            
            setData(emptySemesters);
            
            // If this was a saved schedule, we need to update it
            if (selectedScheduleId) {
                handleSaveSchedule();
            }
            
        } catch (error) {
            console.error("Error clearing schedule:", error);
            setError("Failed to clear schedule");
        }
    };

    return (
        <>
            <h2>Welcome {localStorage.getItem("userName")} </h2>
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
                <button 
                    onClick={handleClearSchedule} 
                    className={styles['ClearButton'] || styles['SaveButton']}
                    disabled={Object.keys(data).length === 0 || 
                            Object.values(data).flat().length === 0 || 
                            !selectedProgramId}
                >
                    Clear Schedule
                </button>
            </div>

            <DndContext 
                collisionDetection={customCollisionDetectionAlgorithm} 
                onDragStart={(event) => {
                    console.log('Dragging item:', event.active.id); 
                }}
                onDragEnd={handleDragEnd}
            >
                <SemesterColumnContainer className="SemesterColumnContainer" ref={containerRef}>
                    {Object.entries(data).length > 0 ? (
                        // Sort the semesters chronologically before mapping
                        sortSemesters(Object.keys(data)).map((semester) => (
                            <SortableContext
                            key={semester}
                            id={semester}
                            items={data[semester].map((cls) => cls.id || cls.className)}
                            >
                                <SemesterColumn
                                key={semester}
                                SemesterName={semester}
                                ClassCards={data[semester].map((c, index) => (
                                    <ClassCard
                                        key={c.id || c.className || index}
                                        id={c.id || c.className}
                                        ClassName={c.className || `${c.department} ${c.number}`}
                                        ClassDescription={c.description || c.title}
                                        Credits={c.credits}
                                        Semesters={Array.isArray(c.semesters) ? c.semesters.join(', ') : c.semesters || ''}
                                        PreReqs={Array.isArray(c.prerequisites) ? c.prerequisites.join(', ') : c.prerequisites || ''}
                                        ReqType={c.reqType || ""}
                                        onRemove={() => handleRemoveFromSemester(semester, c.id || c.className)}
                                    />
                                ))}
                                />
                            </SortableContext>
                        ))
                    ) : (
                        <p>Click "Generate Schedule" to create a curriculum plan or select a saved schedule</p>
                    )}
                </SemesterColumnContainer>
            
                <SortableContext id="drawer" items={drawerItems.map(c => c.id)}>
                    <Drawer isOpen={isDrawerOpen} toggleDrawer={toggleDrawer}>
                        <h2>Available Classes for {selectedProgram}</h2>
                        <div className={styles["available-classes"]}>
                            {drawerItems.length > 0 ? (
                                drawerItems.map((cls) => (
                                    <ClassCard
                                        key={cls.id}
                                        id={cls.id}
                                        ClassName={cls.className || `${cls.department} ${cls.number}`}
                                        ClassDescription={cls.description || cls.title}
                                        Credits={cls.credits}
                                        Semesters={Array.isArray(cls.semesters) ? cls.semesters.join(', ') : ''}
                                        PreReqs={Array.isArray(cls.prerequisites) ? cls.prerequisites.join(', ') : ''}
                                    />
                                ))
                            ) : (
                                <p>{selectedProgram ? "No available classes" : "Select a program to view available classes"}</p>
                            )}
                        </div>
                    </Drawer>
                </SortableContext>
            </DndContext>
        </>
    );
}

export default App;