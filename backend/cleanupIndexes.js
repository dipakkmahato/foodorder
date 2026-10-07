const mongoose = require('mongoose');

const mongoURI = "mongodb://dipak123:password11@ac-m3zcvaz-shard-00-00.45k7oyt.mongodb.net:27017,ac-m3zcvaz-shard-00-01.45k7oyt.mongodb.net:27017,ac-m3zcvaz-shard-00-02.45k7oyt.mongodb.net:27017/gofoodmern?ssl=true&replicaSet=atlas-fgyxac-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

async function run() {
  await mongoose.connect(mongoURI);
  console.log('Connected to MongoDB Atlas');
  
  const coll = mongoose.connection.collection('orders');
  
  // List indexes to see if a unique index exists on userEmail (or email)
  const indexes = await coll.indexes();
  console.log('Current Indexes:', indexes);

  // Find any index that has email: 1 or userEmail: 1 and is unique, or just check 'email_1'
  const emailIdx = indexes.find(idx => idx.name === 'email_1' || (idx.key && (idx.key.email || idx.key.userEmail) && idx.unique));
  if (emailIdx) {
    const indexName = emailIdx.name;
    try {
      await coll.dropIndex(indexName);
      console.log(`Successfully dropped index ${indexName}`);
    } catch (dropErr) {
      console.log(`Failed to drop index ${indexName} directly:`, dropErr.message);
    }
  } else {
    console.log('No unique index on email or userEmail found in MongoDB.');
  }

  // Also look specifically for userEmail unique indexes
  const userEmailIdx = indexes.find(idx => idx.name === 'userEmail_1' && idx.unique);
  if (userEmailIdx) {
    try {
      await coll.dropIndex('userEmail_1');
      console.log('Successfully dropped unique index userEmail_1');
    } catch (dropErr) {
      console.log('Failed to drop index userEmail_1:', dropErr.message);
    }
  }

  // Recreate a non‑unique index for safety
  await coll.createIndex({ userEmail: 1 });
  console.log('Ensured non‑unique index on userEmail');
  process.exit(0);
}

run().catch(err => {
  console.error('Index cleanup failed:', err);
  process.exit(1);
});
