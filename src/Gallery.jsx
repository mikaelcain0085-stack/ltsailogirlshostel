import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Image as ImageIcon,
} from "lucide-react";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApprovedPhotos = async () => {
      try {
        const photosQuery = query(
          collection(db, "hostellerPhotos"),
          where("status", "==", "approved")
        );

        const snapshot = await getDocs(
          photosQuery
        );

        const approvedPhotos =
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          }));

        setPhotos(approvedPhotos);
      } catch (error) {
        console.error(
          "Error fetching approved photos:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedPhotos();
  }, []);

  return (
    <main className="gallery-page">

      <div className="gallery-glow glow-one"></div>
      <div className="gallery-glow glow-two"></div>

      {/* NAVIGATION */}

      <nav className="gallery-nav">

        <Link
          to="/"
          className="gallery-back"
        >
          <ArrowLeft size={17} />

          <span>
            Back Home
          </span>
        </Link>

        <div className="gallery-brand">
          LT SAILO

          <span>
            GIRLS HOSTEL
          </span>
        </div>

        <div className="gallery-count">
          <ImageIcon size={15} />

          <span>
            {photos.length} MEMORIES
          </span>
        </div>

      </nav>

      {/* HERO */}

      <section className="gallery-hero">

        <div className="gallery-label">

          <span></span>

          THE MEMORY ARCHIVE

        </div>

        <h1>
          Little moments.

          <em>
            Beautiful memories.
          </em>
        </h1>

        <p>
          A collection of moments shared by the girls
          who make LT Sailo Girls Hostel feel like home.
        </p>

      </section>

      {/* GALLERY */}

      <section className="gallery-grid">

        {loading ? (

          <div className="gallery-loading">
            Loading memories...
          </div>

        ) : photos.length === 0 ? (

          <div className="gallery-empty">

            <ImageIcon size={40} />

            <h3>
              No memories yet
            </h3>

            <p>
              Be the first to share a beautiful
              memory with LT Sailo Girls Hostel.
            </p>

          </div>

        ) : (

          photos.map((photo, index) => (

            <div
              className={`gallery-card ${
                index % 5 === 0
                  ? "gallery-card-large"
                  : index % 5 === 2
                  ? "gallery-card-tall"
                  : index % 5 === 4
                  ? "gallery-card-wide"
                  : ""
              }`}
              key={photo.id}
            >

              <img
                src={photo.imageUrl}
                alt="LT Sailo memory"
                className="gallery-real-image"
              />

              <div className="gallery-card-overlay">

                <div className="gallery-card-info">

                  <span>
                    LT SAILO ✦
                  </span>

                  <Heart size={15} />

                </div>

              </div>

            </div>

          ))

        )}

      </section>

      {/* FOOTER */}

      <footer className="gallery-footer">

        <span>
          LT SAILO GIRLS HOSTEL
        </span>

        <p>
          Made of moments, friendships & memories.
        </p>

      </footer>

    </main>
  );
}

export default Gallery;