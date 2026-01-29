import { render, screen, fireEvent } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { ReactiveFormsModule } from '@angular/forms';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { LoginComponent } from './login.component';
import { LoginActions } from '../../store';

describe('LoginComponent', () => {
  const initialState = {
    auth: {
      login: {
        token: null,
        loading: false,
        error: null
      }
    }
  };

  async function setup(stateOverrides = {}) {
    const state = {
      ...initialState,
      auth: {
        ...initialState.auth,
        login: { ...initialState.auth.login, ...stateOverrides }
      }
    };

    const { fixture } = await render(LoginComponent, {
      imports: [ReactiveFormsModule],
      providers: [provideMockStore({ initialState: state })]
    });

    const store = fixture.debugElement.injector.get(MockStore);
    const dispatchSpy = spyOn(store, 'dispatch').and.callThrough();

    return { fixture, store, dispatchSpy };
  }

  describe('form rendering', () => {
    it('should display the login title', async () => {
      await setup();

      expect(screen.getByText('Sign in to your dashboard')).toBeInTheDocument();
    });

    it('should display username and password input fields', async () => {
      await setup();

      expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    });

    it('should display the sign in button', async () => {
      await setup();

      const button = screen.getByRole('button', { name: /sign in/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('form validation', () => {
    it('should show validation error when submitting with empty username', async () => {
      await setup();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      expect(await screen.findByText('Username is required')).toBeInTheDocument();
    });

    it('should show validation error when submitting with empty password', async () => {
      await setup();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      expect(await screen.findByText('Password is required')).toBeInTheDocument();
    });

    it('should show both validation errors when submitting empty form', async () => {
      await setup();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      expect(await screen.findByText('Username is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  describe('user interaction', () => {
    it('should allow user to type in username field', async () => {
      const user = userEvent.setup();
      await setup();

      const usernameInput = screen.getByPlaceholderText('Username');
      await user.type(usernameInput, 'testuser');

      expect(usernameInput).toHaveValue('testuser');
    });

    it('should allow user to type in password field', async () => {
      const user = userEvent.setup();
      await setup();

      const passwordInput = screen.getByPlaceholderText('Password');
      await user.type(passwordInput, 'password123');

      expect(passwordInput).toHaveValue('password123');
    });

    it('should dispatch login action when form is submitted with valid credentials', async () => {
      const user = userEvent.setup();
      const { dispatchSpy } = await setup();

      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      expect(dispatchSpy).toHaveBeenCalledWith(
        LoginActions.login({
          credentials: { username: 'testuser', password: 'password123' }
        })
      );
    });

    it('should not dispatch login action when form is invalid', async () => {
      const user = userEvent.setup();
      const { dispatchSpy } = await setup();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      expect(dispatchSpy).not.toHaveBeenCalled();
    });
  });

  describe('loading state', () => {
    it('should show "SIGNING IN..." text when loading', async () => {
      await setup({ loading: true });

      expect(screen.getByRole('button', { name: /signing in/i })).toBeInTheDocument();
    });

    it('should disable the submit button when loading', async () => {
      await setup({ loading: true });

      const button = screen.getByRole('button', { name: /signing in/i });
      expect(button).toBeDisabled();
    });

    it('should show "SIGN IN" text when not loading', async () => {
      await setup({ loading: false });

      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('should display API error message when login fails', async () => {
      await setup({ error: 'Invalid username or password' });

      expect(screen.getByText('Invalid username or password')).toBeInTheDocument();
    });

    it('should not display error message when there is no error', async () => {
      await setup({ error: null });

      expect(screen.queryByText('Invalid username or password')).not.toBeInTheDocument();
    });
  });
});
