import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import App from "../App"; // Assuming App is your Home component

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<App />} />  
      <Route path="/login" element={<Login />} />  
    </Routes>
  );
};

export default AppRoutes;
