import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    followers: '',
    following: '',
    posts: '',
    hasProfilePic: true
  });

  // Effect to hide splash screen after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

// Change your Splash section to use the new class
  if (showSplash) {
    return (
      <div className="splash-container">
        <h1 className="splash-logo animate-pulse">FAKEFINDER</h1>
      </div>
    );
  }

  return (
    <div className="home-container">
      <nav className="navbar">
        <h2>FakeFinder AI</h2>
      </nav>

      <main className="hero">
        <div className="glass-card">
          <h1>Scan Suspicious Profile</h1>
          <p>Enter profile details to check for bot behavior.</p>

          <form className="input-form">
            <input 
              type="text" 
              placeholder="Username (e.g. @user123)" 
              className="styled-input"
            />
            <div className="input-grid">
              <input type="number" placeholder="Followers" className="styled-input" />
              <input type="number" placeholder="Following" className="styled-input" />
            </div>
            <input type="number" placeholder="Post Count" className="styled-input" />
            
            <button type="button" className="analyze-btn">
              Analyze Account
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default App;