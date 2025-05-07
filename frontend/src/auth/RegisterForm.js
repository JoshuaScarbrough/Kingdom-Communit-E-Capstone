import React, { useState } from "react";
import axios from "axios"
import { Link, useNavigate } from "react-router-dom";

/** Signup form.
 *
 * Shows form and manages update to state on changes.
 * On submission:
 * - calls signup function prop
 *
 * Routed as /signup
 */

function RegisterForm(){
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username:"",
        userPassword:"",
        userAddress:""
    });


    /** Handle form submit:
    *
    * Calls login func prop and, if successful, redirect to /, but eventually the users homepage.
    */
  async function handleSubmit(evt) {
    evt.preventDefault();
    
      const response = await axios.post("http://localhost:5000/auth/register", {
        formData
      });

      alert(response.data.message)
      navigate("/");
  }

  /** Update form data field */
  function handleChange(evt) {
    const { name, value } = evt.target;
    setFormData(data => ({ ...data, [name]: value }));
  }


  // Returns the Signup Form
  return (
    <div>

        <section>
            <nav>
                <Link to="/"> Home </Link>
                <Link to="/auth/login"> Login </Link>
            </nav>

            <h1> Kingdom Communit-E </h1>
        </section>

        <h2> Enter the Kingdom </h2>

        
        <section>
        <form onSubmit={handleSubmit}>

            <label> Set Username </label>
            <input 
                name = "username"
                value = {formData.username}
                onChange = {handleChange}
            />

            <label> Set Password </label>
            <input 
                type = "password"
                name = "userPassword"
                value = {formData.userPassword}
                onChange = {handleChange}
            />

            <label> Set Address </label>
            <input 
                name = "userAddress"
                value = {formData.userAddress}
                onChange = {handleChange}
            />

            <button onSubmit={handleSubmit} >
            Register
            </button>
        
        </form>
        </section>




    </div>
  )

}

export default RegisterForm;