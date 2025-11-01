import logo from './logo.svg';
import './App.css';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import StartScreen from "./pages/StartScreen";
import Home from "./pages/Home";
import TabletDraw from "./pages/TabletDraw";
import Profile from "./pages/Profile";
import Game1 from "./games/Game1";
import Game2 from "./games/Game2";
import Game3 from "./games/Game3";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StartScreen />} />
        <Route path="/home" element={<Home />} />
        <Route path="/tablet" element={<TabletDraw />} />
        <Route path="/game/game1" element={<Game1 />} />
        <Route path="/game/game2" element={<Game2 />} />
        <Route path="/game/game3" element={<Game3 />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
