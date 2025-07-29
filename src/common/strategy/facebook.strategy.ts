// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { Strategy } from 'passport-facebook-token';

// @Injectable()
// export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
//   constructor() {
//     super({
//       // clientID: process.env.FACEBOOK_APP_ID, // Replace with your Facebook App ID
//       // clientSecret: process.env.FACEBOOK_APP_SECRET, // Replace with your Facebook App Secret
//       // fbGraphVersion: 'v12.0', // Use the appropriate Facebook Graph API version
//     });
//   }

//   async validate(accessToken: string, refreshToken: string, profile: any) {
//     // Extract user data from the Facebook profile
//     const { id, name, emails } = profile;
//     const user = {
//       facebookId: id,
//       email: emails ? emails[0].value : null,
//       name,
//     };

//     // You can save or fetch the user from your database here
//     return user;
//   }
// }
