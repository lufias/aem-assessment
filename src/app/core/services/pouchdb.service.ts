import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

PouchDB.plugin(PouchDBFind);

export interface StoredCredentials {
  _id: string;
  _rev?: string;
  type: 'credentials';
  username: string;
  passwordHash: string;
  token: string;
  lastLogin: number;
}

export interface StoredDashboardData {
  _id: string;
  _rev?: string;
  type: 'dashboard';
  chartDonut: any[];
  chartBar: any[];
  tableUsers: any[];
  cachedAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class PouchDBService {
  private db: PouchDB.Database;

  constructor() {
    this.db = new PouchDB('aem_offline_db');
  }

  /**
   * Hash password using SHA-256 (with fallback for non-secure contexts)
   */
  async hashPassword(password: string): Promise<string> {
    // Try crypto.subtle first (works in secure contexts)
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } catch {
        // Fall through to fallback
      }
    }
    // Fallback: Simple hash for non-secure contexts (file:// in Electron)
    return this.simpleHash(password);
  }

  /**
   * Simple hash fallback (djb2 + base encoding)
   * Not cryptographically secure, but sufficient for offline credential matching
   */
  private simpleHash(str: string): string {
    let hash1 = 5381;
    let hash2 = 52711;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash1 = (hash1 * 33) ^ char;
      hash2 = (hash2 * 33) ^ char;
    }
    // Combine both hashes and convert to hex string
    const combined = (hash1 >>> 0).toString(16) + (hash2 >>> 0).toString(16);
    // Pad to consistent length
    return combined.padStart(16, '0');
  }

  /**
   * Store user credentials after successful login
   */
  async storeCredentials(username: string, password: string, token: string): Promise<void> {
    const passwordHash = await this.hashPassword(password);
    const docId = `credentials_${username.toLowerCase()}`;

    const newDoc: StoredCredentials = {
      _id: docId,
      type: 'credentials',
      username: username.toLowerCase(),
      passwordHash,
      token,
      lastLogin: Date.now()
    };

    await this.upsert(docId, newDoc);
  }

  /**
   * Upsert helper - uses allDocs to get current rev, then puts
   */
  private async upsert(docId: string, newDoc: any): Promise<void> {
    try {
      // Get current revision if document exists
      const result = await this.db.allDocs({ keys: [docId] });
      const row = result.rows[0] as any;

      if (row && !row.error && row.value && !row.value.deleted) {
        // Document exists - include _rev
        newDoc._rev = row.value.rev;
      }

      await this.db.put(newDoc);
      console.log(`Document ${docId} saved successfully`);
    } catch (err: any) {
      if (err.status === 409) {
        // Conflict - try one more time with fresh rev
        console.log(`Conflict on ${docId}, retrying...`);
        try {
          const doc = await this.db.get(docId);
          newDoc._rev = doc._rev;
          await this.db.put(newDoc);
          console.log(`Document ${docId} saved on retry`);
        } catch (retryErr) {
          console.error(`Failed to save ${docId} on retry:`, retryErr);
          throw retryErr;
        }
      } else {
        throw err;
      }
    }
  }

  /**
   * Validate credentials against stored hash (for offline login)
   * Tries both SHA-256 and fallback hash for compatibility
   */
  async validateOfflineCredentials(username: string, password: string): Promise<{ valid: boolean; token?: string }> {
    const docId = `credentials_${username.toLowerCase()}`;

    try {
      const doc = await this.db.get(docId) as StoredCredentials;

      // Try current hash method
      const inputHash = await this.hashPassword(password);
      if (doc.passwordHash === inputHash) {
        return { valid: true, token: doc.token };
      }

      // Try SHA-256 if crypto.subtle is available (in case stored hash used it)
      if (typeof crypto !== 'undefined' && crypto.subtle) {
        try {
          const sha256Hash = await this.sha256Hash(password);
          if (doc.passwordHash === sha256Hash) {
            return { valid: true, token: doc.token };
          }
        } catch {
          // Ignore, already tried other method
        }
      }

      // Try simple hash as fallback (in case stored hash used it)
      const simpleHashResult = this.simpleHash(password);
      if (doc.passwordHash === simpleHashResult) {
        return { valid: true, token: doc.token };
      }

      return { valid: false };
    } catch (err: any) {
      if (err.status === 404) {
        return { valid: false };
      }
      throw err;
    }
  }

  /**
   * SHA-256 hash (for validation compatibility)
   */
  private async sha256Hash(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Store dashboard data for offline access
   */
  async storeDashboardData(chartDonut: any[], chartBar: any[], tableUsers: any[]): Promise<void> {
    const docId = 'dashboard_cache';

    const newDoc: StoredDashboardData = {
      _id: docId,
      type: 'dashboard',
      chartDonut,
      chartBar,
      tableUsers,
      cachedAt: Date.now()
    };

    await this.upsert(docId, newDoc);
  }

  /**
   * Get cached dashboard data for offline access
   */
  async getDashboardData(): Promise<StoredDashboardData | null> {
    try {
      const doc = await this.db.get('dashboard_cache') as StoredDashboardData;
      return doc;
    } catch (err: any) {
      if (err.status === 404) {
        return null;
      }
      throw err;
    }
  }

  /**
   * Clear all offline data (on logout)
   */
  async clearAllData(): Promise<void> {
    try {
      const allDocs = await this.db.allDocs();
      const deletions = allDocs.rows.map((row: any) => ({
        _id: row.id,
        _rev: row.value.rev,
        _deleted: true
      }));
      if (deletions.length > 0) {
        await this.db.bulkDocs(deletions);
      }
    } catch (err) {
      console.error('Error clearing PouchDB data:', err);
    }
  }

  /**
   * Clear only credentials (optional - keep dashboard cache)
   */
  async clearCredentials(): Promise<void> {
    try {
      const result = await this.db.allDocs({ include_docs: true });
      const credentialDocs = result.rows
        .filter((row: any) => row.doc && row.doc.type === 'credentials')
        .map((row: any) => ({
          _id: row.id,
          _rev: row.value.rev,
          _deleted: true
        }));
      if (credentialDocs.length > 0) {
        await this.db.bulkDocs(credentialDocs);
      }
    } catch (err) {
      console.error('Error clearing credentials:', err);
    }
  }
}
