import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useState } from "react";
import { ArrowRight, Heart, Menu, X } from "lucide-react";

import AdminDashboard from "./AdminDashboard";
import AdminLogin from "./AdminLogin";
import Gallery from "./Gallery";

import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebase";


function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  /* =========================
     ENQUIRY FORM
  ========================== */

  const [enquiry, setEnquiry] = useState({
    fullName: "",
    phone: "",
    email: "",
    collegeWorkplace: "",
    preferredRoom: "",
    joiningDate: "",
    message: "",
  });

  const [enquiryStatus, setEnquiryStatus] = useState("");
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);

  const handleEnquiryChange = (e) => {
    const { name, value } = e.target;

    setEnquiry((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();

    setEnquiryStatus("");
    setIsSubmittingEnquiry(true);

    try {
      await addDoc(collection(db, "enquiries"), {
        ...enquiry,
        status: "new",
        createdAt: serverTimestamp(),
      });

      setEnquiryStatus("success");

      setEnquiry({
        fullName: "",
        phone: "",
        email: "",
        collegeWorkplace: "",
        preferredRoom: "",
        joiningDate: "",
        message: "",
      });
    } catch (error) {
      console.error("Error saving enquiry:", error);
      setEnquiryStatus("error");
    } finally {
      setIsSubmittingEnquiry(false);
    }
  };

  /* =========================
     APPLICATION FORM
  ========================== */

  const [application, setApplication] = useState({
    fullName: "",
    dateOfBirth: "",
    phone: "",
    email: "",
    homeAddress: "",
    institution: "",
    courseProfession: "",
    yearSemester: "",
    joiningDate: "",
    guardianName: "",
    guardianPhone: "",
    emergencyContact: "",
  });

  const [applicationStatus, setApplicationStatus] = useState("");
  const [isSubmittingApplication, setIsSubmittingApplication] =
    useState(false);

  const handleApplicationChange = (e) => {
    const { name, value } = e.target;

    setApplication((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplicationSubmit = async (e) => {
    e.preventDefault();

    setApplicationStatus("");
    setIsSubmittingApplication(true);

    try {
      await addDoc(collection(db, "applications"), {
        ...application,
        status: "new",
        createdAt: serverTimestamp(),
      });

      setApplicationStatus("success");

      setApplication({
        fullName: "",
        dateOfBirth: "",
        phone: "",
        email: "",
        homeAddress: "",
        institution: "",
        courseProfession: "",
        yearSemester: "",
        joiningDate: "",
        guardianName: "",
        guardianPhone: "",
        emergencyContact: "",
      });
    } catch (error) {
      console.error("Error saving application:", error);
      setApplicationStatus("error");
    } finally {
      setIsSubmittingApplication(false);
    }
  };

  /* =========================
     PHOTO UPLOAD
  ========================== */

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoStatus, setPhotoStatus] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (
      file.type !== "image/jpeg" &&
      file.type !== "image/png" &&
      file.type !== "image/webp"
    ) {
      setSelectedPhoto(null);
      setPhotoStatus("invalid");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setSelectedPhoto(null);
      setPhotoStatus("tooLarge");
      return;
    }

    setSelectedPhoto(file);
    setPhotoStatus("");
  };

  const handlePhotoUpload = async () => {
    if (!selectedPhoto) {
      setPhotoStatus("noPhoto");
      return;
    }

    setIsUploadingPhoto(true);
    setPhotoStatus("");

    try {
      const formData = new FormData();

      formData.append("file", selectedPhoto);

      formData.append(
        "upload_preset",
        "lt_sailo_hostel_uploads"
      );

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/cnth8guf/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error?.message || "Photo upload failed"
        );
      }

      await addDoc(
        collection(db, "hostellerPhotos"),
        {
          imageUrl: data.secure_url,
          publicId: data.public_id,
          status: "pending",
          createdAt: serverTimestamp(),
        }
      );

      setSelectedPhoto(null);
      setPhotoStatus("success");

      const photoInput =
        document.getElementById("photo-upload");

      if (photoInput) {
        photoInput.value = "";
      }
    } catch (error) {
      console.error(
        "Photo upload error:",
        error
      );

      setPhotoStatus("error");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            HOME PAGE
        ========================== */}

        <Route
          path="/"
          element={
            <main className="app">

              {/* Ambient Background */}

              <div className="ambient ambient-one"></div>
              <div className="ambient ambient-two"></div>
              <div className="ambient ambient-three"></div>

              {/* Navigation */}

              <nav className="navbar">

                <div className="nav-container">

                  <a href="#home" className="carved-brand">
                      LT Sailo Girls Hostel
                  </a>

                  <div
                    className={`nav-links ${
                      menuOpen ? "active" : ""
                    }`}
                  >

                    <a
                      href="#home"
                      onClick={() =>
                        setMenuOpen(false)
                      }
                    >
                      Home
                    </a>

                    <a
                      href="#enquiry"
                      onClick={() =>
                        setMenuOpen(false)
                      }
                    >
                      Enquiry
                    </a>

                    <a
                      href="#hostellers"
                      onClick={() =>
                        setMenuOpen(false)
                      }
                    >
                      Gallery
                    </a>

                    <a
                      href="#apply"
                      className="nav-button"
                      onClick={() =>
                        setMenuOpen(false)
                      }
                    >
                      Apply Now
                    </a>
                    <Link
  to="/admin"
  className="admin-console-button"
  onClick={() =>
    setMenuOpen(false)
  }
>
  Admin Console
</Link>

                  </div>

                  <button
                    className="menu-button"
                    onClick={() =>
                      setMenuOpen(!menuOpen)
                    }
                    aria-label="Toggle menu"
                  >
                    {menuOpen ? (
                      <X size={22} />
                    ) : (
                      <Menu size={22} />
                    )}
                  </button>

                </div>

              </nav>

              {/* =========================
                  HERO SECTION
              ========================== */}

              <section
                className="hero"
                id="home"
              >

                <div className="hero-content">

                  <div className="eyebrow">
                    <Heart
                      size={15}
                      fill="currentColor"
                    />

                    <span>
                      WELCOME HOME
                    </span>
                  </div>

                  <h1>
                    Zirlai tana hostel
                    <span>
                      nuam leh fai.
                    </span>
                  </h1>

                  <p className="hero-description">
                    More than a hostel. A thoughtfully
                    designed space where comfort,
                    connection and beautiful memories
                    come together.
                  </p>

                  <div className="hero-actions">

                    <a
                      href="#apply"
                      className="primary-button"
                    >
                      Apply for a Seat

                      <ArrowRight size={18} />
                    </a>

                    <a
                      href="#enquiry"
                      className="secondary-button"
                    >
                      Enquire Now
                    </a>

                  </div>

                  <div className="hero-meta">

                    <div>
                      <strong>
                        Comfort
                      </strong>

                      <span>
                        Made for you
                      </span>
                    </div>

                    <div className="meta-line"></div>

                    <div>
                      <strong>
                        Community
                      </strong>

                      <span>
                        Grow together
                      </span>
                    </div>

                    <div className="meta-line"></div>

                    <div>
                      <strong>
                        Memories
                      </strong>

                      <span>
                        Made here
                      </span>
                    </div>

                  </div>

                </div>

                {/* Hero Visual */}

                <div className="hero-visual">

                  <div className="glass-orb orb-one"></div>

                  <div className="glass-orb orb-two"></div>

                  <div className="hero-glass-card">

                    <div className="glass-top">
                      <span className="live-dot"></span>

                      <span>
                        LT SAILO RESIDENCE.
                        COLLEGE VENG,AIZAWL.
                      </span>
                    </div>

                    <div className="glass-content">

                      <span className="small-label">
                        YOUR NEXT CHAPTER
                      </span>

                      <h2>
                        LT Sailo
                        <br />

                        Girls
                        <br />

                        <em>
                          Hostel
                        </em>
                      </h2>

                    </div>

                    <div className="glass-footer">

                      <span>
                        PHN Num : 7640997973
                      </span>

                      <ArrowRight size={18} />

                    </div>

                  </div>

                </div>

                <div className="scroll-indicator">

                  <span>
                    SCROLL TO EXPLORE
                  </span>

                  <div className="scroll-line"></div>

                </div>

              </section>

              {/* =========================
                  ENQUIRY SECTION
              ========================== */}

              <section
                className="enquiry-section"
                id="enquiry"
              >

                <div className="enquiry-intro">

                  <div className="section-label">
                    <span></span>

                    FIND YOUR SPACE
                  </div>

                  <h2>
                    Hostel location rem tak

                    <span>
                      i zawn chuan.
                    </span>
                  </h2>

                  <p>
                     Enquiry Form hi Fill up la,
                    i duh anga zirin seat kan lo
                    ngaihtuah sak dawn che ania.
                  </p>

                  <div className="enquiry-details">

                    <div className="detail-item">

                      <span className="detail-number">
                        01
                      </span>

                      <div>
                        <strong>
                          Tell us about you
                        </strong>

                        <p>
                          A few simple details
                          to get started.
                        </p>
                      </div>

                    </div>

                    <div className="detail-item">

                      <span className="detail-number">
                        02
                      </span>

                      <div>
                        <strong>
                          We'll get in touch
                        </strong>

                        <p>
                          Our team can help
                          answer your questions.
                        </p>
                      </div>

                    </div>

                    <div className="detail-item">

                      <span className="detail-number">
                        03
                      </span>

                      <div>
                        <strong>
                          Find your place
                        </strong>

                        <p>
                          Explore the possibility
                          of joining our community.
                        </p>
                      </div>

                    </div>

                  </div>

                </div>

                <div className="enquiry-form-card">

                  <div className="form-card-glow"></div>

                  <div className="form-header">

                    <span>
                      ENQUIRY FORM
                    </span>

                    <span className="form-status">
                      <i></i>

                      OPEN
                    </span>

                  </div>

                  <form
                    className="enquiry-form"
                    onSubmit={
                      handleEnquirySubmit
                    }
                  >

                    <div className="form-row">

                      <div className="form-group">

                        <label>
                          FULL NAME
                        </label>

                        <input
                          type="text"
                          name="fullName"
                          placeholder="Your name"
                          value={enquiry.fullName}
                          onChange={
                            handleEnquiryChange
                          }
                          required
                        />

                      </div>

                      <div className="form-group">

                        <label>
                          PHONE NUMBER
                        </label>

                        <input
                          type="tel"
                          name="phone"
                          placeholder="+91"
                          value={enquiry.phone}
                          onChange={
                            handleEnquiryChange
                          }
                          required
                        />

                      </div>

                    </div>

                    <div className="form-group">

                      <label>
                        EMAIL ADDRESS
                      </label>

                      <input
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={enquiry.email}
                        onChange={
                          handleEnquiryChange
                        }
                        required
                      />

                    </div>

                    <div className="form-row">

                      <div className="form-group">

                        <label>
                          COLLEGE / WORKPLACE
                        </label>

                        <input
                          type="text"
                          name="collegeWorkplace"
                          placeholder="Where do you study or work?"
                          value={
                            enquiry.collegeWorkplace
                          }
                          onChange={
                            handleEnquiryChange
                          }
                        />

                      </div>

                      <div className="form-group">

                        <label>
                          PREFERRED ROOM
                        </label>

                        <select
                          name="preferredRoom"
                          value={
                            enquiry.preferredRoom
                          }
                          onChange={
                            handleEnquiryChange
                          }
                          required
                        >

                          <option
                            value=""
                            disabled
                          >
                            Select
                          </option>

                          <option value="Single Sharing">
                            Single Sharing
                          </option>

                          <option value="Double Sharing">
                            Double Sharing
                          </option>

                          <option value="Any Available">
                            Any Available
                          </option>

                        </select>

                      </div>

                    </div>

                    <div className="form-group">

                      <label>
                        EXPECTED JOINING DATE
                      </label>

                      <input
                        type="date"
                        name="joiningDate"
                        value={
                          enquiry.joiningDate
                        }
                        onChange={
                          handleEnquiryChange
                        }
                      />

                    </div>

                    <div className="form-group">

                      <label>
                        MESSAGE
                      </label>

                      <textarea
                        name="message"
                        rows="4"
                        placeholder="Tell us anything you'd like us to know..."
                        value={enquiry.message}
                        onChange={
                          handleEnquiryChange
                        }
                      ></textarea>

                    </div>

                    <button
                      type="submit"
                      className="enquiry-submit"
                      disabled={
                        isSubmittingEnquiry
                      }
                    >

                      {isSubmittingEnquiry
                        ? "Sending..."
                        : "Send Enquiry"}

                      <span>
                        ↗
                      </span>

                    </button>

                    {enquiryStatus ===
                      "success" && (
                        <p className="form-success">
                          ✦ Your enquiry has been
                          sent successfully!
                        </p>
                      )}

                    {enquiryStatus ===
                      "error" && (
                        <p className="form-error">
                          Something went wrong.
                          Please try again.
                        </p>
                      )}

                    <p className="form-note">
                      By submitting this form, you
                      agree to be contacted regarding
                      hostel availability.
                    </p>

                  </form>

                </div>

              </section>

              {/* =========================
                  APPLICATION SECTION
              ========================== */}

              <section
                className="application-section"
                id="apply"
              >

                <div className="application-top">

                  <div>

                    <div className="section-label">
                      <span></span>

                      START YOUR JOURNEY
                    </div>

                    <h2>
                     

                      <span>
                       Hostel Seats.
                      </span>

                      
                    </h2>

                  </div>

                  <p>
                    Hoostel seat ala awm anih chuan,
                    a hnuaia application Form khu
                    fill up la apply ve ang che.
                    
                  </p>

                </div>

                <div className="application-layout">

                  <div className="application-side">

                    <div className="application-info-card">

                      <span className="info-mini-label">
                        THE APPLICATION
                      </span>

                      <h3>
                        Apply

                        <em>
                          ve
                        </em>

                        rawh le.
                      </h3>

                      <p>
                        Fill in your details carefully.
                        Your application will be
                        reviewed by the LT Sailo Girls
                        Hostel administration.
                      </p>

                      <div className="application-steps">

                        <div className="application-step">
                          <span>01</span>

                          <p>
                            Personal details
                          </p>
                        </div>

                        <div className="application-step">
                          <span>02</span>

                          <p>
                            Academic or work
                            information
                          </p>
                        </div>

                        <div className="application-step">
                          <span>03</span>

                          <p>
                            Guardian & emergency
                            contact
                          </p>
                        </div>

                        <div className="application-step">
                          <span>04</span>

                          <p>
                            Application review
                          </p>
                        </div>

                      </div>

                    </div>

                  </div>

                  <div className="application-form-card">

                    <div className="application-card-header">

                      <div>

                        <span>
                          HOSTEL SEAT APPLICATION
                        </span>

                        <p>
                          Please complete all
                          required information.
                        </p>

                      </div>

                      <span className="application-badge">
                        2026
                      </span>

                    </div>

                    <form
                      className="application-form"
                      onSubmit={
                        handleApplicationSubmit
                      }
                    >

                      <div className="form-section-title">

                        <span>01</span>

                        <div>
                          <h4>
                            About You
                          </h4>

                          <p>
                            Let's start with
                            the basics.
                          </p>
                        </div>

                      </div>

                      <div className="form-row">

                        <div className="form-group">

                          <label>
                            FULL NAME
                          </label>

                          <input
                            type="text"
                            name="fullName"
                            placeholder="Your full name"
                            value={
                              application.fullName
                            }
                            onChange={
                              handleApplicationChange
                            }
                            required
                          />

                        </div>

                        <div className="form-group">

                          <label>
                            DATE OF BIRTH
                          </label>

                          <input
                            type="date"
                            name="dateOfBirth"
                            value={
                              application.dateOfBirth
                            }
                            onChange={
                              handleApplicationChange
                            }
                            required
                          />

                        </div>

                      </div>

                      <div className="form-row">

                        <div className="form-group">

                          <label>
                            PHONE NUMBER
                          </label>

                          <input
                            type="tel"
                            name="phone"
                            placeholder="+91"
                            value={
                              application.phone
                            }
                            onChange={
                              handleApplicationChange
                            }
                            required
                          />

                        </div>

                        <div className="form-group">

                          <label>
                            EMAIL ADDRESS
                          </label>

                          <input
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={
                              application.email
                            }
                            onChange={
                              handleApplicationChange
                            }
                            required
                          />

                        </div>

                      </div>

                      <div className="form-group">

                        <label>
                          HOME ADDRESS
                        </label>

                        <textarea
                          name="homeAddress"
                          rows="3"
                          placeholder="Your permanent address"
                          value={
                            application.homeAddress
                          }
                          onChange={
                            handleApplicationChange
                          }
                          required
                        ></textarea>

                      </div>

                      <div className="form-section-title">

                        <span>02</span>

                        <div>

                          <h4>
                            Study or Work
                          </h4>

                          <p>
                            Tell us what brings
                            you here.
                          </p>

                        </div>

                      </div>

                      <div className="form-row">

                        <div className="form-group">

                          <label>
                            COLLEGE / UNIVERSITY /
                            WORKPLACE
                          </label>

                          <input
                            type="text"
                            name="institution"
                            placeholder="Institution or workplace"
                            value={
                              application.institution
                            }
                            onChange={
                              handleApplicationChange
                            }
                            required
                          />

                        </div>

                        <div className="form-group">

                          <label>
                            COURSE / PROFESSION
                          </label>

                          <input
                            type="text"
                            name="courseProfession"
                            placeholder="Your course or profession"
                            value={
                              application.courseProfession
                            }
                            onChange={
                              handleApplicationChange
                            }
                            required
                          />

                        </div>

                      </div>

                      <div className="form-row">

                        <div className="form-group">

                          <label>
                            YEAR / SEMESTER
                          </label>

                          <input
                            type="text"
                            name="yearSemester"
                            placeholder="Example: 3rd Year"
                            value={
                              application.yearSemester
                            }
                            onChange={
                              handleApplicationChange
                            }
                            required
                          />

                        </div>

                        <div className="form-group">

                          <label>
                            EXPECTED JOINING DATE
                          </label>

                          <input
                            type="date"
                            name="joiningDate"
                            value={
                              application.joiningDate
                            }
                            onChange={
                              handleApplicationChange
                            }
                            required
                          />

                        </div>

                      </div>

                      <div className="form-section-title">

                        <span>03</span>

                        <div>

                          <h4>
                            Guardian & Emergency
                            Contact
                          </h4>

                          <p>
                            Someone we can contact
                            if needed.
                          </p>

                        </div>

                      </div>

                      <div className="form-row">

                        <div className="form-group">

                          <label>
                            PARENT / GUARDIAN NAME
                          </label>

                          <input
                            type="text"
                            name="guardianName"
                            placeholder="Full name"
                            value={
                              application.guardianName
                            }
                            onChange={
                              handleApplicationChange
                            }
                            required
                          />

                        </div>

                        <div className="form-group">

                          <label>
                            GUARDIAN PHONE NUMBER
                          </label>

                          <input
                            type="tel"
                            name="guardianPhone"
                            placeholder="+91"
                            value={
                              application.guardianPhone
                            }
                            onChange={
                              handleApplicationChange
                            }
                            required
                          />

                        </div>

                      </div>

                      <div className="form-group">

                        <label>
                          EMERGENCY CONTACT
                        </label>

                        <input
                          type="tel"
                          name="emergencyContact"
                          placeholder="Emergency phone number"
                          value={
                            application.emergencyContact
                          }
                          onChange={
                            handleApplicationChange
                          }
                          required
                        />

                      </div>

                      <button
                        type="submit"
                        className="application-submit"
                        disabled={
                          isSubmittingApplication
                        }
                      >

                        <span>
                          {isSubmittingApplication
                            ? "Submitting..."
                            : "Submit Application"}
                        </span>

                        <span className="submit-arrow">
                          ↗
                        </span>

                      </button>

                      {applicationStatus ===
                        "success" && (
                          <p className="form-success">
                            ✦ Your application has
                            been submitted successfully!
                          </p>
                        )}

                      {applicationStatus ===
                        "error" && (
                          <p className="form-error">
                            Something went wrong.
                            Please try again.
                          </p>
                        )}

                      <p className="application-note">
                        Submitting an application
                        does not guarantee a hostel
                        seat. Our administration
                        will review your application
                        and contact you regarding
                        the next steps.
                      </p>

                    </form>

                  </div>

                </div>

              </section>

              {/* =========================
                  HOSTELLER GALLERY SECTION
              ========================== */}

              <section
                className="hosteller-section"
                id="hostellers"
              >

                <div className="hosteller-top">

                  <div>

                    <div className="section-label">
                      <span></span>

                      OUR MEMORIES
                    </div>

                    <h2>
                      Thlalak dah

                      <span>
                        thatna.
                      </span>
                    </h2>

                  </div>

                  <p>
                    Every hostel has its stories.
                    Share your favourite moments,
                    friendships and memories with
                    the LT Sailo community.
                  </p>

                </div>

                <div className="hosteller-layout">

                  {/* Memory Preview */}

                  <div className="memory-preview">

                    <div className="memory-orb orb-one"></div>

                    <div className="memory-orb orb-two"></div>

                    <div className="memory-preview-content">

                      <span className="memory-label">
                        LT SAILO ARCHIVE
                      </span>

                      <h3>
                        A collection of

                        <em>
                          our moments.
                        </em>
                      </h3>

                      <p>
                        Little snapshots of everyday
                        life, friendships,
                        celebrations and everything
                        in between.
                      </p>

                      <Link
                        to="/gallery"
                        className="visit-gallery"
                      >

                        <span>
                          Visit Gallery
                        </span>

                        <span className="gallery-arrow">
                          ↗
                        </span>

                      </Link>

                    </div>

                    <div className="polaroid-stack">

                      <div className="polaroid polaroid-one">

                        <div className="polaroid-image polaroid-gradient-one"></div>

                        <span>
                          good days
                        </span>

                      </div>

                      <div className="polaroid polaroid-two">

                        <div className="polaroid-image polaroid-gradient-two"></div>

                        <span>
                          together ✦
                        </span>

                      </div>

                      <div className="polaroid polaroid-three">

                        <div className="polaroid-image polaroid-gradient-three"></div>

                        <span>
                          LT memories
                        </span>

                      </div>

                    </div>

                  </div>

                  {/* Upload Card */}

                  <div className="upload-card">

                    <div className="upload-card-header">

                      <div>

                        <span>
                          HOSTELLER SPACE
                        </span>

                        <p>
                          Share a moment with us.
                        </p>

                      </div>

                      <div className="upload-status">

                        <span></span>

                        COMMUNITY

                      </div>

                    </div>

                    <div className="upload-zone">

                      <input
                        type="file"
                        id="photo-upload"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={
                          handlePhotoChange
                        }
                        hidden
                      />

                      <label
                        htmlFor="photo-upload"
                        className="upload-label"
                      >

                        <div className="upload-icon">
                          ↑
                        </div>

                        <h4>
                          {selectedPhoto
                            ? "Photo selected ✦"
                            : "Thlalak Upload rawh le"}
                        </h4>

                        <p>
                          {selectedPhoto
                            ? selectedPhoto.name
                            : "I thlalak upload te Admin in  a approve hunah Visit Gallery atangin i en thei ang."}
                        </p>

                        <span className="upload-browse">
                          {selectedPhoto
                            ? "Change Photo"
                            : "Browse Photos"}
                        </span>

                      </label>

                    </div>

                    <div className="upload-info">

                      <span>
                        JPG, PNG or WEBP
                      </span>

                      <span>
                        Max 10MB
                      </span>

                    </div>

                    <button
                      type="button"
                      className="photo-upload-button"
                      onClick={
                        handlePhotoUpload
                      }
                      disabled={
                        isUploadingPhoto
                      }
                    >

                      {isUploadingPhoto
                        ? "Uploading..."
                        : "Share Memory"}

                      <span>
                        ↗
                      </span>

                    </button>

                    {photoStatus ===
                      "noPhoto" && (
                        <p className="photo-message error">
                          Please choose a photo first.
                        </p>
                      )}

                    {photoStatus ===
                      "invalid" && (
                        <p className="photo-message error">
                          Please select a JPG, PNG,
                          or WEBP image.
                        </p>
                      )}

                    {photoStatus ===
                      "tooLarge" && (
                        <p className="photo-message error">
                          Photo must be smaller
                          than 10MB.
                        </p>
                      )}

                    {photoStatus ===
                      "success" && (
                        <p className="photo-message success">
                          ✦ Your memory has been
                          shared successfully!
                        </p>
                      )}

                    {photoStatus ===
                      "error" && (
                        <p className="photo-message error">
                          Upload failed. Please
                          try again.
                        </p>
                      )}

                  </div>

                </div>

              </section>

            </main>
          }
        />

        {/* GALLERY PAGE */}

        <Route
          path="/gallery"
          element={<Gallery />}
        />
        
        {/* ADMIN DASHBOARD */}

       {/* ADMIN LOGIN */}

<Route
  path="/admin"
  element={<AdminLogin />}
/>

{/* ADMIN DASHBOARD */}

<Route
  path="/admin/dashboard"
  element={<AdminDashboard />}
/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;