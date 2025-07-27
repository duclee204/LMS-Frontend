import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AvatarService {
  private readonly BASE_URL = 'http://localhost:8080';

  constructor() { }

  /**
   * Process avatar URL to add base URL if needed
   * @param avatarUrl - The avatar URL from backend
   * @returns Full URL to avatar or null if no avatar
   */
  processAvatarUrl(avatarUrl: string | null | undefined): string | null {
    console.log('🔍 Processing avatar URL:', avatarUrl);
    
    if (!avatarUrl) {
      console.log('❌ No avatar URL provided');
      return null;
    }

    // If avatar URL starts with http, return as is
    if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
      console.log('✅ Avatar URL is already full URL:', avatarUrl);
      return avatarUrl;
    }

    // If avatar URL starts with /, add base URL
    if (avatarUrl.startsWith('/')) {
      const fullUrl = `${this.BASE_URL}${avatarUrl}`;
      console.log('✅ Avatar URL with base URL:', fullUrl);
      return fullUrl;
    }

    // If avatar URL is relative, add base URL and /images/avatars/
    const fullUrl = `${this.BASE_URL}/images/avatars/${avatarUrl}`;
    console.log('✅ Avatar URL with full path:', fullUrl);
    return fullUrl;
  }

  /**
   * Get avatar URL from JWT token payload
   * @param payload - JWT token payload
   * @returns Processed avatar URL or null
   */
  getAvatarFromToken(payload: any): string | null {
    return this.processAvatarUrl(payload.avatarUrl);
  }
}
