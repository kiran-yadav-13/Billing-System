import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'
import Signin from './pages/Signin';


function App() {

  return (
    <>
     <Router>
      <Routes>
        <Route path="/signin" element={<Signin />} />
        {/* other routes */}
      </Routes>
      </Router>

    </>
  )}

export default App;
