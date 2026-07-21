// import mongoose from 'mongoose';
// import { env } from '../src/config/env.js';
// import { User } from '../src/models/user.model.js';
// import { Project } from '../src/models/project.model.js';
// import { hashPassword } from '../src/utils/password.util.js';
// import { generateApiKey } from '../src/utils/api-key.util.js';

// async function seed() {
//   await mongoose.connect(env.MONGO_URI!);
//   console.log('Connected to MongoDB');

//   // Create a test user
//   const email = 'test@example.com';
//   let user = await User.findOne({ email });
//   if (!user) {
//     const password = await hashPassword('password123');
//     user = await User.create({
//       name: 'Test User',
//       email,
//       password,
//     });
//     console.log('Created test user');
//   } else {
//     console.log('Test user already exists');
//   }

//   // Create a test project
//   let project = await Project.findOne({ owner: user._id });
//   if (!project) {
//     const { apiKey, apiKeyHash, apiKeyPrefix } = generateApiKey();
//     project = await Project.create({
//       name: 'Test Project',
//       owner: user._id,
//       apiKeyHash,
//       apiKeyPrefix,
//     });
//     console.log('\n=============================================');
//     console.log('Created test project!');
//     console.log('API KEY: ' + apiKey);
//     console.log('=============================================\n');
//   } else {
//     // Regenerate API Key to make it easy to copy
//     const { apiKey, apiKeyHash, apiKeyPrefix } = generateApiKey();
//     project.apiKeyHash = apiKeyHash;
//     project.apiKeyPrefix = apiKeyPrefix;
//     await project.save();

//     console.log('\n=============================================');
//     console.log('Project already exists. Regenerated API KEY!');
//     console.log('API KEY: ' + apiKey);
//     console.log('=============================================\n');
//   }

//   await mongoose.disconnect();
// }

// // seed().catch(console.error);
