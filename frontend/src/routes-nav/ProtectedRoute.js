import { Link, useNavigate } from "react-router-dom";

const ProtectedRoute = ({children}) => {
    
    const token = sessionStorage.getItem("token")

    return token ? children : <Navigate to="/" />
};

export default ProtectedRoute;