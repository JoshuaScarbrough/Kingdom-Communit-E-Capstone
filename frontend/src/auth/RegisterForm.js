import React, { useState } from "react";
import axios from "axios"
import { Link, useNavigate } from "react-router-dom";
import "./RegisterForm.css";

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

    // Clears all the data from the session so that a user must re-enter their username and password
    sessionStorage.clear()

    // This is the user peice of state that updates
    const [user, setUser] = useState("");

  /** 
   * setUser responds with an object of the [name]: value pairs that is saved as the user.
   * This handle change is fired everytime the input box is manipulated by the user. 
   */
  function handleChange(evt) {
    const { name, value } = evt.target;
    setUser(data => ({ ...data, [name]: value }));
  }

  /** Handle form submit:
  *
  * Calls login func prop and, if successful, redirect to /, but eventually the users homepage.
  */
  async function handleSubmit(evt) {
    evt.preventDefault();
    
      const response = await axios.post("http://localhost:5000/auth/register", {
        user
      });
      console.log(response.data)

      alert(response.data.message)

      if(response.data.message == 'User registered successfully'){
        navigate("/auth/login")
      }else{
        navigate("/auth/register");
      }
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

        <h2> Become a Kingdom Citizen </h2>

        
        <section>
        <form onSubmit={handleSubmit}>

            <label> Set Username </label>
            <input 
                name = "username"
                value = {setUser.username}
                onChange = {handleChange}
            />

            <label> Set Password </label>
            <input 
                type = "password"
                name = "userPassword"
                value = {setUser.userPassword}
                onChange = {handleChange}
            />

            <label> Set Address </label>
            <input 
                name = "userAddress"
                value = {setUser.userAddress}
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