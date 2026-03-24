import React from "react";
import ThemeToggle from "../components/ThemeToggle";

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen relative bg-gray-100 dark:bg-gray-950">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="flex items-center justify-center min-h-screen p-4 w-full min-w-0 box-border">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
