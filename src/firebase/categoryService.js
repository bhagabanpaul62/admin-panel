import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  getDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "./firebase";

// ==================== STORAGE OPERATIONS ====================

/**
 * Upload icon file to Firebase Storage
 * @param {File} file - The icon file to upload
 * @param {string} categoryName - Name of the category (used for file naming)
 * @returns {Promise<string>} - The public URL of the uploaded icon
 */
export const uploadCategoryIcon = async (file, categoryName) => {
  try {
    if (!file) throw new Error("No file provided");

    // Create a unique filename with timestamp
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();
    const fileName = `${categoryName.replace(
      /\s+/g,
      "_"
    )}_${timestamp}.${fileExtension}`;

    // Create a reference to the storage location
    const storageRef = ref(storage, `category-icons/${fileName}`);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error("Error uploading icon:", error);
    throw error;
  }
};

/**
 * Delete icon from Firebase Storage
 * @param {string} iconUrl - The public URL of the icon to delete
 */
export const deleteCategoryIcon = async (iconUrl) => {
  try {
    if (!iconUrl || !iconUrl.includes("firebase")) return;

    // Extract the file path from the URL
    const urlParts = iconUrl.split("/");
    const encodedPath = urlParts[urlParts.length - 1].split("?")[0];
    const filePath = decodeURIComponent(encodedPath);

    // Create a reference and delete
    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Error deleting icon:", error);
    // Don't throw error to prevent deletion issues if file doesn't exist
  }
};

// ==================== CATEGORY OPERATIONS ====================

export const createCategory = async (categoryData) => {
  try {
    const categoriesRef = collection(db, "categories");
    const docRef = await addDoc(categoriesRef, {
      ...categoryData,
      parentId: categoryData.parentId || null, // Support for parent category
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

export const getAllCategories = async () => {
  try {
    const categoriesRef = collection(db, "categories");
    const q = query(categoriesRef, orderBy("order", "asc"));
    const querySnapshot = await getDocs(q);

    const categories = [];
    querySnapshot.forEach((doc) => {
      categories.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const updateCategory = async (categoryId, updateData) => {
  try {
    const categoryRef = doc(db, "categories", categoryId);
    await updateDoc(categoryRef, {
      ...updateData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    // Delete all attributes first
    const attributes = await getAttributesByCategory(categoryId);
    const deletePromises = attributes.map((attr) =>
      deleteAttribute(categoryId, attr.id)
    );
    await Promise.all(deletePromises);

    // Delete the category
    const categoryRef = doc(db, "categories", categoryId);
    await deleteDoc(categoryRef);
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};

// ==================== ATTRIBUTE OPERATIONS ====================

export const createAttribute = async (categoryId, attributeData) => {
  try {
    const attributesRef = collection(db, `categories/${categoryId}/attributes`);
    const docRef = await addDoc(attributesRef, {
      ...attributeData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating attribute:", error);
    throw error;
  }
};

export const getAttributesByCategory = async (categoryId) => {
  try {
    const attributesRef = collection(db, `categories/${categoryId}/attributes`);
    const q = query(attributesRef, orderBy("order", "asc"));
    const querySnapshot = await getDocs(q);

    const attributes = [];
    querySnapshot.forEach((doc) => {
      attributes.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return attributes;
  } catch (error) {
    console.error("Error fetching attributes:", error);
    throw error;
  }
};

export const updateAttribute = async (categoryId, attributeId, updateData) => {
  try {
    const attributeRef = doc(
      db,
      `categories/${categoryId}/attributes`,
      attributeId
    );
    await updateDoc(attributeRef, {
      ...updateData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating attribute:", error);
    throw error;
  }
};

export const deleteAttribute = async (categoryId, attributeId) => {
  try {
    const attributeRef = doc(
      db,
      `categories/${categoryId}/attributes`,
      attributeId
    );
    await deleteDoc(attributeRef);
  } catch (error) {
    console.error("Error deleting attribute:", error);
    throw error;
  }
};

// ==================== PARENT-CHILD CATEGORY OPERATIONS ====================

/**
 * Get all parent categories (categories with no parent)
 */
export const getParentCategories = async () => {
  try {
    const categories = await getAllCategories();
    return categories.filter((cat) => !cat.parentId);
  } catch (error) {
    console.error("Error fetching parent categories:", error);
    throw error;
  }
};

/**
 * Get child categories for a specific parent
 */
export const getChildCategories = async (parentId) => {
  try {
    const categories = await getAllCategories();
    return categories.filter((cat) => cat.parentId === parentId);
  } catch (error) {
    console.error("Error fetching child categories:", error);
    throw error;
  }
};

/**
 * Get category hierarchy (parents with their children)
 */
export const getCategoryHierarchy = async () => {
  try {
    const allCategories = await getAllCategories();
    const parents = allCategories.filter((cat) => !cat.parentId);

    const hierarchy = parents.map((parent) => ({
      ...parent,
      children: allCategories.filter((cat) => cat.parentId === parent.id),
    }));

    return hierarchy;
  } catch (error) {
    console.error("Error fetching category hierarchy:", error);
    throw error;
  }
};
