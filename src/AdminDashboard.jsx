import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { deleteHostellerPhoto } from "./imagekit";
import { Link } from "react-router-dom";

function AdminDashboard() {
  const [enquiries, setEnquiries] = useState([]);
  const [applications, setApplications] = useState([]);
  const [photos, setPhotos] = useState([]);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [availableSeats, setAvailableSeats] = useState("");
  const [seatUpdateStatus, setSeatUpdateStatus] = useState("");
  const [isUpdatingSeats, setIsUpdatingSeats] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const fetchSeatAvailability = async () => {
  try {
    const seatDoc = await getDoc(
      doc(db, "settings", "seatAvailability")
    );

    if (seatDoc.exists()) {
      setAvailableSeats(
        seatDoc.data().availableSeats ?? ""
      );
    }
  } catch (error) {
    console.error(
      "Error fetching seat availability:",
      error
    );
  }
};
const handleUpdateSeats = async () => {
  if (availableSeats === "") {
    setSeatUpdateStatus("Please enter the number of available seats.");
    return;
  }

  try {
    setIsUpdatingSeats(true);
    setSeatUpdateStatus("");

    await setDoc(
      doc(db, "settings", "seatAvailability"),
      {
        availableSeats: Number(availableSeats),
      }
    );

    setSeatUpdateStatus("Seats updated successfully!");
  } catch (error) {
    console.error("Error updating seats:", error);
    setSeatUpdateStatus("Failed to update seats.");
  } finally {
    setIsUpdatingSeats(false);
  }
};

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
        await fetchSeatAvailability();
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

      if (selectedEnquiry?.id === id) {
        setSelectedEnquiry(null);
      }
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

      if (selectedApplication?.id === id) {
        setSelectedApplication(null);
      }
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

  const handleDeletePhoto = async (photo) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this photo?"
    );

    if (!confirmed) return;

    try {
      if (photo.fileId) {
        await deleteHostellerPhoto(photo.fileId);
      }

      await deleteDoc(doc(db, "hostellerPhotos", photo.id));

      setPhotos((prev) =>
        prev.filter((item) => item.id !== photo.id)
      );
    } catch (error) {
      console.error("Error deleting photo:", error);
      alert("Failed to permanently delete photo.");
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
                        <div className="seat-management-card">
              <div>
                <h2>🛏️ Seat Availability</h2>
                <p>
                  Update the number of seats currently available.
                </p>
              </div>

              <div className="seat-management-controls">
                <input
                  type="number"
                  min="0"
                  value={availableSeats}
                  onChange={(e) =>
                    setAvailableSeats(e.target.value)
                  }
                  placeholder="Available seats"
                />

                <button
                  onClick={handleUpdateSeats}
                  disabled={isUpdatingSeats}
                >
                  {isUpdatingSeats
                    ? "Updating..."
                    : "Update Seats"}
                </button>
              </div>

              {seatUpdateStatus && (
                <p className="seat-update-status">
                  {seatUpdateStatus}
                </p>
              )}
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
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              flexWrap: "wrap",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedEnquiry(enquiry)
                              }
                              style={{
                                border: "none",
                                borderRadius: "8px",
                                padding: "8px 12px",
                                cursor: "pointer",
                                fontWeight: "600",
                              }}
                            >
                              View Details
                            </button>

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
                          </div>
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
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              flexWrap: "wrap",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedApplication(application)
                              }
                              style={{
                                border: "none",
                                borderRadius: "8px",
                                padding: "8px 12px",
                                cursor: "pointer",
                                fontWeight: "600",
                              }}
                            >
                              View Details
                            </button>

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
                          </div>
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
    handleDeletePhoto(photo)
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

      {selectedEnquiry && (
        <div
          onClick={() => setSelectedEnquiry(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0, 0, 0, 0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "700px",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#ffffff",
              color: "#222222",
              borderRadius: "16px",
              padding: "28px",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.35)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <div>
                <h2 style={{ margin: 0 }}>
                  Enquiry Details
                </h2>

                <p
                  style={{
                    margin: "6px 0 0",
                    color: "#666666",
                  }}
                >
                  {selectedEnquiry.fullName || "Enquirer"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                style={{
                  border: "none",
                  background: "#eeeeee",
                  borderRadius: "8px",
                  width: "38px",
                  height: "38px",
                  cursor: "pointer",
                  fontSize: "20px",
                }}
                aria-label="Close enquiry details"
              >
                ×
              </button>
            </div>

            <section>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "18px",
                }}
              >
                <div>
                  <strong>Full Name:</strong>
                  <br />
                  {selectedEnquiry.fullName || "-"}
                </div>

                <div>
                  <strong>Phone:</strong>
                  <br />
                  {selectedEnquiry.phone || "-"}
                </div>

                <div>
                  <strong>Email:</strong>
                  <br />
                  {selectedEnquiry.email || "-"}
                </div>

                <div>
                  <strong>College / Workplace:</strong>
                  <br />
                  {selectedEnquiry.collegeWorkplace || "-"}
                </div>

                <div>
                  <strong>Preferred Room:</strong>
                  <br />
                  {selectedEnquiry.preferredRoom || "-"}
                </div>

                <div>
                  <strong>Expected Joining Date:</strong>
                  <br />
                  {selectedEnquiry.joiningDate || "-"}
                </div>

                <div
                  style={{
                    gridColumn: "1 / -1",
                  }}
                >
                  <strong>Message:</strong>
                  <br />
                  <p
                    style={{
                      marginTop: "8px",
                      lineHeight: 1.7,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {selectedEnquiry.message || "-"}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      {selectedApplication && (
        <div
          onClick={() => setSelectedApplication(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0, 0, 0, 0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "760px",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#ffffff",
              color: "#222222",
              borderRadius: "16px",
              padding: "28px",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.35)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
              <div>
                <h2 style={{ margin: 0 }}>Application Details</h2>
                <p style={{ margin: "6px 0 0", color: "#666666" }}>
                  {selectedApplication.fullName || "Applicant"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedApplication(null)}
                style={{
                  border: "none",
                  background: "#eeeeee",
                  borderRadius: "8px",
                  width: "38px",
                  height: "38px",
                  cursor: "pointer",
                  fontSize: "20px",
                }}
                aria-label="Close application details"
              >
                ×
              </button>
            </div>

            <section style={{ marginBottom: "24px" }}>
              <h3>Personal Details</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
                <div><strong>Full Name:</strong><br />{selectedApplication.fullName || "-"}</div>
                <div><strong>Date of Birth:</strong><br />{selectedApplication.dateOfBirth || "-"}</div>
                <div><strong>Phone:</strong><br />{selectedApplication.phone || "-"}</div>
                <div><strong>Email:</strong><br />{selectedApplication.email || "-"}</div>
                <div style={{ gridColumn: "1 / -1" }}><strong>Home Address:</strong><br />{selectedApplication.homeAddress || "-"}</div>
              </div>
            </section>

            <section style={{ marginBottom: "24px" }}>
              <h3>Academic / Work Information</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
                <div><strong>Institution:</strong><br />{selectedApplication.institution || "-"}</div>
                <div><strong>Course / Profession:</strong><br />{selectedApplication.courseProfession || "-"}</div>
                <div><strong>Year / Semester:</strong><br />{selectedApplication.yearSemester || "-"}</div>
                <div><strong>Expected Joining Date:</strong><br />{selectedApplication.joiningDate || "-"}</div>
              </div>
            </section>

            <section>
              <h3>Guardian & Emergency Contact</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
                <div><strong>Guardian Name:</strong><br />{selectedApplication.guardianName || "-"}</div>
                <div><strong>Guardian Phone:</strong><br />{selectedApplication.guardianPhone || "-"}</div>
                <div><strong>Emergency Contact:</strong><br />{selectedApplication.emergencyContact || "-"}</div>
                <div><strong>Application Status:</strong><br />{selectedApplication.status || "new"}</div>
              </div>
            </section>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminDashboard;