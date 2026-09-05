import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'perform_pulse_auth_user';
  private readonly DEMO_USERS: { email: string; pass: string; user: User }[] = [
    {
      email: 'admin@company.com',
      pass: 'admin123',
      user: {
        id: 'usr-001',
        name: 'Ram Singh',
        email: 'admin@company.com',
        role: 'System Administrator',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        department: 'Executive Operations',
        notificationsCount: 4
      }
    },
    {
      email: 'sarah.j@company.com',
      pass: 'user123',
      user: {
        id: 'usr-002',
        name: 'Anjali Sharma',
        email: 'sarah.j@company.com',
        role: 'Operations Lead',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        department: 'Customer Support',
        notificationsCount: 2
      }
    }
  ];

  currentUser = signal<User | null>(this.loadStoredUser());

  constructor(private router: Router) { }

  private loadStoredUser(): User | null {
    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  login(identifier: string, pass: string): { success: boolean; message?: string; user?: User } {
    const trimmedId = identifier.trim().toLowerCase();
    const matched = this.DEMO_USERS.find(
      u => (u.email.toLowerCase() === trimmedId || u.user.name.toLowerCase() === trimmedId) && u.pass === pass
    );

    if (matched) {
      this.currentUser.set(matched.user);
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(matched.user));
      return { success: true, user: matched.user };
    }

    return {
      success: false,
      message: 'Invalid credentials. Please verify your email/username and password.'
    };
  }

  logout(): void {
    this.currentUser.set(null);
    sessionStorage.removeItem(this.STORAGE_KEY);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }
}
