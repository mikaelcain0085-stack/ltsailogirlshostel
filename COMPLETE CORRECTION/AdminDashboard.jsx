import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

function AdminDashboard() {
  const [enquiries, setEnquiries] = useState([]);
  const [applications, setApplications] = useState([]);
  const [photos, setPhotos] = useState([]);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH ADMIN DATA
  ========================= */

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Fetch enquiries
        const enquirySnapshot = await getDocs(
          collection(db, "enquiries")
        );

        const enquiryData = enquirySnapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setEnquiries(enquiryData);

        // Fetch applications
        const applicationSnapshot = await getDocs(
          collection(db, "applications")
        );

        const applicationData = applicationSnapshot.docs.map(
          (item) => ({
            id: item.id,
            ...item.data(),
          })
        );

        setApplications(applicationData);

        // Fetch hosteller photos
        const photoSnapshot = await getDocs(
          collection(db, "hostellerPhotos")
        );

        const photoData = photoSnapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setPhotos(photoData);
      } catch (error) {
        console.error(
          "Error fetching admin data:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  /* =========================
     DELETE ENQUIRY
  ========================= */

  const handleDeleteEnquiry = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this enquiry?"
    );

    if (!confirmed) return;

    try {
      await deleteDoc(
        doc(db, "enquiries", id)
      );

      setEnquiries((prev) =>
        prev.filter(
          (enquiry) => enquiry.id !== id
        )
      );
    } catch (error) {
      console.error(
        "Error deleting enquiry:",
        error
      );

      alert("Failed to delete enquiry.");
    }
  };

  /* =========================
     DELETE APPLICATION
  ========================= */

  const handleDeleteApplication = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this application?"
    );

    if (!confirmed) return;

    try {
      await deleteDoc(
        doc(db, "applications", id)
      );

      setApplications((prev) =>
        prev.filter(
          (application) =>
            application.id !== id
        )
      );
    } catch (error) {
      console.error(
        "Error deleting application:",
        error
      );

      alert("Failed to delete application.");
    }
  };

  /* =========================
     APPROVE PHOTO
  ========================= */

  const handleApprovePhoto = async (id) => {
    try {
      await updateDoc(
        doc(db, "hostellerPhotos", id),
        {
          status: "approved",
        }
      );

      setPhotos((prev) =>
        prev.map((photo) =>
          photo.id === id
            ? {
                ...photo,
                status: "approved",
              }
            : photo
        )
      );
    } catch (error) {
      console.error(
        "Error approving photo:",
        error
      );

      alert("Failed to approve photo.");
    }
  };

  /* =========================
     DELETE PHOTO
  ========================= */

  const handleDeletePhoto = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this photo?"
    );

    if (!confirmed) return;

    try {
      await deleteDoc(
        doc(db, "hostellerPhotos", id)
      );

      setPhotos((prev) =>
        prev.filter(
          (photo) => photo.id !== id
        )
      );
    } catch (error) {
      console.error(
        "Error deleting photo:",
        error
      );

      alert("Failed to delete photo.");
    }
  };

  /* =========================
     STATISTICS
  ========================= */

  const pendingApplications = applications.filter(
    (application) =>
      application.status === "new" ||
      application.status === "pending" ||
      !application.status
  ).length;

  const pendingPhotos = photos.filter(
    (photo) =>
      photo.status === "pending" ||
      !photo.status
  ).length;

  /* =========================
     LOADING SCREEN
  ========================= */

  if (loading) {
    return (
      <div className="admin-loading">
        Loading Admin Dashboard...
      </div>
    );
  }

  return (
    <div className="admin-dashboard">

      {/* SIDEBAR */}

      <aside className="admin-sidebar">

        <div className="admin-logo">

  <div>
    <h2>LT Sailo</h2>
    <span>Girls Hostel Admin</span>
  </div>

  <Link
    to="/"
    className="admin-home-button"
  >
    ← Back Home
  </Link>

</div>
        <nav className="admin-nav">

          <button
            className={
              activeTab === "dashboard"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab("dashboard")
            }
          >
            📊 Dashboard
          </button>

          <button
            className={
              activeTab === "enquiries"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab("enquiries")
            }
          >
            📨 Enquiries
          </button>

          <button
            className={
              activeTab === "applications"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab("applications")
            }
          >
            🛏️ Applications
          </button>

          <button
            className={
              activeTab === "photos"
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveTab("photos")
            }
          >
            📸 Hosteller Photos
          </button>

        </nav>

      </aside>

      {/* MAIN CONTENT */}

      <main className="admin-main">

        {/* =========================
            DASHBOARD
        ========================= */}

        {activeTab === "dashboard" && (
          <>
            <div className="admin-header">

              <div>
                <h1>
                  Admin Dashboard
                </h1>

                <p>
                  Manage LT Sailo Girls Hostel
                </p>
              </div>

            </div>

            <div className="stats-grid">

              <div className="stat-card">
                <span>📨</span>

                <div>
                  <h3>
                    {enquiries.length}
                  </h3>

                  <p>
                    Total Enquiries
                  </p>
                </div>
              </div>

              <div className="stat-card">
                <span>🛏️</span>

                <div>
                  <h3>
                    {applications.length}
                  </h3>

                  <p>
                    Total Applications
                  </p>
                </div>
              </div>

              <div className="stat-card">
                <span>⏳</span>

                <div>
                  <h3>
                    {pendingApplications}
                  </h3>

                  <p>
                    Pending Applications
                  </p>
                </div>
              </div>

              <div className="stat-card">
                <span>📸</span>

                <div>
                  <h3>
                    {pendingPhotos}
                  </h3>

                  <p>
                    Pending Photos
                  </p>
                </div>
              </div>

            </div>
          </>
        )}

        {/* =========================
            ENQUIRIES
        ========================= */}

        {activeTab === "enquiries" && (
          <section className="admin-section">

            <h1>
              Enquiries
            </h1>

            {enquiries.length === 0 ? (
              <p>
                No enquiries found.
              </p>
            ) : (
              <div className="admin-table-container">

                <table className="admin-table">

                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Message</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>

                    {enquiries.map((enquiry) => (
                      <tr key={enquiry.id}>

                        <td>
                          {enquiry.fullName || "-"}
                        </td>

                        <td>
                          {enquiry.email || "-"}
                        </td>

                        <td>
                          {enquiry.phone || "-"}
                        </td>

                        <td>
                          {enquiry.message || "-"}
                        </td>

                        <td>
                          <button
                            className="admin-delete-button"
                            onClick={() =>
                              handleDeleteEnquiry(
                                enquiry.id
                              )
                            }
                          >
                            Delete
                          </button>
                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>
            )}

          </section>
        )}

        {/* =========================
            APPLICATIONS
        ========================= */}

        {activeTab === "applications" && (
          <section className="admin-section">

            <h1>
              Hostel Applications
            </h1>

            {applications.length === 0 ? (
              <p>
                No applications found.
              </p>
            ) : (
              <div className="admin-table-container">

                <table className="admin-table">

                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>

                    {applications.map((application) => (
                      <tr key={application.id}>

                        <td>
                          {application.fullName || "-"}
                        </td>

                        <td>
                          {application.phone || "-"}
                        </td>

                        <td>
                          {application.email || "-"}
                        </td>

                        <td>
                          <span className="status-pending">
                            {application.status || "new"}
                          </span>
                        </td>

                        <td>
                          <button
                            className="admin-delete-button"
                            onClick={() =>
                              handleDeleteApplication(
                                application.id
                              )
                            }
                          >
                            Delete
                          </button>
                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>
            )}

          </section>
        )}

        {/* =========================
            HOSTELLER PHOTOS
        ========================= */}

        {activeTab === "photos" && (
          <section className="admin-section">

            <h1>
              Hosteller Photos
            </h1>

            {photos.length === 0 ? (
              <p>
                No hosteller photos found.
              </p>
            ) : (
              <div className="photo-admin-grid">

                {photos.map((photo) => (
                  <div
                    className="photo-admin-card"
                    key={photo.id}
                  >

                    <img
                      src={photo.imageUrl}
                      alt="Hosteller upload"
                    />

                    <div className="photo-admin-info">

                      <p>
                        Status:

                        <span
                          className={
                            photo.status === "approved"
                              ? "status-approved"
                              : "status-pending"
                          }
                        >
                          {photo.status || "pending"}
                        </span>
                      </p>

                      <div className="photo-admin-actions">

                        {photo.status !== "approved" && (
                          <button
                            className="admin-approve-button"
                            onClick={() =>
                              handleApprovePhoto(
                                photo.id
                              )
                            }
                          >
                            Approve
                          </button>
                        )}

                        <button
                          className="admin-delete-button"
                          onClick={() =>
                            handleDeletePhoto(
                              photo.id
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </div>

                  </div>
                ))}

              </div>
            )}

          </section>
        )}

      </main>

    </div>
  );
}

export default AdminDashboard;