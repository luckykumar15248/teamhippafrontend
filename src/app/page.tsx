import React, { Suspense } from "react";
import HomePage from "./pages/homepage/page";
import "react-toastify/dist/ReactToastify.css";

export default function Home() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <HomePage />
      </Suspense>
    </div>
  );
}
