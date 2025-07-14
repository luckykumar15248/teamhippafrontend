import React, { Suspense } from 'react';
import HomePage from './pages/homepage/page';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
  import { ToastContainer } from 'react-toastify';
     import 'react-toastify/dist/ReactToastify.css';


export default function Home() {
  return (
    <div>  
     
      <Suspense fallback={<div>Loading...</div>}>
      <HomePage />
      </Suspense>
    
    </div>
  );
}
