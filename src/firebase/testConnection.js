// Test Firebase connection
import { db } from "./firebase.js";
import { collection, getDocs, addDoc } from "firebase/firestore";

export async function testFirestoreConnection() {
  console.log("Testing Firestore connection...");

  try {
    // Try to read from a test collection
    console.log("Attempting to read from Firestore...");
    const testCollection = collection(db, "test");
    const snapshot = await getDocs(testCollection);

    console.log("✅ Firestore READ successful!");
    console.log("Documents found:", snapshot.size);

    // Try to write to test collection
    console.log("Attempting to write to Firestore...");
    const docRef = await addDoc(collection(db, "test"), {
      timestamp: new Date(),
      message: "Connection test",
    });

    console.log("✅ Firestore WRITE successful!");
    console.log("Document ID:", docRef.id);

    return { success: true, message: "Firestore connected successfully!" };
  } catch (error) {
    console.error("❌ Firestore connection error:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);

    return {
      success: false,
      error: error.message,
      code: error.code,
      details: error,
    };
  }
}

// Call this function in your browser console: testFirestoreConnection()
