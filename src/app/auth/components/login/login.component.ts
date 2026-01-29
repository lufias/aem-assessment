import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { LoginActions, selectLoginLoading, selectLoginError } from '../../store';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading$: Observable<boolean>;
  error$: Observable<string | null>;

  private errorMessages: Record<string, Record<string, string>> = {
    username: {
      required: 'Username is required'
    },
    password: {
      required: 'Password is required'
    }
  };

  constructor(
    private fb: FormBuilder,
    private store: Store
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.isLoading$ = this.store.select(selectLoginLoading);
    this.error$ = this.store.select(selectLoginError);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.loginForm.get(fieldName);
    if (control?.errors) {
      const errorKey = Object.keys(control.errors)[0];
      return this.errorMessages[fieldName]?.[errorKey] || 'Invalid field';
    }
    return '';
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.store.dispatch(LoginActions.login({ credentials: this.loginForm.value }));
  }
}
