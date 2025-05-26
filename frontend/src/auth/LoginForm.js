import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./LoginForm.css";

function LoginForm() {
  const navigate = useNavigate();

  // Clear session on mount
  sessionStorage.clear();

  const [loginUser, setLoginUser] = useState({});

  function handleChange(evt) {
    const { name, value } = evt.target;
    setLoginUser(data => ({ ...data, [name]: value }));
  }

  async function handleSubmit(evt) {
    evt.preventDefault();

    let response = await axios.post("http://localhost:5000/auth/login", {
      loginUser
    });
    response = response.data;

    if (response.message === "The username / password is incorrect") {
      alert(response.message);
      navigate("/auth/login");
    } else {
      sessionStorage.setItem("token", response.token);
      alert(response.message);
      navigate("/users");
    }
  }

  return (
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
          <label htmlFor="username"> Username </label>
          <input
            id="username"
            name="username"
            value={loginUser.username || ""}
            onChange={handleChange}
          />

          <label htmlFor="userPassword"> Password </label>
          <input
            id="userPassword"
            type="password"
            name="userPassword"
            value={loginUser.userPassword || ""}
            onChange={handleChange}
          />

          <button type="submit">Login</button>
        </form>
      </section>
    </div>
  );
}

export default LoginForm;