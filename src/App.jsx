import React from 'react';
import { useState } from 'react';
import ClassCard from './ClassCard/ClassCard.jsx'
import ClassTable from './ClassTable/ClassTable.jsx';
import LoginPage from './pages/Login.jsx';
import Login from './pages/Login.jsx';

function App() {
    const [token, setToken] = useState(localStorage.getItem("token") || "");
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
        <div>
            <div>
                <h1>Testing ClassTable</h1>
                <ClassTable columns={columns} data={data} />
            </div>

            <div>
            <h1>Courses</h1>
            {/* <Drawer>
                <ClassCard ClassName="CS 4400" ClassDescription="Software Engineering 2" />
                <ClassCard ClassName="CS 4450" ClassDescription="Analysis of ProgLang" />
                <ClassCard ClassName="CS 2300" ClassDescription="Discrete Math" />
                <ClassCard ClassName="CS 4400" ClassDescription="Software Engineering 2" />
                <ClassCard ClassName="CS 4450" ClassDescription="Analysis of ProgLang" />
                <ClassCard ClassName="CS 2300" ClassDescription="Discrete Math" />
                <ClassCard ClassName="CS 4400" ClassDescription="Software Engineering 2" />
                <ClassCard ClassName="CS 4450" ClassDescription="Analysis of ProgLang" />
                <ClassCard ClassName="CS 2300" ClassDescription="Discrete Math" />

                {/* <ClassCard ClassName="CS 4400" ClassDescription="Software Engineering 2" />
                <ClassCard ClassName="CS 4450" ClassDescription="Analysis of ProgLang" />
                <ClassCard ClassName="CS 2300" ClassDescription="Discrete Math" />
                <ClassCard ClassName="CS 4400" ClassDescription="Software Engineering 2" />
                <ClassCard ClassName="CS 4450" ClassDescription="Analysis of ProgLang" />
                <ClassCard ClassName="CS 2300" ClassDescription="Discrete Math" />
                <ClassCard ClassName="CS 4400" ClassDescription="Software Engineering 2" />
                <ClassCard ClassName="CS 4450" ClassDescription="Analysis of ProgLang" />
                <ClassCard ClassName="CS 2300" ClassDescription="Discrete Math" /> */}
            {/* </Drawer>  */}
            </div>
        </div>
        // <>
        //     <LoginPage />
        // </>
    );
}

export default App;
