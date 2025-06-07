import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import Signin from './pages/Signin';
import BusinessProfile from './pages/Profile'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signin" element={<Signin />} />
        <Route path="/profile" element={<BusinessProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
