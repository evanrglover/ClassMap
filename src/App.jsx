import React from 'react';
import { useState } from 'react';
import ClassCard from './ClassCard/ClassCard.jsx'
import ClassTable from './ClassTable/ClassTable.jsx';
import LoginPage from './pages/Login.jsx';
import Login from './pages/Login.jsx';
import SemesterColumn from './SemesterColumn/SemesterColumn.jsx'
import SemesterColumnContainer from './SemesterColumnContainer/SemesterColumnContainer.jsx';

function App() {
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const data = {
        "Fall 2025": [
            { className: "CS4400", description: "Software Engineering 2" },
            { className: "CS3200", description: "Database Management" }
        ],
        "Spring 2026": [
            { className: "CS3500", description: "Algorithms" }
        ],
        "Fall 2026": [
            { className: "CS4100", description: "Artificial Intelligence" }
        ]
    };

    return (
        <SemesterColumnContainer >
            {Object.entries(data).map(([semester, classes]) => (
                    <SemesterColumn
                        key={semester}
                        SemesterName={semester}
                        ClassCards={classes.map((c, index) => (
                            <ClassCard key={index} ClassName={c.className} ClassDescription={c.description} />
                        ))}
                    />
            ))}
        </ SemesterColumnContainer>
    );
}

export default App;