import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); 
  
  const [formData, setFormData] = useState({
    username: '',
    followers: '',
    following: '',
    isPrivate: false,
  });

  // Splash screen timer
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

    const handleAnalyze = async (e) => {
      e.preventDefault();
      setLoading(true);
      setResult(null);

      const username = formData.username;
      const followers = parseFloat(formData.followers) || 0;
      const following = parseFloat(formData.following) || 0;

      // --- SMART FEATURE EXTRACTION ---
      const username_length = username.length;
      const username_has_number = /\d/.test(username) ? 1 : 0;
      
      // 1. Guess Full Name stats based on username
      const full_name_length = Math.max(username_length - 2, 5); 
      const full_name_has_number = username_has_number; // Bots usually repeat numbers in both fields

      // 2. Logic-based guesses for binary features
      // If a name is very long and has numbers, it's likely a "Recent" or "Business" bot account
      const is_joined_recently = (username_has_number && username_length > 12) ? 1 : 0;
      const is_business_account = (followers > 1000 && !formData.isPrivate) ? 1 : 0;
      
      // 3. Set rare features to 0 (most common state)
      const has_channel = 0;
      const has_guides = 0;
      
      // 4. External URL (Real IDs with many followers often have one)
      const has_external_url = (followers > 500 && !username_has_number) ? 1 : 0;

      // Normalization for ML model
      const normalize = (val, max = 5000) => Math.min(val / max, 1);

      try {
        const response = await fetch("http://localhost:5000/api/check-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            platform: "instagram",
            username: username,
            stats: {
              edge_followed_by: normalize(followers),
              edge_follow: normalize(following),
              username_length: username_length,
              username_has_number: username_has_number,
              full_name_has_number: full_name_has_number,
              full_name_length: full_name_length,
              is_private: formData.isPrivate ? 1 : 0,
              is_joined_recently: is_joined_recently,
              has_channel: has_channel,
              is_business_account: is_business_account,
              has_guides: has_guides,
              has_external_url: has_external_url
            }
          }),
        });

        const json = await response.json();
        if (json.success) setResult(json.data);
        else alert("Error: " + json.error);
      } catch (err) {
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
        {result && <button className="reset-btn" onClick={() => setResult(null)}>New Scan</button>}
      </nav>

      <main className="hero">
        <div className="glass-card">
          <h1>Scan Profile</h1>
          <p>AI-powered bot detection system.</p>

          {!result ? (
            <form className="input-form" onSubmit={handleAnalyze}>
              <input 
                name="username"
                type="text" 
                placeholder="Username (e.g. bot_hunter_99)" 
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
              
              <div className="checkbox-container">
                <input 
                  name="isPrivate"
                  type="checkbox" 
                  id="isPrivate"
                  checked={formData.isPrivate}
                  onChange={handleChange}
                />
                <label htmlFor="isPrivate">Private Account?</label>
              </div>
              
              <button type="submit" className="analyze-btn" disabled={loading}>
                {loading ? "Analyzing via ML Model..." : "Analyze Account"}
              </button>
            </form>
          ) : (
            <div className={`result-card ${result.status.toLowerCase()}`}>
              <div className="result-header">
                <h3>Result: {result.status}</h3>
                <span className="badge">{result.isFake ? "⚠️ High Risk" : "✅ Safe"}</span>
              </div>
              <div className="score-box">
                <span className="score-label">Risk Score</span>
                <span className="score-value">{result.riskScore}%</span>
              </div>
              <div className="details">
                <p><strong>Username:</strong> {result.username}</p>
                <p><strong>Detected At:</strong> {new Date(result.checkedAt).toLocaleTimeString()}</p>
              </div>
              <button className="analyze-btn secondary" onClick={() => setResult(null)}>Back to Scanner</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;