# 🏗️ Hierarchical Categories Guide

## 📋 Parent-Child Category Feature

You can now create **nested categories** with parent-child relationships, perfect for organizing services like:

- **Home Service** → Electrician, Plumbing, Carpentry
- **Vehicles** → Cars, Motorcycles, Trucks
- **Jobs** → Full-time, Part-time, Freelance

## 🚀 How to Use

### Creating a Parent Category (Top Level)

1. Click "+ Add New Category"
2. Fill in:
   - **Name**: Home Service
   - **Icon**: 🏠
   - **Parent Category**: Select "None (Top Level)"
   - **Order**: 1
   - **Active**: ✓
3. Click "Create Category"

### Creating a Child Category (Subcategory)

1. Click "+ Add New Category"
2. Fill in:
   - **Name**: Electrician
   - **Icon**: ⚡
   - **Parent Category**: Select "🏠 Home Service"
   - **Order**: 1
   - **Active**: ✓
3. Click "Create Category"

The subcategory will appear **indented** under its parent with a "↳" arrow.

## 📊 Example Hierarchy

```
🏠 Home Service (Parent)
  ↳ ⚡ Electrician (Child)
  ↳ 🔧 Plumbing (Child)
  ↳ 🪛 Carpentry (Child)

🚗 Vehicles (Parent)
  ↳ 🚙 Cars (Child)
  ↳ 🏍️ Motorcycles (Child)
  ↳ 🚚 Trucks (Child)

👷 Jobs (Parent)
  ↳ 💼 Full-time (Child)
  ↳ ⏰ Part-time (Child)
  ↳ 💻 Freelance (Child)
```

## 🎨 Visual Features

### Parent Categories

- Display with "Parent Category" badge (purple)
- Shown at the top level
- Can have multiple child categories

### Child Categories (Subcategories)

- Display with "Subcategory" badge (blue)
- Indented to the right (with left margin)
- Show "↳" arrow before name
- Smaller icon size
- Can have their own attributes

## 📱 Mobile App Integration

### Fetch Parent Categories Only

```javascript
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";

// Get only parent categories
const categoriesRef = collection(db, "categories");
const q = query(
  categoriesRef,
  where("isActive", "==", true),
  where("parentId", "==", null),
  orderBy("order", "asc")
);
const snapshot = await getDocs(q);
```

### Fetch Child Categories for a Parent

```javascript
// Get subcategories for a specific parent
const categoriesRef = collection(db, "categories");
const q = query(
  categoriesRef,
  where("isActive", "==", true),
  where("parentId", "==", parentCategoryId),
  orderBy("order", "asc")
);
const snapshot = await getDocs(q);
```

### Full Hierarchy with Helper Function

```javascript
import { getCategoryHierarchy } from "@/firebase/categoryService";

// Get complete hierarchy (parents with children)
const hierarchy = await getCategoryHierarchy();

// hierarchy = [
//   {
//     id: "abc123",
//     name: "Home Service",
//     icon: "🏠",
//     children: [
//       { id: "def456", name: "Electrician", icon: "⚡", parentId: "abc123" },
//       { id: "ghi789", name: "Plumbing", icon: "🔧", parentId: "abc123" }
//     ]
//   }
// ]
```

## 💡 Use Cases

### Service Marketplace

```
🏠 Home Service
  ↳ ⚡ Electrician
  ↳ 🔧 Plumbing
  ↳ 🪛 Carpentry
  ↳ 🧹 Cleaning
  ↳ 🎨 Painting

👨‍💼 Professional Services
  ↳ 💻 IT Services
  ↳ 📊 Accounting
  ↳ ⚖️ Legal
  ↳ 📝 Writing
```

### E-commerce Platform

```
📱 Electronics
  ↳ 📞 Mobile Phones
  ↳ 💻 Laptops
  ↳ 📷 Cameras
  ↳ 🎮 Gaming Consoles

👗 Fashion
  ↳ 👕 Men's Clothing
  ↳ 👚 Women's Clothing
  ↳ 👟 Footwear
  ↳ 👜 Accessories
```

### Real Estate

```
🏠 Residential
  ↳ 🏡 Houses
  ↳ 🏢 Apartments
  ↳ 🏘️ Villas
  ↳ 🏚️ Studios

🏗️ Commercial
  ↳ 🏪 Retail Shops
  ↳ 🏢 Offices
  ↳ 🏭 Warehouses
```

## 🗂️ Firestore Data Structure

```
categories/
  ├─ parentId123/
  │   ├─ name: "Home Service"
  │   ├─ icon: "🏠"
  │   ├─ parentId: null          ← Parent category
  │   ├─ order: 1
  │   ├─ isActive: true
  │   └─ attributes/
  │       └─ ...
  │
  ├─ childId456/
  │   ├─ name: "Electrician"
  │   ├─ icon: "⚡"
  │   ├─ parentId: "parentId123"  ← Points to parent
  │   ├─ order: 1
  │   ├─ isActive: true
  │   └─ attributes/
  │       └─ ...
  │
  └─ childId789/
      ├─ name: "Plumbing"
      ├─ icon: "🔧"
      ├─ parentId: "parentId123"  ← Points to same parent
      ├─ order: 2
      ├─ isActive: true
      └─ attributes/
          └─ ...
```

## ✨ Features

✅ **Unlimited nesting** - Create as many subcategories as needed
✅ **Visual hierarchy** - Clear indentation and arrows
✅ **Color-coded badges** - Easy identification (purple for parents, blue for children)
✅ **Independent attributes** - Each category can have its own attributes
✅ **Easy management** - Add, delete, expand/collapse for both levels
✅ **Mobile-ready** - Helper functions to fetch hierarchy
✅ **Flexible ordering** - Order within each level independently

## 🎯 Best Practices

1. **Keep it Simple**: Don't nest too deep (max 2 levels recommended)
2. **Clear Names**: Use descriptive names for both parent and child
3. **Consistent Icons**: Use related emojis for parent and children
4. **Logical Grouping**: Group related subcategories under appropriate parents
5. **Ordering**: Number subcategories logically (1, 2, 3...) within each parent

## 🔄 Workflow Example

### Step 1: Create Parent

- Name: "Home Service"
- Icon: 🏠
- Parent: None (Top Level)

### Step 2: Create Children

**Electrician**

- Name: "Electrician"
- Icon: ⚡
- Parent: Home Service

**Plumbing**

- Name: "Plumbing"
- Icon: 🔧
- Parent: Home Service

**Carpentry**

- Name: "Carpentry"
- Icon: 🪛
- Parent: Home Service

### Step 3: Add Attributes

Add specific attributes to each child:

- **Electrician**: Service Type, Years of Experience, Certification
- **Plumbing**: Service Type, Emergency Service, Warranty
- **Carpentry**: Service Type, Materials Provided, Portfolio

## 🎉 You're Ready!

Your hierarchical category system is now set up! Create parent categories first, then add subcategories under them.

**Example to try:**

1. Create "Home Service" (parent)
2. Create "Electrician" under Home Service
3. Create "Plumbing" under Home Service
4. Add attributes to each subcategory
5. See the beautiful hierarchy in action!
