import { useRef, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  ChevronDown,
  CircleHelp,
  Leaf,
  Menu,
  ScanLine,
  ShieldCheck,
  Sprout,
  Upload,
  X,
} from "lucide-react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  function chooseFile(selectedFile) {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("Please choose an image smaller than 10 MB.");
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);
    setError("");
  }

  async function analyzeLeaf() {
    if (!file) {
      fileInputRef.current?.click();
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to analyze this image.");
      }

      setResult(data);
    } catch (err) {
      setError(
        err.message ||
          "Could not connect to PlantCare. Please check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  function resetAnalysis() {
    setFile(null);
    setPreview("");
    setResult(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const mainPrediction = result?.predictions?.[0];

  return (
    <div className="site-shell">
      <div className="announcement">
        <span className="announcement-dot" />
        Plant health, understood.
        <span className="announcement-divider">/</span>
        Introducing PlantCare
      </div>

      <header className="site-header">
        <a className="brand" href="#home" aria-label="PlantCare home">
          <span className="brand-mark">
            <Sprout size={25} strokeWidth={1.7} />
          </span>
          <span className="brand-name">
            plantcare<span>.</span>
          </span>
        </a>

        <button
          className="mobile-menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

        <nav className={`navigation ${menuOpen ? "navigation-open" : ""}`}>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
            How it works
          </a>
          <a href="#what-we-detect" onClick={() => setMenuOpen(false)}>
            Plant health
          </a>
          <a href="#about" onClick={() => setMenuOpen(false)}>
            About
          </a>
          <a
            href="#analyzer"
            className="nav-cta"
            onClick={() => setMenuOpen(false)}
          >
            Analyze a leaf <ArrowRight size={15} />
          </a>
        </nav>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-line" />
              A clearer view of plant health
            </div>

            <h1>
              Better care
              <br />
              starts with
              <br />
              <span>looking closer.</span>
            </h1>

            <p className="hero-description">
              A leaf can tell you a lot. PlantCare helps you examine visible
              signs of plant disease with image-based analysis, so you can
              make more informed decisions about your plants.
            </p>

            <div className="hero-actions">
              <a className="button-primary" href="#analyzer">
                Analyze a leaf <ArrowRight size={17} />
              </a>
              <a className="button-text" href="#how-it-works">
                See how it works <ArrowDownRight size={17} />
              </a>
            </div>

            <div className="hero-footnote">
              <ShieldCheck size={17} strokeWidth={1.7} />
              <span>
                An informative tool. Not a replacement for expert diagnosis.
              </span>
            </div>
          </div>

          <div className="hero-visual">
            <img
              className="hero-image"
              src="https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1400&q=85"
              alt="Green foliage in natural sunlight"
            />

            <div className="image-caption">
              <span className="caption-index">01 / OBSERVE</span>
              <span>Healthy growth begins with attention.</span>
            </div>

            <div className="image-note">
              <span className="image-note-icon">
                <Leaf size={19} />
              </span>
              <div>
                <strong>Every leaf has a story.</strong>
                <span>Start by taking a closer look.</span>
              </div>
            </div>
          </div>

          <div className="hero-bottom-label">
            <span>PLANT HEALTH / MADE MORE ACCESSIBLE</span>
            <a href="#how-it-works" aria-label="Scroll to how it works">
              <ArrowDownRight size={20} />
            </a>
          </div>
        </section>

        <section className="intro-strip" id="about">
          <div className="intro-label">WHY PLANTCARE</div>
          <p>
            Understanding a plant's health shouldn't feel complicated.
            <span>
              {" "}
              Start with a photograph, explore the results, and learn what to
              look for next.
            </span>
          </p>
        </section>

        <section className="workflow section-padding" id="how-it-works">
          <div className="section-heading">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-line" />
                A simple place to start
              </div>
              <h2>
                From leaf to
                <br />
                <span>understanding.</span>
              </h2>
            </div>

            <p className="section-intro">
              A straightforward process designed to help you explore visible
              plant symptoms without unnecessary complexity.
            </p>
          </div>

          <div className="steps-grid">
            <article className="step">
              <div className="step-top">
                <span>01</span>
                <Upload size={21} strokeWidth={1.5} />
              </div>
              <h3>Bring a photograph</h3>
              <p>
                Choose a clear image of the affected leaf. Natural light and
                visible symptoms help provide a more useful starting point.
              </p>
            </article>

            <article className="step">
              <div className="step-top">
                <span>02</span>
                <ScanLine size={21} strokeWidth={1.5} />
              </div>
              <h3>Examine the signs</h3>
              <p>
                Our image classification model compares the photograph with
                patterns learned from a collection of labelled plant images.
              </p>
            </article>

            <article className="step">
              <div className="step-top">
                <span>03</span>
                <Leaf size={21} strokeWidth={1.5} />
              </div>
              <h3>Explore the result</h3>
              <p>
                Review the leading prediction and its score. Use the result as
                a starting point for further investigation.
              </p>
            </article>
          </div>
        </section>

        <section className="analyzer-section" id="analyzer">
          <div className="analyzer-heading">
            <div className="eyebrow eyebrow-light">
              <span className="eyebrow-line" />
              YOUR PLANT, A CLOSER LOOK
            </div>
            <h2>
              Let's look at
              <br />
              <span>that leaf.</span>
            </h2>
            <p>
              Upload a photograph to receive an image-based prediction from
              PlantCare's plant classification model.
            </p>
          </div>

          <div className="analyzer-panel">
            <div className="analyzer-panel-top">
              <span>IMAGE ANALYSIS</span>
              <span className="panel-status">
                <span className="status-dot" /> READY
              </span>
            </div>

            {!result ? (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  hidden
                  onChange={(event) => chooseFile(event.target.files?.[0])}
                />

                <button
                  type="button"
                  className={`upload-area ${preview ? "upload-area-filled" : ""}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    chooseFile(event.dataTransfer.files?.[0]);
                  }}
                >
                  {preview ? (
                    <img
                      className="upload-preview"
                      src={preview}
                      alt="Selected plant leaf"
                    />
                  ) : (
                    <>
                      <span className="upload-icon">
                        <Upload size={24} strokeWidth={1.5} />
                      </span>
                      <strong>Choose a leaf photograph</strong>
                      <span className="upload-subtitle">
                        Or drag and drop your image here
                      </span>
                      <span className="upload-formats">
                        JPG, PNG OR WEBP · MAX 10 MB
                      </span>
                    </>
                  )}
                </button>

                {preview && (
                  <div className="selected-file">
                    <div>
                      <Check size={15} />
                      <span>{file?.name}</span>
                    </div>
                    <button type="button" onClick={resetAnalysis}>
                      Remove
                    </button>
                  </div>
                )}

                {error && <p className="error-message">{error}</p>}

                <button
                  type="button"
                  className="button-primary analyze-button"
                  onClick={analyzeLeaf}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner" /> Examining image...
                    </>
                  ) : (
                    <>
                      Analyze image <ArrowRight size={17} />
                    </>
                  )}
                </button>

                <p className="privacy-note">
                  <ShieldCheck size={15} />
                  Your image is processed by the local PlantCare API.
                </p>
              </>
            ) : (
              <div className="result-view">
                <div className="result-success">
                  <Check size={17} />
                  ANALYSIS COMPLETE
                </div>

                {preview && (
                  <img
                    src={preview}
                    alt="Analyzed plant leaf"
                    className="result-image"
                  />
                )}

                <p className="result-label">LEADING MODEL PREDICTION</p>
                <h3 className="result-disease">
                  {mainPrediction?.class_name
                    ?.replaceAll("___", " — ")
                    .replaceAll("_", " ")}
                </h3>

                <div className="score-row">
                  <span>Model score</span>
                  <strong>{mainPrediction?.score_percent}%</strong>
                </div>

                <div
                  className="score-track"
                  role="progressbar"
                  aria-valuenow={mainPrediction?.score_percent || 0}
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-label="Model score"
                >
                  <span
                    style={{
                      width: `${mainPrediction?.score_percent || 0}%`,
                    }}
                  />
                </div>

                <div className="other-predictions">
                  <h4>Other model predictions</h4>
                  {result.predictions.slice(1).map((prediction) => (
                    <div
                      className="other-prediction"
                      key={prediction.class_name}
                    >
                      <span>
                        {prediction.class_name
                          .replaceAll("___", " — ")
                          .replaceAll("_", " ")}
                      </span>
                      <strong>{prediction.score_percent}%</strong>
                    </div>
                  ))}
                </div>

                <p className="result-disclaimer">{result.note}</p>

                <button
                  type="button"
                  className="button-primary analyze-button"
                  onClick={resetAnalysis}
                >
                  Analyze another leaf <ArrowRight size={17} />
                </button>
              </div>
            )}
          </div>

          <div className="analyzer-bottom">
            <CircleHelp size={16} />
            <p>
              For best results, use a clear, well-lit photograph with the
              affected leaf in focus. Similar symptoms can have different
              causes.
            </p>
          </div>
        </section>

        <section className="coverage section-padding" id="what-we-detect">
          <div className="coverage-copy">
            <div className="eyebrow">
              <span className="eyebrow-line" />
              Built around plant images
            </div>
            <h2>
              A growing
              <br />
              <span>knowledge of leaves.</span>
            </h2>
            <p>
              PlantCare's current model recognises 38 labelled categories
              across several familiar crops, including tomatoes, apples,
              potatoes, grapes, and corn.
            </p>
            <p>
              The model is a useful first step—not a substitute for field
              inspection, laboratory testing, or advice from an agricultural
              specialist.
            </p>
            <a className="button-text" href="#analyzer">
              Try image analysis <ArrowRight size={16} />
            </a>
          </div>

          <div className="coverage-image-wrap">
            <img
              src="https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=1000&q=85"
              alt="Fresh produce and crops"
              className="coverage-image"
              loading="lazy"
            />
            <div className="coverage-image-caption">
              <span>OBSERVE</span>
              <span>LEARN</span>
              <span>CARE</span>
            </div>
          </div>
        </section>

        <section className="closing-note">
          <Leaf size={22} strokeWidth={1.5} />
          <p>
            Healthy plants begin with <em>careful observation.</em>
          </p>
          <a href="#analyzer" aria-label="Return to image analysis">
            <ArrowRight size={19} />
          </a>
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand footer-brand" href="#home">
          <span className="brand-mark">
            <Sprout size={23} strokeWidth={1.7} />
          </span>
          <span className="brand-name">
            plantcare<span>.</span>
          </span>
        </a>

        <p>
          A learning tool for exploring plant health.
          <br />
          AI-assisted image classification, with care.
        </p>

        <div className="footer-right">
          <a href="#home">Back to top ↑</a>
          <span>PLANTCARE © 2026</span>
        </div>
      </footer>
    </div>
  );
}

export default App;