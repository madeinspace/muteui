// app/ClientProviders.tsx

"use client";

import React, { ReactNode } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface ClientProvidersProps {
  children: ReactNode;
}

const ClientProviders: React.FC<ClientProvidersProps> = ({ children }) => {
  return (
    <>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
};

export default ClientProviders;
