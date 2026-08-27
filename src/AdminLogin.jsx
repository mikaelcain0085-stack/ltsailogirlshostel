import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LockKeyhole } from "lucide-react";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "ltsailo123";

function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      navigate("/admin/dashboard");
      return;
    }

    setError("Incorrect admin ID or password.");
  };

  return (
    <main className="admin-login-page">
      <div className="admin-login-container">
        <Link to="/" className="admin-login-back">
          ← Back to Home
        </Link>

        <section className="admin-login-card">
          <div className="admin-login-header">
            <div className="admin-login-icon">
              <LockKeyhole size={28} />
            </div>
            <h1>Admin Console</h1>
            <p>
              Sign in to manage enquiries, applications
              and hosteller photos.
            </p>
          </div>

          <form className="admin-login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="admin-username">ADMIN ID</label>
              <input
                id="admin-username"
                type="text"
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);
                  setError("");
                }}
                placeholder="Enter admin ID"
                autoComplete="username"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="admin-password">PASSWORD</label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                placeholder="Enter password"
                autoComplete="current-password"
                required
              />
            </div>

            {error && <p className="admin-login-error">{error}</p>}

            <button type="submit" className="admin-login-button">
              Enter Admin Console
            </button>
          </form>

          <p className="admin-login-footer">
            LT Sailo Girls Hostel · Administration
          </p>
        </section>
      </div>
    </main>
  );
}

export default AdminLogin;
