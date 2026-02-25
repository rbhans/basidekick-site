import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import PointStackPage from './pages/PointStackPage';
import ToolsPage from './pages/ToolsPage';
import BASAtlasPage from './pages/BASAtlasPage';
import WikiPage from './pages/WikiPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pointstack" element={<PointStackPage />} />
        <Route path="/tools" element={<ToolsPage />} />
        <Route path="/atlas" element={<BASAtlasPage />} />
        <Route path="/wiki" element={<WikiPage />} />
      </Routes>
    </Router>
  );
}

export default App;
