import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';  // Correct import
import Navbar from './components/Navbar';
import Homepage from './components/Homepage';
import PredictForm from './components/PredictForm';
import ResultPage from './components/ResultPage';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import CropRecommend from './components/CropRecommend';

const App = () => {
  return (
    <Router>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Homepage />} />  {/* Correct JSX */}
          <Route path="/predict" element={<PredictForm />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/crop-recommend" element={<CropRecommend />} />
          <Route path="/result" element={<ResultPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
