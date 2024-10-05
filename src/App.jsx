import React, { useState } from "react";
import axios from "axios";
import './ClusterDocuments.css'; // Import the CSS file

function ClusterDocuments() {
  const [file, setFile] = useState(null); 
  const [fileName, setFileName] = useState("Choose File"); 
  const [result, setResult] = useState(null); 
  const [error, setError] = useState(null); 
  const [searchTerm, setSearchTerm] = useState(""); 

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : "Choose File");
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 

    const formData = new FormData();
    formData.append("n_clusters", 1); 
    formData.append("files", file); 

    try {
      const response = await axios.post(
        "https://cluster-poc-4ba2ee28df2f.herokuapp.com/cluster-documents/", 
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setResult(response.data); 
      setError(null); 
    } catch (err) {
      setError("There was an error processing the request."); 
      console.error(err);
    }
  };

  const filteredTopics = () => {
    if (!result || !result.clusters.length) return [];
    return result.clusters[0].topics.filter((topic) =>
      topic.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="container">
      <h1 className="title">Smart Resume Analyser</h1>
      <form onSubmit={handleSubmit} className="form">
        <div className="file-upload-section">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            required
            style={{ display: "none" }} 
            id="file-upload-input" // Added ID for accessibility
          />
          <label htmlFor="file-upload-input" className="file-upload-button">
            {fileName}
          </label>
          <span className="file-instruction">Upload the file in PDF format</span>
          <button type="submit" className="submit-button">Analyze</button>
        </div>

        <div className="search-section">
          <input
            type="text"
            placeholder="Search for skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </form>

      {error && <p className="error-message">{error}</p>}

      {result && result.clusters.length > 0 && (
        <div className="results-container">
          <div className="wordcloud-section">
            <h2>Relevant Skills Word Cloud:</h2>
            {Object.keys(result.wordclouds).length > 0 && (
              <img
                src={`data:image/png;base64,${result.wordclouds[Object.keys(result.wordclouds)[0]]}`}
                alt={`Wordcloud for relevant skills`}
                className="wordcloud-image"
              />
            )}
          </div>

          <div className="topics-section">
            <h2>Cluster of Relevant Skills:</h2>
            {filteredTopics().length > 0 ? (
              filteredTopics().map((topic, idx) => (
                <p key={idx} className="topic">{topic}</p>
              ))
            ) : (
              <p>No matching topics found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ClusterDocuments;
