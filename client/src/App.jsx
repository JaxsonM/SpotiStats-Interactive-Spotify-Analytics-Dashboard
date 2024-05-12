import { Link, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

function App() {
  const authToken = useSelector(state => state.application.authToken);

  return (
    <div>
      <nav className="bg-blue-500 text-white p-4 flex justify-between items-center">
        <h2 className="text-lg font-bold">
          <Link to="/" className="hover:text-gray-200">SpotiStats</Link> 
        </h2>
        <div>
          {authToken ? (
            <>
              <Link to="/music_stats" className="px-4 py-2 hover:bg-blue-700 rounded">Music Stats</Link>
            </>
          ) : (
            <>
              <Link to="/sign_up" className="px-4 py-2 hover:bg-blue-700 rounded">Create Account</Link>
              <Link to="/login" className="px-4 py-2 hover:bg-blue-700 rounded">Sign In</Link>
            </>
          )}
        </div>
      </nav>
      <Outlet />
    </div>
  );
}

export default App;
