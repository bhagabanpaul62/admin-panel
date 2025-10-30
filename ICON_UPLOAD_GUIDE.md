# Icon Upload Feature - User Guide

## Overview

The category management system now supports uploading icons to Firebase Storage with public URL generation. You can either upload an image file or provide an icon URL/emoji.

## Features

### 1. **Icon Upload**

- Upload image files (PNG, JPG, SVG, etc.)
- Maximum file size: 2MB
- Files stored in Firebase Storage under `category-icons/`
- Automatic public URL generation
- Preview before upload

### 2. **Icon Display**

- Uploaded images are displayed as thumbnails
- Parent categories: 48x48px
- Child categories: 40x40px
- Fallback to emoji or default icon if no image

### 3. **Icon Deletion**

- Icons are automatically deleted from Storage when category is deleted
- Prevents storage bloat

## How to Use

### Upload Icon for New Category

1. Navigate to **Category Management** page
2. Click **"+ Add New Category"**
3. Fill in the category details
4. In the **"Icon Upload"** field:
   - Click **Choose File**
   - Select an image (PNG, JPG, SVG)
   - File must be under 2MB
   - Preview will appear below the upload button
5. **OR** use the **"Icon URL (Optional)"** field:
   - Paste an external icon URL
   - Or enter an emoji (e.g., 🏠 🔧 📱)
6. Click **"Create Category"**
7. Wait for upload to complete (button shows "Uploading...")

### Important Notes

- **File Upload Priority**: If you upload a file, it will be used even if you also provide a URL/emoji
- **Validation**: Only image files are accepted
- **File Size**: Maximum 2MB per icon
- **Storage Location**: `gs://servicebylocal-2ae50.appspot.com/category-icons/`

## Technical Details

### Storage Structure

```
Firebase Storage
└── category-icons/
    ├── Home_Service_1730275200000.png
    ├── Electrician_1730275201000.jpg
    └── Plumbing_1730275202000.svg
```

### File Naming Convention

Format: `{CategoryName}_{Timestamp}.{Extension}`

- Spaces replaced with underscores
- Timestamp ensures uniqueness
- Original file extension preserved

### Firebase Storage Functions

#### `uploadCategoryIcon(file, categoryName)`

```javascript
// Upload icon and return public URL
const iconUrl = await uploadCategoryIcon(file, "Home Service");
// Returns: "https://firebasestorage.googleapis.com/..."
```

#### `deleteCategoryIcon(iconUrl)`

```javascript
// Delete icon from storage
await deleteCategoryIcon(category.icon);
```

## Category Data Structure

```javascript
{
  id: "category123",
  name: "Home Service",
  icon: "https://firebasestorage.googleapis.com/.../Home_Service_1730275200000.png",
  order: 1,
  isActive: true,
  parentId: null,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Mobile App Integration

### Displaying Icons in Mobile App

```javascript
// React Native example
import { Image } from "react-native";

function CategoryCard({ category }) {
  return (
    <View>
      {category.icon.startsWith("http") ? (
        <Image
          source={{ uri: category.icon }}
          style={{ width: 50, height: 50, borderRadius: 8 }}
        />
      ) : (
        <Text style={{ fontSize: 32 }}>{category.icon}</Text>
      )}
      <Text>{category.name}</Text>
    </View>
  );
}
```

### Caching Icons

```javascript
// Use react-native-fast-image for caching
import FastImage from "react-native-fast-image";

<FastImage
  source={{
    uri: category.icon,
    priority: FastImage.priority.high,
  }}
  style={{ width: 50, height: 50 }}
  resizeMode={FastImage.resizeMode.cover}
/>;
```

## Best Practices

### 1. **Icon Dimensions**

- Recommended: 512x512px square images
- Minimum: 128x128px
- Format: PNG with transparency (preferred)

### 2. **File Optimization**

- Compress images before upload
- Use SVG for simple icons (smaller file size)
- Avoid overly complex images

### 3. **Naming Conventions**

- Use descriptive category names
- Avoid special characters
- Keep names concise

### 4. **Performance**

- Icons are cached by browsers
- Firebase CDN ensures fast delivery
- Mobile apps should implement local caching

## Troubleshooting

### Upload Fails

**Issue**: "Failed to add category" error

**Solutions**:

1. Check file size (must be < 2MB)
2. Verify file is an image format
3. Check Firebase Storage rules
4. Ensure internet connection

### Icon Not Displaying

**Issue**: Icon shows default emoji instead of uploaded image

**Solutions**:

1. Check if URL is valid
2. Verify Storage rules allow public read
3. Clear browser cache
4. Check Firebase console for the file

### Storage Rules

Ensure Firebase Storage rules allow uploads:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /category-icons/{imageId} {
      // Allow authenticated users to upload
      allow write: if request.auth != null;
      // Allow anyone to read
      allow read: if true;
    }
  }
}
```

## Security Considerations

### 1. **File Validation**

- Client-side: File type and size checked
- Server-side: Add Firebase Security Rules

### 2. **Authentication**

- Currently allows any upload
- **TODO**: Add authentication checks
- Restrict to admin users only

### 3. **Storage Quota**

- Monitor storage usage in Firebase Console
- Free tier: 5GB total storage
- Consider cleanup policies for unused icons

## Future Enhancements

### Planned Features

- [ ] Image cropping/resizing before upload
- [ ] Drag-and-drop file upload
- [ ] Icon library/presets
- [ ] Bulk upload for multiple categories
- [ ] Image optimization (auto-compression)
- [ ] Icon versioning (keep upload history)
- [ ] CDN integration for faster delivery

### Advanced Features

- [ ] Edit existing category icons
- [ ] Icon templates/suggestions
- [ ] Usage analytics per icon
- [ ] A/B testing different icons

## API Reference

### Upload Icon

```javascript
import { uploadCategoryIcon } from "@/firebase/categoryService";

const handleUpload = async (file, categoryName) => {
  try {
    const publicUrl = await uploadCategoryIcon(file, categoryName);
    console.log("Icon uploaded:", publicUrl);
    return publicUrl;
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
};
```

### Delete Icon

```javascript
import { deleteCategoryIcon } from "@/firebase/categoryService";

const handleDelete = async (iconUrl) => {
  try {
    await deleteCategoryIcon(iconUrl);
    console.log("Icon deleted successfully");
  } catch (error) {
    console.error("Deletion failed:", error);
  }
};
```

## Examples

### Example 1: Basic Upload

```javascript
// User selects file
const handleFileChange = async (e) => {
  const file = e.target.files[0];
  if (file) {
    const url = await uploadCategoryIcon(file, "Home Service");
    // url: "https://firebasestorage.googleapis.com/..."
  }
};
```

### Example 2: With Preview

```javascript
const [preview, setPreview] = useState("");

const handleFileSelect = (file) => {
  // Create preview
  const reader = new FileReader();
  reader.onloadend = () => {
    setPreview(reader.result);
  };
  reader.readAsDataURL(file);

  // Upload to Firebase
  uploadCategoryIcon(file, categoryName);
};
```

### Example 3: Error Handling

```javascript
const uploadWithErrorHandling = async (file, name) => {
  try {
    // Validate file size
    if (file.size > 2 * 1024 * 1024) {
      throw new Error("File too large");
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      throw new Error("Invalid file type");
    }

    const url = await uploadCategoryIcon(file, name);
    return url;
  } catch (error) {
    if (error.code === "storage/unauthorized") {
      alert("Permission denied");
    } else if (error.code === "storage/quota-exceeded") {
      alert("Storage quota exceeded");
    } else {
      alert(`Upload failed: ${error.message}`);
    }
  }
};
```

## Support

For issues or questions:

1. Check Firebase Console → Storage
2. Verify Storage Rules
3. Check browser console for errors
4. Review Firebase Storage documentation

---

**Last Updated**: October 30, 2025  
**Version**: 1.0.0  
**Firebase Storage Bucket**: servicebylocal-2ae50.appspot.com
