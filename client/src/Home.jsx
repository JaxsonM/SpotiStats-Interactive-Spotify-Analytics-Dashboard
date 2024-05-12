import { useEffect, useState } from "react";
import { useApi } from "./utils/use_api";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAuthToken } from "./store/application_slice";
import { requireLogin } from "./utils/require_login";

export const Home = () => {
  requireLogin();
  const [user, setUser] = useState(null);
  const api = useApi();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  async function getUser() {
    try {
      const { user } = await api.get("/users/me");
      setUser(user);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  }

  useEffect(() => {
    getUser();
  }, [])

  function logout() {
    dispatch(setAuthToken(null));
    navigate('/login'); // Redirect to login after logout
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-3">Home Page</h1>
      {user && <h2 className="text-2xl text-blue-500">Welcome, {user.firstName}</h2>}
      <p className="text-lg text-gray-700 max-w-xl text-center mt-4 mb-8">
        This is a platform where you can analyze your Spotify listening habits and see detailed statistics about your favorite music and artists.
      </p>
      <button 
        onClick={logout}
        className="px-6 py-2 border rounded-md text-red-600 border-red-600 hover:bg-red-600 hover:text-white transition-colors"
      >
        Logout
      </button>
    </div>
  )
}
