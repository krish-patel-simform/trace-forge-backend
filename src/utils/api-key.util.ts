import crypto from 'crypto';

export interface ApiKeyData {
  apiKey: string;
  apiKeyHash: string;
  apiKeyPrefix: string;
}

/**
 * Generates a cryptographically secure API key and its SHA-256 hash.
 */
export const generateApiKey = (): ApiKeyData => {
  // Generate 32 bytes of random data, resulting in a 64-character hex string
  const rawKey = crypto.randomBytes(32).toString('hex');
  
  // Prefix with tf_ for easy identification
  const apiKey = `tf_${rawKey}`;
  
  // Extract the first 8 characters of the prefixed key for display
  const apiKeyPrefix = apiKey.substring(0, 8);
  
  // Hash the key for secure storage
  const apiKeyHash = hashApiKey(apiKey);
  
  return { apiKey, apiKeyHash, apiKeyPrefix };
};

/**
 * Hashes an API key using SHA-256.
 */
export const hashApiKey = (apiKey: string): string => {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
};
