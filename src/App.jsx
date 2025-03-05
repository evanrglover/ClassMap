import React from 'react'
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ClassCard from './ClassCard/ClassCard'
import ClassTable from './ClassTable/ClassTable'
import Drawer from './Drawer/Drawer'


function App() {
  // const [count, setCount] = useState(0)
  const columns = ["Spring 2025", "Summer 2025", "Fall 2025", "Spring 2026", "Fall 2026"];
  const calc = <ClassCard ClassName="Math 1210" ClassDescription="Calc I"/>
  const eng = <ClassCard ClassName="Eng 105" ClassDescription="Writing 105"/>
  const se2 = <ClassCard ClassName="CS 4400" ClassDescription="Software Engineering 2"/>
    const data = [
        { "Spring 2025": se2, "Summer 2025": se2, "Fall 2025": se2 },
        { "Spring 2025": se2, "Summer 2025": se2, "Fall 2025": se2 },
        { "Spring 2025": se2, "Summer 2025": se2, "Fall 2025": se2 },
        { "Spring 2025": se2, "Summer 2025": se2},
    ];

    return (
      <div>
          <div>
              <h1>Testing ClassTable</h1>
              <ClassTable columns={columns} data={data} />
          </div>

          <div>
          <h1>Courses</h1>
          <Drawer>
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
          </Drawer>
          </div>
      </div>
    );
}

export default App;

// return (
//     <>
//     <div>
//       <h1>Kachigga</h1>
//       <ClassCard ClassName="Math 1210" ClassDescription="Calc I"/>
//       <ClassCard ClassName="Eng 105" ClassDescription="Writing 105"/>
//     </div>


//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App


