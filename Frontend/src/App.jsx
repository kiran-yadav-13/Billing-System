import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'
import { Button } from "@/components/ui/button"
import Signin from '@/pages/signin'

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
  )
}

export default App
