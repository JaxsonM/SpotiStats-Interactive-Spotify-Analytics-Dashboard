import { useState } from "react";
import { useApi } from "./utils/use_api";
import { useDispatch } from "react-redux";
import { setAuthToken } from "./store/application_slice";
import { useNavigate } from "react-router-dom";

export const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const api = useApi();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function createUser(e) {
    e.preventDefault();
    const res = await api.post("/users", {
      email,
      password,
      firstName,
      lastName
    });
    dispatch(setAuthToken(res.token));

    navigate("/");
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>
      <form className="space-y-4" onSubmit={createUser}>
        <input
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="First name"
          type="text"
          value={firstName}
          required
          onChange={e => setFirstName(e.target.value)}
        />
        <input
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="Last name"
          type="text"
          value={lastName}
          required
          onChange={e => setLastName(e.target.value)}
        />
        <input
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="Email"
          type="email"
          value={email}
          required
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="Password"
          type="password"
          value={password}
          required
          onChange={e => setPassword(e.target.value)}
        />

        <button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Create Account
        </button>
      </form>
    </div>
  );
}
