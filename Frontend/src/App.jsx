import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import Signin from "./pages/Signin";
import Home from "./pages/home";
import Layout from "@/layout";
import BusinessProfile from "./pages/profile";
import User from "./pages/user"; // ✅ Import added

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signin" element={<Signin />} />
        <Route path="/profile" element={<Layout><BusinessProfile /></Layout>} />
        <Route path="/users" element={<Layout><User /></Layout>} /> {/* ✅ Route added */}
        <Route path="/" element={<Layout><Home /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
