import Navbar from "./components/Navbar";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import TestModules from "./modules/TestModules";

const App = () => {
  return (
    <div>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/Test" element={<TestModules />} />

          {/* <Route path="/p" element={<Single />} /> */}
        </Routes>
      </Router>
    </div>
  );
};

export default App;
