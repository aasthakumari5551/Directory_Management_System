// appwriteConfig.js
import { Client, Storage } from "appwrite";

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1") // Your Appwrite endpoint
  .setProject("67dd32d4003d752a6dad"); // Your Appwrite project ID

const storage = new Storage(client);

export { storage };
