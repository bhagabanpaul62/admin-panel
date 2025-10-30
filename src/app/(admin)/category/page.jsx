"use client";
import React, { useState, useEffect } from "react";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createAttribute,
  getAttributesByCategory,
  deleteAttribute,
  uploadCategoryIcon,
  deleteCategoryIcon,
} from "@/firebase/categoryService";

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [categoryAttributes, setCategoryAttributes] = useState({});
  const [showAttributeModal, setShowAttributeModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    icon: "",
    order: 1,
    isActive: true,
    parentId: "", // For hierarchical categories
  });

  // Icon file state
  const [iconFile, setIconFile] = useState(null);
  const [iconPreview, setIconPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  // Editing state
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingOriginalIcon, setEditingOriginalIcon] = useState("");

  // Attribute form state
  const [attributeForm, setAttributeForm] = useState({
    name: "",
    type: "text",
    placeholder: "",
    required: false,
    order: 1,
    options: [],
    isActive: true,
  });
  const [optionInput, setOptionInput] = useState("");

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Toggle add/edit form. If closing, reset edit state and form
  const handleToggleAddForm = () => {
    if (showAddCategory) {
      // closing
      setShowAddCategory(false);
      setEditingCategoryId(null);
      setEditingOriginalIcon("");
      setCategoryForm({ name: "", icon: "", order: 1, isActive: true, parentId: "" });
      setIconFile(null);
      setIconPreview("");
    } else {
      setShowAddCategory(true);
    }
  };

  // Handle icon file selection
  const handleIconFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("File size should be less than 2MB");
        return;
      }

      setIconFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle add or update category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      alert("Category name is required");
      return;
    }

    try {
      setUploading(true);

      // If editing an existing category
      if (editingCategoryId) {
        let iconUrl = categoryForm.icon;

        // If a new file was selected, upload it and delete the old one
        if (iconFile) {
          // Upload new icon
          iconUrl = await uploadCategoryIcon(iconFile, categoryForm.name);
          // Delete previous icon from storage if it was a firebase URL
          if (editingOriginalIcon) {
            await deleteCategoryIcon(editingOriginalIcon);
          }
        }

        await updateCategory(editingCategoryId, {
          ...categoryForm,
          icon: iconUrl,
          order: parseInt(categoryForm.order),
          parentId: categoryForm.parentId || null,
        });

        await fetchCategories();
        // reset edit state
        setEditingCategoryId(null);
        setEditingOriginalIcon("");
        setIconFile(null);
        setIconPreview("");
        setCategoryForm({ name: "", icon: "", order: 1, isActive: true, parentId: "" });
        setShowAddCategory(false);
        alert("Category updated successfully!");
      } else {
        // Create new category
        let iconUrl = categoryForm.icon;
        if (iconFile) {
          iconUrl = await uploadCategoryIcon(iconFile, categoryForm.name);
        }

        await createCategory({
          ...categoryForm,
          icon: iconUrl,
          order: parseInt(categoryForm.order),
          parentId: categoryForm.parentId || null,
        });

        await fetchCategories();
        setCategoryForm({ name: "", icon: "", order: 1, isActive: true, parentId: "" });
        setIconFile(null);
        setIconPreview("");
        setShowAddCategory(false);
        alert("Category added successfully!");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to save category");
    } finally {
      setUploading(false);
    }
  };

  // Handle delete category
  const handleDeleteCategory = async (categoryId) => {
    if (!confirm("Delete this category and all its attributes?")) return;

    try {
      // Find the category to get its icon URL
      const category = categories.find((cat) => cat.id === categoryId);

      // Delete icon from storage if it exists
      if (category?.icon) {
        await deleteCategoryIcon(category.icon);
      }

      await deleteCategory(categoryId);
      await fetchCategories();
      alert("Category deleted!");
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to delete category");
    }
  };

  // Toggle category expansion
  const handleToggleExpand = async (categoryId) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryId);
      if (!categoryAttributes[categoryId]) {
        try {
          const attributes = await getAttributesByCategory(categoryId);
          setCategoryAttributes((prev) => ({
            ...prev,
            [categoryId]: attributes,
          }));
        } catch (error) {
          console.error("Error:", error);
        }
      }
    }
  };

  // Open attribute modal
  const handleOpenAttributeModal = (category) => {
    setSelectedCategory(category);
    setShowAttributeModal(true);
    setAttributeForm({
      name: "",
      type: "text",
      placeholder: "",
      required: false,
      order: 1,
      options: [],
      isActive: true,
    });
    setOptionInput("");
  };

  // Open edit category in the same form used for adding
  const openEditCategory = (category) => {
    setEditingCategoryId(category.id);
    setEditingOriginalIcon(category.icon || "");
    setCategoryForm({
      name: category.name || "",
      icon: category.icon || "",
      order: category.order || 1,
      isActive: category.isActive ?? true,
      parentId: category.parentId || "",
    });
    // If icon is a URL, show preview
    if (category.icon && String(category.icon).startsWith("http")) {
      setIconPreview(category.icon);
    } else {
      setIconPreview("");
    }
    setIconFile(null);
    setShowAddCategory(true);
  };

  // Add option to dropdown
  const handleAddOption = () => {
    if (optionInput.trim()) {
      setAttributeForm((prev) => ({
        ...prev,
        options: [...prev.options, optionInput.trim()],
      }));
      setOptionInput("");
    }
  };

  // Remove option from dropdown
  const handleRemoveOption = (index) => {
    setAttributeForm((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  // Save attribute
  const handleSaveAttribute = async (e) => {
    e.preventDefault();
    if (!attributeForm.name.trim()) {
      alert("Attribute name is required");
      return;
    }
    if (
      attributeForm.type === "dropdown" &&
      attributeForm.options.length === 0
    ) {
      alert("Add at least one option for dropdown");
      return;
    }

    try {
      await createAttribute(selectedCategory.id, {
        ...attributeForm,
        order: parseInt(attributeForm.order),
      });
      const attributes = await getAttributesByCategory(selectedCategory.id);
      setCategoryAttributes((prev) => ({
        ...prev,
        [selectedCategory.id]: attributes,
      }));
      setShowAttributeModal(false);
      alert("Attribute added successfully!");
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to add attribute");
    }
  };

  // Delete attribute
  const handleDeleteAttribute = async (categoryId, attributeId) => {
    if (!confirm("Delete this attribute?")) return;

    try {
      await deleteAttribute(categoryId, attributeId);
      const attributes = await getAttributesByCategory(categoryId);
      setCategoryAttributes((prev) => ({
        ...prev,
        [categoryId]: attributes,
      }));
      alert("Attribute deleted!");
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to delete attribute");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Category Management
          </h1>
          <p className="text-gray-600">
            Manage categories and dynamic attributes for classified ads
          </p>
        </div>

        {/* Add Category Button */}
        <button
          onClick={handleToggleAddForm}
          className="mb-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
        >
          {showAddCategory
            ? editingCategoryId
              ? "Cancel Edit"
              : "Cancel"
            : "+ Add New Category"}
        </button>

        {/* Add Category Form */}
        {showAddCategory && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl text-black font-semibold mb-4">
              Add New Category
            </h2>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="e.g., Jobs, Vehicles"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icon Upload
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleIconFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {iconPreview && (
                    <div className="mt-2">
                      <img
                        src={iconPreview}
                        alt="Icon preview"
                        className="w-16 h-16 object-cover rounded border-2 border-gray-300"
                      />
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Upload an image file (Max 2MB, PNG/JPG/SVG)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icon URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={categoryForm.icon}
                    onChange={(e) =>
                      setCategoryForm({ ...categoryForm, icon: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="Or paste icon URL or emoji �"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty if uploading file above
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Category (Optional)
                  </label>
                  <select
                    value={categoryForm.parentId}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        parentId: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  >
                    <option value="">None (Top Level)</option>
                    {categories
                      .filter((cat) => !cat.parentId)
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Select a parent to create subcategory (e.g., Home Service →
                    Electrician)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Order *
                  </label>
                  <input
                    type="number"
                    value={categoryForm.order}
                    onChange={(e) =>
                      setCategoryForm({
                        ...categoryForm,
                        order: e.target.value,
                      })
                    }
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={categoryForm.isActive}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          isActive: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Active
                    </span>
                  </label>
                </div>
              </div>
              <button
                type="submit"
                disabled={uploading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Uploading...
                  </>
                ) : (
                  (editingCategoryId ? "Update Category" : "Create Category")
                )}
              </button>
            </form>
          </div>
        )}

        {/* Categories List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">No categories yet</p>
            <p className="text-gray-400 mt-2">Create your first category</p>
          </div>
        ) : (
          <div className="space-y-4">
            {categories
              .filter((cat) => !cat.parentId)
              .map((category) => (
                <div key={category.id}>
                  {/* Parent Category */}
                  <div className="bg-white rounded-lg shadow-md border border-gray-200">
                    {/* Category Header */}
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {category.icon ? (
                            category.icon.startsWith("http") ? (
                              <img
                                src={category.icon}
                                alt={category.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            ) : (
                              <span className="text-3xl">{category.icon}</span>
                            )
                          ) : (
                            <span className="text-3xl">📁</span>
                          )}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                              {category.name}
                            </h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-gray-500">
                                Order: {category.order}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  category.isActive
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {category.isActive ? "Active" : "Inactive"}
                              </span>
                              <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                                Parent Category
                              </span>
                              <span className="text-xs text-gray-500">
                                {categoryAttributes[category.id]?.length || 0}{" "}
                                Attributes
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditCategory(category)}
                            className="text-gray-800 hover:text-gray-900 px-3 py-1 text-sm border rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-600 hover:text-red-700 px-3 py-1 text-sm"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => handleOpenAttributeModal(category)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium"
                          >
                            + Add Attribute
                          </button>
                          <button
                            onClick={() => handleToggleExpand(category.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                          >
                            {expandedCategory === category.id ? "▲" : "▼"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Attributes Section */}
                    {expandedCategory === category.id && (
                      <div className="border-t border-gray-200 bg-gray-50 p-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">
                          Attributes (
                          {categoryAttributes[category.id]?.length || 0})
                        </h4>
                        {!categoryAttributes[category.id] ||
                        categoryAttributes[category.id].length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-4">
                            No attributes yet. Click "Add Attribute" to create
                            one.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {categoryAttributes[category.id].map((attr) => (
                              <div
                                key={attr.id}
                                className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between"
                              >
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-gray-800">
                                      {attr.name}
                                    </span>
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                      {attr.type}
                                    </span>
                                    {attr.required && (
                                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                                        Required
                                      </span>
                                    )}
                                  </div>
                                  {attr.placeholder && (
                                    <p className="text-xs text-gray-500">
                                      Placeholder: {attr.placeholder}
                                    </p>
                                  )}
                                  {attr.type === "dropdown" &&
                                    attr.options?.length > 0 && (
                                      <p className="text-xs text-gray-500">
                                        Options: {attr.options.join(", ")}
                                      </p>
                                    )}
                                </div>
                                <button
                                  onClick={() =>
                                    handleDeleteAttribute(category.id, attr.id)
                                  }
                                  className="text-red-600 hover:text-red-700 p-2"
                                >
                                  🗑️
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Child Categories */}
                  {categories
                    .filter((child) => child.parentId === category.id)
                    .map((childCategory) => (
                      <div
                        key={childCategory.id}
                        className="ml-12 mt-2 bg-white rounded-lg shadow border border-gray-200"
                      >
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {childCategory.icon ? (
                                childCategory.icon.startsWith("http") ? (
                                  <img
                                    src={childCategory.icon}
                                    alt={childCategory.name}
                                    className="w-10 h-10 object-cover rounded"
                                  />
                                ) : (
                                  <span className="text-2xl">
                                    {childCategory.icon}
                                  </span>
                                )
                              ) : (
                                <span className="text-2xl">📄</span>
                              )}
                              <div>
                                <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                  <span className="text-gray-400">↳</span>
                                  {childCategory.name}
                                </h3>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-xs text-gray-500">
                                    Order: {childCategory.order}
                                  </span>
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full ${
                                      childCategory.isActive
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                                  >
                                    {childCategory.isActive
                                      ? "Active"
                                      : "Inactive"}
                                  </span>
                                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                                    Subcategory
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {categoryAttributes[childCategory.id]
                                      ?.length || 0}{" "}
                                    Attributes
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEditCategory(childCategory)}
                                className="text-gray-800 hover:text-gray-900 px-3 py-1 text-sm border rounded"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteCategory(childCategory.id)
                                }
                                className="text-red-600 hover:text-red-700 px-3 py-1 text-sm"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() =>
                                  handleOpenAttributeModal(childCategory)
                                }
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium"
                              >
                                + Add Attribute
                              </button>
                              <button
                                onClick={() =>
                                  handleToggleExpand(childCategory.id)
                                }
                                className="p-2 hover:bg-gray-100 rounded-lg"
                              >
                                {expandedCategory === childCategory.id
                                  ? "▲"
                                  : "▼"}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Child Attributes Section */}
                        {expandedCategory === childCategory.id && (
                          <div className="border-t border-gray-200 bg-gray-50 p-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">
                              Attributes (
                              {categoryAttributes[childCategory.id]?.length ||
                                0}
                              )
                            </h4>
                            {!categoryAttributes[childCategory.id] ||
                            categoryAttributes[childCategory.id].length ===
                              0 ? (
                              <p className="text-sm text-gray-500 text-center py-4">
                                No attributes yet. Click "Add Attribute" to
                                create one.
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {categoryAttributes[childCategory.id].map(
                                  (attr) => (
                                    <div
                                      key={attr.id}
                                      className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between"
                                    >
                                      <div>
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-medium text-gray-800">
                                            {attr.name}
                                          </span>
                                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                            {attr.type}
                                          </span>
                                          {attr.required && (
                                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                                              Required
                                            </span>
                                          )}
                                        </div>
                                        {attr.placeholder && (
                                          <p className="text-xs text-gray-500">
                                            Placeholder: {attr.placeholder}
                                          </p>
                                        )}
                                        {attr.type === "dropdown" &&
                                          attr.options?.length > 0 && (
                                            <p className="text-xs text-gray-500">
                                              Options: {attr.options.join(", ")}
                                            </p>
                                          )}
                                      </div>
                                      <button
                                        onClick={() =>
                                          handleDeleteAttribute(
                                            childCategory.id,
                                            attr.id
                                          )
                                        }
                                        className="text-red-600 hover:text-red-700 p-2"
                                      >
                                        🗑️
                                      </button>
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              ))}
          </div>
        )}

        {/* Add Attribute Modal */}
        {showAttributeModal && selectedCategory && (
          <div className="fixed inset-0 backdrop-blur-2xl  bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Add Attribute
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    For: {selectedCategory.icon} {selectedCategory.name}
                  </p>
                </div>
                <button
                  onClick={() => setShowAttributeModal(false)}
                  className="p-2 text-red-600 font-bold hover:bg-gray-100 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveAttribute} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attribute Name *
                  </label>
                  <input
                    type="text"
                    value={attributeForm.name}
                    onChange={(e) =>
                      setAttributeForm({
                        ...attributeForm,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="e.g., Job Title, Brand, Price"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Field Type *
                  </label>
                  <select
                    value={attributeForm.type}
                    onChange={(e) =>
                      setAttributeForm({
                        ...attributeForm,
                        type: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="dropdown">Dropdown</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="date">Date</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Placeholder Text
                  </label>
                  <input
                    type="text"
                    value={attributeForm.placeholder}
                    onChange={(e) =>
                      setAttributeForm({
                        ...attributeForm,
                        placeholder: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="e.g., Enter job title"
                  />
                </div>

                {attributeForm.type === "dropdown" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dropdown Options *
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={optionInput}
                        onChange={(e) => setOptionInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddOption();
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        placeholder="Enter an option"
                      />
                      <button
                        type="button"
                        onClick={handleAddOption}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                      >
                        Add
                      </button>
                    </div>
                    {attributeForm.options.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {attributeForm.options.map((option, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                          >
                            {option}
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(index)}
                              className="hover:text-blue-900"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Order *
                  </label>
                  <input
                    type="number"
                    value={attributeForm.order}
                    onChange={(e) =>
                      setAttributeForm({
                        ...attributeForm,
                        order: e.target.value,
                      })
                    }
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={attributeForm.required}
                      onChange={(e) =>
                        setAttributeForm({
                          ...attributeForm,
                          required: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Required Field
                    </span>
                  </label>

                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={attributeForm.isActive}
                      onChange={(e) =>
                        setAttributeForm({
                          ...attributeForm,
                          isActive: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Active
                    </span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                  >
                    Save Attribute
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAttributeModal(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
