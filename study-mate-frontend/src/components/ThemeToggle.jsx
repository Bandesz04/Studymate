import React from "react";
import { useTheme } from "../contexts/ThemeContext";

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="px-4 py-2 flex items-center justify-center font-medium rounded-lg transition-colors bg-gray-50 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100"
      aria-label="Téma váltása"
      title="Téma váltása"
    >
      {isDark ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="w-5 h-5 text-yellow-300"
          fill="currentColor"
        >
          <path d="M12 4.5a1 1 0 0 1-1-1V2a1 1 0 1 1 2 0v1.5a1 1 0 0 1-1 1Zm0 17a1 1 0 0 1-1-1V19a1 1 0 1 1 2 0v1.5a1 1 0 0 1-1 1Zm7.5-9.5a1 1 0 0 1 1 1h1.5a1 1 0 1 1 0 2H20.5a1 1 0 1 1 0-2H19.5a1 1 0 0 1 1-1ZM4.5 12a1 1 0 0 1 1-1H3.999L4 10.5a1 1 0 1 1 0-2H5.5a1 1 0 1 1 0 2H5.5a1 1 0 0 1-1 1Zm11.31-4.81a1 1 0 0 1 0-1.41l1.06-1.06a1 1 0 1 1 1.41 1.41l-1.06 1.06a1 1 0 0 1-1.41 0Zm-9.19 9.19a1 1 0 0 1 0-1.41l1.06-1.06a1 1 0 1 1 1.41 1.41L8.03 15.88a1 1 0 0 1-1.41 0Zm0-9.19L5.56 6.44a1 1 0 1 1 1.41-1.41l1.06 1.06a1 1 0 0 1-1.41 1.41Zm9.19 9.19-1.06-1.06a1 1 0 0 1 1.41-1.41l1.06 1.06a1 1 0 1 1-1.41 1.41ZM12 7a5 5 0 1 0 5 5 5.006 5.006 0 0 0-5-5Z" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="w-5 h-5 text-green-400"
          fill="currentColor"
        >
          <path d="M21 12.79A9 9 0 0 1 12.21 3a7 7 0 1 0 8.79 9.79Z" />
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;
