import { Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import PlaygroundPage from './pages/PlaygroundPage';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/playground" element={<PlaygroundPage />} />
      </Routes>
    </>
  )
}

export default App
