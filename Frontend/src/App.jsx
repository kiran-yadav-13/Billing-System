import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import Signin from "./pages/Signin";
import Home from "./pages/home";
import Layout from "@/layout"
import BusinessProfile from "./pages/profile";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signin" element={<Signin />} />
        <Route path="/profile" element={<BusinessProfile />} />
        
        <Route
          path="/"
          element={<Layout><Home /></Layout>}
        />
      </Routes>
    </Router>
  );
}

export default App;

