import React from "react";
import Header from "../components/Header";

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Header />
      <main className="grow p-6">{children}</main>
    </div>
  );
};

export default AppLayout;
