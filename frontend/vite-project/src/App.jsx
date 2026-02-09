import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // Stores the ML response
  
  const [formData, setFormData] = useState({
    username: '',
    followers: '',
    following: '',
    posts: '',
    isPrivate: false,
  });

  // Effect to hide splash screen after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // The Magic Function: Connects to your Backend
  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("http://localhost:5000/api/check-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: "instagram", // Default for now
          username: formData.username,
          stats: {
            edge_followed_by: parseFloat(formData.followers) || 0,
            edge_follow: parseFloat(formData.following) || 0,
            username_length: formData.username.length,
            username_has_number: /\d/.test(formData.username) ? 1 : 0,
            full_name_has_number: 0, // Placeholder
            full_name_length: 10,     // Placeholder
            is_private: formData.isPrivate ? 1 : 0,
            is_joined_recently: 0,
            has_channel: 0,
            is_business_account: 0,
            has_guides: 0,
            has_external_url: 0
          }
        }),
      });

      const json = await response.json();
      if (json.success) {
        setResult(json.data);
      } else {
        alert("Error: " + json.error);
      }
    } catch (err) {
      console.error("Failed to connect to backend:", err);
      alert("Backend server is not running!");
    } finally {
      setLoading(false);
    }
  };

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

          <form className="input-form" onSubmit={handleAnalyze}>
            <input 
              name="username"
              type="text" 
              placeholder="Username (e.g. user123)" 
              className="styled-input"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <div className="input-grid">
              <input 
                name="followers"
                type="number" 
                placeholder="Followers" 
                className="styled-input" 
                value={formData.followers}
                onChange={handleChange}
                required
              />
              <input 
                name="following"
                type="number" 
                placeholder="Following" 
                className="styled-input" 
                value={formData.following}
                onChange={handleChange}
                required
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '10px 0' }}>
              <input 
                name="isPrivate"
                type="checkbox" 
                checked={formData.isPrivate}
                onChange={handleChange}
              />
              <label style={{ color: 'white' }}>Is Private Account?</label>
            </div>
            
            <button type="submit" className="analyze-btn" disabled={loading}>
              {loading ? "Analyzing via AI..." : "Analyze Account"}
            </button>
          </form>

          {/* Result Display Section */}
          {result && (
            <div className={`result-card ${result.status.toLowerCase()}`}>
              <h3>Result: {result.status}</h3>
              <p>Confidence: {result.riskScore}%</p>
              <p>Checked at: {new Date(result.checkedAt).toLocaleTimeString()}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;