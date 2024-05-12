import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "./utils/use_api";
import { setAuthToken } from "./store/application_slice";
import { useDispatch } from "react-redux";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const api = useApi();
  const dispatch = useDispatch();

  async function login(e) {
    e.preventDefault();
    const { token } = await api.post("/sessions", {
      email,
      password,
    });

    dispatch(setAuthToken(token));
    navigate("/");
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
      <form className="space-y-4" onSubmit={login}>
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
          Sign In
        </button>
      </form>
    </div>
  );
}
