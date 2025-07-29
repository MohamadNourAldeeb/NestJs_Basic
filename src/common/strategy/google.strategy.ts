import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { googleSignInConfig } from 'src/config/google_sign_in.config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: googleSignInConfig.client_id, // Replace with your Google Client ID
      clientSecret: googleSignInConfig.client_secret, // Replace with your Google Client Secret
      callbackURL: 'https://your-backend-url/auth/google/callback', // Redirect URI
      scope: ['email', 'profile'], // Request email and profile data
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const { id, displayName, emails } = profile;

    // Customize the data structure
    const user = {
      googleId: id,
      email: emails ? emails[0].value : null,
      fullName: displayName, // Rename "displayName" to "fullName"
      provider: 'google', // Add a custom field to indicate the login provider
      accessToken, // Optionally include the access token
    };

    // You can save or fetch the user from your database here
    return user;
  }
}
