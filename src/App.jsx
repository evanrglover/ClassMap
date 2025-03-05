import React from 'react';
import ClassCard from './ClassCard/ClassCard.jsx'
import ClassTable from './ClassTable/ClassTable.jsx';
import LoginPage from './pages/Login.jsx';
import Login from './pages/Login.jsx';

function App() {
    const columns = ["Fall 2025", "Spring 2026", "Fall 2026", "Spring 2027", "Fall 2027", "Spring 2028", "Fall 2028", "Spring 2029"]

    const data = [

        { "Fall 2025": <ClassCard ClassName="CS4400" ClassDescription="Software Engineering 2"/>, "Spring 2026": <ClassCard ClassName="CS4400" ClassDescription="Software Engineering 2"/>},
        { "Fall 2025": <ClassCard ClassName="CS4400" ClassDescription="Software Engineering 2"/>, "Spring 2026": <ClassCard ClassName="CS4400" ClassDescription="Software Engineering 2"/>},
        { "Fall 2025": <ClassCard ClassName="CS4400" ClassDescription="Software Engineering 2"/>, "Spring 2026": <ClassCard ClassName="CS4400" ClassDescription="Software Engineering 2"/>},
        { "Fall 2026": <ClassCard ClassName="CS4400" ClassDescription="Software Engineering 2"/>, "Spring 2027": <ClassCard ClassName="CS4400" ClassDescription="Software Engineering 2"/>},
        { "Fall 2025": <ClassCard ClassName="CS4400" ClassDescription="Software Engineering 2"/>, "Spring 2026": <ClassCard ClassName="CS4400" ClassDescription="Software Engineering 2"/>},
        { "Fall 2027": <ClassCard ClassName="CS4400" ClassDescription="Software Engineering 2"/>, "Spring 2028": <ClassCard ClassName="CS4400" ClassDescription="Software Engineering 2"/>}
    ];

    return (
        <>
            <LoginPage />
        </>
    );
}

export default App;
