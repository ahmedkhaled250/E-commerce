// import passport from "passport";
// import googleOauth from "passport-google-oauth2";
// import facebookOauth from "passport-facebook";
// import githupOauth from "passport-github2";
// import path from "path";
// import { fileURLToPath } from "url";
// import dotenv from "dotenv";
// const __direName = path.dirname(fileURLToPath(import.meta.url));
// dotenv.config({ path: path.join(__direName, "../../config/.env") });
// const GoogleStrategy = googleOauth.Strategy;
// const FacebookStrategy = facebookOauth.Strategy;
// const GitHubStrategy = githupOauth.Strategy;
// passport.serializeUser((user, done) => {
//   return done(null, user);
// });
// passport.deserializeUser((user, done) => {
//   return done(null, user);
// });
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: process.env.GOOGLE_CALLBACKURL,
//       passReqToCallback: true,
//     },
//     (request, accessToken, refreshToken, profile, done) => {
//       return done(null, profile);
//     }
//   )
// );
// passport.use(
//   new FacebookStrategy(
//     {
//       clientID: process.env.FACEBOOK_CLIENT_ID,
//       clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
//       callbackURL: process.env.FACEBOOK_CALLBACKURL,
//     },
//     (accessToken, refreshToken, profile, done) => {
//       return done(null, profile);
//     }
//   )
// );
// passport.use(
//   new GitHubStrategy(
//     {
//       clientID: process.env.GITHUB_CLIENT_ID,
//       clientSecret: process.env.GITHUB_CLIENT_SECRET,
//       callbackURL: process.env.GITHUB_callbackURL,
//     },
//     (accessToken, refreshToken, profile, done) => {
//       return done(null, profile);
//     }
//   )
// );
