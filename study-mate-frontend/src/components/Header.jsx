import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ThemeToggle from "./ThemeToggle";

const navButtonBase =
  "px-4 py-2 font-medium rounded-lg transition-colors bg-gray-50 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100";

const navButtonActive =
  "px-4 py-2 font-medium rounded-lg transition-colors bg-orange-50 text-orange-600 ring-1 ring-orange-200 hover:bg-orange-100 dark:bg-green-900/30 dark:text-green-400 dark:ring-green-800 dark:hover:bg-green-900/40";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isHome = location.pathname === "/home";
  const isNotes = location.pathname === "/notes" || location.pathname.startsWith("/notes/");

  return (
    <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-800">
      <h1 className="text-2xl font-bold text-orange-600 dark:text-green-400">
        <Link to="/home">StudyMate AI</Link>
      </h1>

      <div className="flex items-center gap-4">
        <Link to="/home" className={isHome ? navButtonActive : navButtonBase}>
          Új jegyzet
        </Link>

        <Link to="/notes" className={isNotes ? navButtonActive : navButtonBase}>
          Jegyzetek
        </Link>

        <ThemeToggle />

        <button onClick={handleLogout} className={navButtonBase}>
          Kijelentkezés
        </button>
      </div>
    </header>
  );
};

export default Header;
