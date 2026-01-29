export interface LoginState {
  token: string | null;
  loading: boolean;
  error: string | null;
}

export const initialLoginState: LoginState = {
  token: localStorage.getItem('auth_token'),
  loading: false,
  error: null
};
