export interface StorageConfig {
  storageType: 'localStorage' | 'sessionStorage' | 'memory';
  rememberToken: boolean;
}

export interface StoredTokenData {
  encryptedToken: string;
  iv: string;
  timestamp: number;
  expiresAt?: number;
}

class SecureTokenStorage {
  private static readonly STORAGE_KEY = 'github_token_secure';
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12;
  private static memoryStorage: Map<string, string> = new Map();

  /**
   * Generate a cryptographic key for encryption/decryption
   */
  private static async generateKey(): Promise<CryptoKey> {
    // Create a deterministic key based on browser fingerprint
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(this.getKeyMaterial()),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode('github-tracker-salt'),
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: this.ALGORITHM, length: this.KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Generate key material from browser characteristics
   */
  private static getKeyMaterial(): string {
    // Use browser characteristics for key generation
    const userAgent = navigator.userAgent;
    const language = navigator.language;
    const platform = navigator.platform;
    const screenResolution = `${screen.width}x${screen.height}`;
    
    return `${userAgent}-${language}-${platform}-${screenResolution}`;
  }

  /**
   * Encrypt a token string
   */
  private static async encrypt(token: string): Promise<{ encryptedData: string; iv: string }> {
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error('Web Crypto API not supported');
    }

    const key = await this.generateKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
    const encodedToken = new TextEncoder().encode(token);

    const encryptedBuffer = await window.crypto.subtle.encrypt(
      { name: this.ALGORITHM, iv },
      key,
      encodedToken
    );

    return {
      encryptedData: this.arrayBufferToBase64(encryptedBuffer),
      iv: this.arrayBufferToBase64(iv),
    };
  }

  /**
   * Decrypt a token string
   */
  private static async decrypt(encryptedData: string, iv: string): Promise<string> {
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error('Web Crypto API not supported');
    }

    const key = await this.generateKey();
    const ivBuffer = this.base64ToArrayBuffer(iv);
    const encryptedBuffer = this.base64ToArrayBuffer(encryptedData);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: this.ALGORITHM, iv: ivBuffer },
      key,
      encryptedBuffer
    );

    return new TextDecoder().decode(decryptedBuffer);
  }

  /**
   * Convert ArrayBuffer to Base64 string
   */
  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert Base64 string to ArrayBuffer
   */
  private static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Get the appropriate storage interface
   */
  private static getStorage(storageType: StorageConfig['storageType']): Storage | null {
    switch (storageType) {
      case 'localStorage':
        return typeof window !== 'undefined' ? localStorage : null;
      case 'sessionStorage':
        return typeof window !== 'undefined' ? sessionStorage : null;
      case 'memory':
        return null; // Handle separately
      default:
        return null;
    }
  }

  /**
   * Store a token securely
   */
  static async storeToken(
    token: string, 
    config: StorageConfig,
    expiresInHours: number = 24
  ): Promise<void> {
    try {
      const { encryptedData, iv } = await this.encrypt(token);
      const timestamp = Date.now();
      const expiresAt = timestamp + (expiresInHours * 60 * 60 * 1000);

      const storageData: StoredTokenData = {
        encryptedToken: encryptedData,
        iv,
        timestamp,
        expiresAt,
      };

      const storageString = JSON.stringify(storageData);

      if (config.storageType === 'memory') {
        this.memoryStorage.set(this.STORAGE_KEY, storageString);
      } else {
        const storage = this.getStorage(config.storageType);
        if (storage) {
          storage.setItem(this.STORAGE_KEY, storageString);
        } else {
          throw new Error('Storage not available');
        }
      }
    } catch (error) {
      console.error('Failed to store token:', error);
      throw new Error('Failed to store token securely');
    }
  }

  /**
   * Retrieve a stored token
   */
  static async retrieveToken(storageType: StorageConfig['storageType']): Promise<string | null> {
    try {
      let storageString: string | null = null;

      if (storageType === 'memory') {
        storageString = this.memoryStorage.get(this.STORAGE_KEY) || null;
      } else {
        const storage = this.getStorage(storageType);
        if (storage) {
          storageString = storage.getItem(this.STORAGE_KEY);
        }
      }

      if (!storageString) {
        return null;
      }

      const storageData: StoredTokenData = JSON.parse(storageString);

      // Check if token has expired
      if (storageData.expiresAt && Date.now() > storageData.expiresAt) {
        await this.clearToken(storageType);
        return null;
      }

      return await this.decrypt(storageData.encryptedToken, storageData.iv);
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      // Clear potentially corrupted data
      await this.clearToken(storageType);
      return null;
    }
  }

  /**
   * Clear stored token
   */
  static async clearToken(storageType: StorageConfig['storageType']): Promise<void> {
    try {
      if (storageType === 'memory') {
        this.memoryStorage.delete(this.STORAGE_KEY);
      } else {
        const storage = this.getStorage(storageType);
        if (storage) {
          storage.removeItem(this.STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Failed to clear token:', error);
    }
  }

  /**
   * Check if a token is stored
   */
  static hasStoredToken(storageType: StorageConfig['storageType']): boolean {
    try {
      if (storageType === 'memory') {
        return this.memoryStorage.has(this.STORAGE_KEY);
      } else {
        const storage = this.getStorage(storageType);
        if (storage) {
          return storage.getItem(this.STORAGE_KEY) !== null;
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Get token metadata without decrypting
   */
  static getTokenMetadata(storageType: StorageConfig['storageType']): { timestamp: number; expiresAt?: number } | null {
    try {
      let storageString: string | null = null;

      if (storageType === 'memory') {
        storageString = this.memoryStorage.get(this.STORAGE_KEY) || null;
      } else {
        const storage = this.getStorage(storageType);
        if (storage) {
          storageString = storage.getItem(this.STORAGE_KEY);
        }
      }

      if (!storageString) {
        return null;
      }

      const storageData: StoredTokenData = JSON.parse(storageString);
      return {
        timestamp: storageData.timestamp,
        expiresAt: storageData.expiresAt,
      };
    } catch {
      return null;
    }
  }

  /**
   * Clear all stored tokens from all storage types
   */
  static async clearAllTokens(): Promise<void> {
    await Promise.all([
      this.clearToken('localStorage'),
      this.clearToken('sessionStorage'),
      this.clearToken('memory'),
    ]);
  }

  /**
   * Check if Web Crypto API is supported
   */
  static isSupported(): boolean {
    return typeof window !== 'undefined' && 
           window.crypto && 
           window.crypto.subtle &&
           typeof window.crypto.subtle.encrypt === 'function';
  }
}

/**
 * Token utility functions
 */
export class TokenUtils {
  /**
   * Mask a token for display (show only first 4 and last 4 characters)
   */
  static maskToken(token: string): string {
    if (token.length <= 8) {
      return '*'.repeat(token.length);
    }
    
    const start = token.substring(0, 4);
    const end = token.substring(token.length - 4);
    const middle = '*'.repeat(Math.max(4, token.length - 8));
    
    return `${start}${middle}${end}`;
  }

  /**
   * Validate GitHub token format
   */
  static isValidTokenFormat(token: string): boolean {
    // GitHub personal access tokens start with 'ghp_' and are 40 characters total
    // GitHub app tokens start with 'ghs_' 
    // Fine-grained tokens start with 'github_pat_'
    const patterns = [
      /^ghp_[a-zA-Z0-9]{36}$/, // Classic personal access token
      /^ghs_[a-zA-Z0-9]{36}$/, // GitHub app token
      /^github_pat_[a-zA-Z0-9_]{82}$/, // Fine-grained personal access token
    ];
    
    return patterns.some(pattern => pattern.test(token));
  }

  /**
   * Get token type from format
   */
  static getTokenType(token: string): 'personal' | 'app' | 'fine-grained' | 'unknown' {
    if (token.startsWith('ghp_')) return 'personal';
    if (token.startsWith('ghs_')) return 'app';
    if (token.startsWith('github_pat_')) return 'fine-grained';
    return 'unknown';
  }
}

export default SecureTokenStorage;