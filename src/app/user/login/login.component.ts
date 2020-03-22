import { AuthService } from './../../auth/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  authService;
  constructor(authService: AuthService) {
    this.authService = authService;
   }

  ngOnInit(): void {
  }

}
