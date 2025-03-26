import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import App from "../App"; // 
import Register from "../pages/Register";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />  
      <Route path="/login" element={<Login />} />  
      <Route path="/register" element={<Register />} />
      <Route path="/App" element={<App />} />
    </Routes>
  );
};

export default AppRoutes;
