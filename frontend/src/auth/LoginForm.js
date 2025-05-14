import React, { useState } from "react";
import axios from "axios"
import { Link, useNavigate } from "react-router-dom";

/** Login form.
 *
 * Shows form and manages update to state on changes.
 * On submission:
 * - calls login function prop
 *
 * Routed as /auth/login
 */

function LoginForm() {

    const navigate = useNavigate();
    
    // This is the user peice of state that updates
    const [loginUser, setLoginUser] = useState("");


    /** 
   * setUser responds with an object of the [name]: value pairs that is saved as the user.
   * This handle change is fired everytime the input box is manipulated by the user. 
   */
  function handleChange(evt) {
    const { name, value } = evt.target;
    setLoginUser(data => ({ ...data, [name]: value }));
  }


  async function handleSubmit(evt) {
    evt.preventDefault();
    
      const response = await axios.post("http://localhost:5000/auth/login", {
        loginUser
      });

      alert(response.data.message)
      sessionStorage.setItem("token", response.data.token)
      console.log("Stored Token:", sessionStorage.getItem("token"))
      
      // Need to refine this to be more RESTFUL
      navigate("/users");
  }

    return(
        <div>
        
            <section>
                <nav>
                    <Link to="/"> Home </Link>
                    <Link to="/auth/register"> Register </Link>
                </nav>
        
                <h1> Kingdom Communit-E </h1>
            </section>
        
            <h2> Enter the Kingdom </h2>
        
                
            <section>
            <form onSubmit={handleSubmit}>
        
                <label> Username </label>
                <input 
                    name = "username"
                    value = {setLoginUser.username}
                    onChange = {handleChange}
                />
        
                <label> Password </label>
                <input 
                    type = "password"
                    name = "userPassword"
                    value = {setLoginUser.userPassword}
                    onChange = {handleChange}
                />

                <button onSubmit={handleSubmit} >
                  Login in
                </button>
                
            </form>
            </section>
        
        
        
        
            </div>
    )


}

export default LoginForm;