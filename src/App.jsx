import React from 'react'
import './App.css'
import ClassCard from './ClassCard/ClassCard'
import ClassTable from './ClassTable/ClassTable'
import Drawer from './Drawer/Drawer'


function App() {

    const columns = ["Spring 2025", "Summer 2025", "Fall 2025", "Spring 2026", "Fall 2026"];
    const calc = <ClassCard ClassName="Math 1210" ClassDescription="Calc I" ReqType="general" Credits={3} Semesters="F, SP"/>
    const eng = <ClassCard ClassName="Eng 105" ClassDescription="Writing 105" ReqType="general" Credits={3} Semesters="F, SP"/>
    const se2 = <ClassCard ClassName="CS 4400" ClassDescription="Software Engineering 2" ReqType="core" Credits={3} Semesters="F, SP" prereqs={"Calc I"}/>
    const data = [
        { "Spring 2025": se2, "Summer 2025": se2, "Fall 2025": se2 },
        { "Spring 2025": se2, "Summer 2025": se2, "Fall 2025": se2 },
        { "Spring 2025": se2, "Summer 2025": se2, "Fall 2025": se2 },
        { "Spring 2025": se2, "Summer 2025": se2},
    ];

    const data2 = [
        { "Spring 2025": calc, "Summer 2025": calc, "Fall 2025": se2 },
        { "Spring 2025": se2, "Summer 2025": se2, "Fall 2025": eng },
        { "Spring 2025": eng, "Summer 2025": eng, "Fall 2025": calc },
        { "Spring 2025": se2, "Summer 2025": eng},
    ];

    const data3 = [
        { "Spring 2025": calc, "Summer 2025": eng, "Fall 2025": se2 },
        { "Spring 2025": calc, "Summer 2025": eng, "Fall 2025": se2 },
        { "Spring 2025": calc, "Summer 2025": eng, "Fall 2025": se2 },
        { "Spring 2025": calc, "Summer 2025": eng},
    ]

    return (
      <div>
          <div>
              <h1>Testing ClassTable</h1>
              <ClassTable columns={columns} data={data} />
          </div>

          <div>
              <h1>Testing ClassTable2</h1>
              <ClassTable columns={columns} data={data2} />
          </div>

          <div>
            <h1>Testing ClassTable3</h1>
            <ClassTable columns={columns} data={data3}/>
          </div>

          <div>
          <h1>Courses</h1>
          <Drawer>
              <ClassCard ClassName="CS 4400" ClassDescription="Software Engineering 2" ReqType="core" Credits={3} Semesters="F, SP"/>
              <ClassCard ClassName="CS 4450" ClassDescription="Analysis of ProgLang" ReqType="core" Credits={3} Semesters="F, SP"/>
              <ClassCard ClassName="CS 2300" ClassDescription="Discrete Math" ReqType="core" Credits={3} Semesters="F, SP"/>
              <ClassCard ClassName="CS 4400" ClassDescription="Software Engineering 2" ReqType="core" Credits={3} Semesters="F, SP"/>
              <ClassCard ClassName="CS 4450" ClassDescription="Analysis of ProgLang" ReqType="core" Credits={3} Semesters="F, SP"/>
              <ClassCard ClassName="CS 2300" ClassDescription="Discrete Math" ReqType="core" Credits={3} Semesters="F, SP"/>
              <ClassCard ClassName="CS 4400" ClassDescription="Software Engineering 2" ReqType="core" Credits={3} Semesters="F, SP"/>
              <ClassCard ClassName="CS 4450" ClassDescription="Analysis of ProgLang" ReqType="core" Credits={3} Semesters="F, SP"/>
              <ClassCard ClassName="CS 2300" ClassDescription="Discrete Math" ReqType="core" Credits={3} Semesters="F, SP"/>

              {/* <ClassCard ClassName="CS 4400" ClassDescription="Software Engineering 2" />
              <ClassCard ClassName="CS 4450" ClassDescription="Analysis of ProgLang" />
              <ClassCard ClassName="CS 2300" ClassDescription="Discrete Math" />
              <ClassCard ClassName="CS 4400" ClassDescription="Software Engineering 2" />
              <ClassCard ClassName="CS 4450" ClassDescription="Analysis of ProgLang" />
              <ClassCard ClassName="CS 2300" ClassDescription="Discrete Math" />
              <ClassCard ClassName="CS 4400" ClassDescription="Software Engineering 2" />
              <ClassCard ClassName="CS 4450" ClassDescription="Analysis of ProgLang" />
              <ClassCard ClassName="CS 2300" ClassDescription="Discrete Math" /> */}
          </Drawer>
          </div>
      </div>
    );
}

export default App;

