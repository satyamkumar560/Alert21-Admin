import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  /**
   * Generates the MSG24 runtime dltTelemarketerId SHA256 hash according to Alert21 Task #04 spec:
   * Rule: hashInput = principalEntityId + "," + telemarketerId
   * sha256Value = SHA256(hashInput) in lowercase hexadecimal format.
   */
  async generateDltTelemarketerHash(principalEntityId: string, rawTelemarketerId: string): Promise<{
    hashInput: string;
    sha256Value: string;
    isValid: boolean;
  }> {
    const cleanPeId = (principalEntityId || '').trim();
    const cleanTmId = (rawTelemarketerId || '').trim();

    if (!cleanPeId || !cleanTmId) {
      return {
        hashInput: '',
        sha256Value: '',
        isValid: false
      };
    }

    const hashInput = `${cleanPeId},${cleanTmId}`;
    
    // Use Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(hashInput);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const sha256Value = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return {
      hashInput,
      sha256Value,
      isValid: true
    };
  }

  /**
   * Official task #04 sample generator check for validation
   */
  async verifyTaskSample(): Promise<{
    expectedPeId: string;
    expectedTmId: string;
    expectedInput: string;
    expectedHash: string;
    generatedHash: string;
    matches: boolean;
  }> {
    const expectedPeId = '1201166556573564719';
    const expectedTmId = '1302167049537543382';
    const expectedHash = '9d17d08ce468a2fd81b8e485defe803bdd51891b248dfee21b35f77773aa5c06';

    const res = await this.generateDltTelemarketerHash(expectedPeId, expectedTmId);

    return {
      expectedPeId,
      expectedTmId,
      expectedInput: `${expectedPeId},${expectedTmId}`,
      expectedHash,
      generatedHash: res.sha256Value,
      matches: res.sha256Value === expectedHash
    };
  }
}
