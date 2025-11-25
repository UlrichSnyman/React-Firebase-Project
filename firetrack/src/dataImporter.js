import React from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './utils/firebase'; // Updated path to firebase config
import projectsData from './data/projects.json'; // Updated path to projects.json
import { useAuth } from './contexts/AuthContext'; // Assuming you have an AuthContext

function DataImporter() {
  const { currentUser } = useAuth(); // Get the currently logged-in user

  const handleImport = async () => {
    if (!currentUser) {
      alert("Please log in to import data.");
      return;
    }
    
    console.log("Starting import for user:", currentUser.uid);

    // Prevent accidental double-imports by confirming with the user
    const confirmed = window.confirm("Are you sure you want to import projects? This can create duplicates.");
    if (!confirmed) return;

    // Create a promise for each new document
    const importPromises = projectsData.map(project => {
      const projectWithMeta = {
        ...project,
        ownerId: currentUser.uid, // Dynamically assign to the logged-in user
        createdAt: serverTimestamp() // Use server-side timestamp
      };
      return addDoc(collection(db, "projects"), projectWithMeta);
    });

    try {
      // Wait for all the promises to resolve
      await Promise.all(importPromises);
      alert("Successfully imported all projects!");
    } catch (error) {
      console.error("Error importing projects:", error);
      alert("An error occurred during import. Check the console.");
    }
  };

  return (
    <div style={{ margin: '20px', padding: '20px', border: '2px solid red' }}>
      <h3>Developer Import Tool</h3>
      <button onClick={handleImport}>Import Projects from JSON</button>
    </div>
  );
}

export default DataImporter;