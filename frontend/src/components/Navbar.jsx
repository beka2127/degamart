import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, LogIn, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import logo from '../logo/logo.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-slate-50/80 dark:bg-slate-950/80 border-b border-slate-200/70 dark:border-slate-800">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-slate-100">
          <img src={logo} alt="Dega Mart" className="h-10 w-auto object-contain" />
          Dega Mart
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user ? (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white shadow-sm">
                  {user.username
                    .split(' ')
                    .map((part) => part[0]?.toUpperCase())
                    .slice(0, 2)
                    .join('')}
                </div>
                <span className="text-sm font-medium text-slate-900 dark:text-white">{user.username}</span>
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 transition"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 transition"
              >
                <LogOut size={16} />
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-white hover:bg-slate-900 dark:hover:bg-slate-700 transition"
              >
                <LogIn size={16} />
                Log in
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-accent hover:bg-accent-dark text-white transition"
              >
                Sell an item
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
