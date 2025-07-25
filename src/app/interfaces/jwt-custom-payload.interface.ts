import {JwtPayload} from 'jwt-decode';

export interface JwtCustomPayload extends JwtPayload {
  firstName: string;
  lastName: string;
  role: string;
}
