import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import {JwtCustomPayload} from '../interfaces/jwt-custom-payload.interface';
import {isValidRole} from '../models/roles.enum';

@Injectable({
  providedIn: 'root'
})
export class JwtDecoderService {
  constructor() {}

  decode(jwt: string): JwtCustomPayload | null {
    return jwtDecode<JwtCustomPayload>(jwt);
  }

  isExpired(payload: JwtCustomPayload): boolean {
    return (payload.exp === undefined || payload.exp * 1000 <= new Date().getTime());
  }

  isValidSubject(payload: JwtCustomPayload): boolean {
    return (payload.sub !== undefined && payload.sub.length > 0);
  }

  isValidData(payload: JwtCustomPayload): boolean {
    return (payload.firstName.length > 0 && payload.lastName.length > 0 && isValidRole(payload.role));
  }

  isValid(token: string): boolean {
    const payload = this.decode(token);

    return (payload !== null && !this.isExpired(payload) && this.isValidData(payload) && this.isValidSubject(payload));
  }

  getToken() : string | null {
    const token = localStorage.getItem('jwt');

    if (!token || !this.isValid(token)) return null;

    return token;
  }
}
