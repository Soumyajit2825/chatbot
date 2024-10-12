import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './components/home';
import Chatbot from './components/chatbot';
import Assistant from './components/assistant';
function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <nav className="bg-gray-800 p-4">
            <ul className="flex space-x-4">
              <li>
                <Link to="/" className="text-white">Home</Link>
              </li>
              <li>
                <Link to="/chat" className="text-white">Chat</Link>
              </li>
              <li>
                <Link to="/ai" className="text-white">AI Assistant</Link>
              </li>
            </ul>
          </nav>
        </header>
        <main className="p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<Chatbot />} />
            <Route path="/ai" element={<Assistant />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;