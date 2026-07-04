/**
 * Firebase is no longer used in this project.
 * We have migrated to MongoDB with Mongoose for data persistence.
 *
 * For database operations, use the MongoDB connection in ./mongodb.ts
 * For authentication, use the JWT utilities in ./jwt.ts
 */

// Deprecated: Firebase configuration has been removed
console.warn(
  "Firebase module is deprecated. Please use MongoDB (./mongodb.ts) for data operations.",
);
