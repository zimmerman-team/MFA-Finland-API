export interface User {
  user_id: string;
  email: string;
  email_verified: Boolean;
  family_name: string;
  given_name: string;
  locale: string;
  name: string;
  nickname: string;
  picture: string;
  sub?: string;
  updated_at: string;
  groups?: string[];
  role?: string[];
  created_at: string;
  last_login: string;
  user_metadata: UserMetaData;

  //Fields to add to MongoDB schema
  birth_date?: Date;
  phone_number?: string;
}

export interface UserMetaData {
  birth_date?: Date;
  phone_number?: string;
}
