export class Constants {
  // public static DOMAIN: string = "http://www.danielmhair.com:3008";
  public static DOMAIN: string = "http://localhost:3008";
  public static API_ROOT: string = `${Constants.DOMAIN}/api`;
  public static USER_API: string = `${Constants.API_ROOT}/users`;
  public static AUTH_API: string = `${Constants.DOMAIN}/auth`;
  public static USER_ACTIVITIES_API: string = `${Constants.DOMAIN}/user_activities`;
  public static GOOGLE_LOGIN: string = `${Constants.AUTH_API}/google`;
  public static FACEBOOK_LOGIN: string = `${Constants.AUTH_API}/facebook`;
  public static TWITTER_LOGIN: string = `${Constants.AUTH_API}/twitter`;
  public static FOURSQUARE_LOGIN: string = `${Constants.AUTH_API}/foursquare`;
}
