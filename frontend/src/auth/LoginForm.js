import React, { useState } from "react";
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
    const [formData, setFormData] = useState({
      username: "",
      userPassword: "",
    });




    /** Handle form submit:
    *
    * Calls login func prop and, if successful, redirect to /, but eventually the users homepage.
    */
    async function handleSubmit(evt) {
        evt.preventDefault();
        let result = await login(formData);
        if (result.success) {
          navigate("/");
        } else {
          console.log("Errors")
        }
      }
    
    /** Update form data field */
    function handleChange(evt) {
        const { name, value } = evt.target;
        setFormData(l => ({ ...l, [name]: value }));
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
                    value = {formData.username}
                    onChange = {handleChange}
                />
        
                <label> Password </label>
                <input 
                    type = "password"
                    name = "userPassword"
                    value = {formData.userPassword}
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