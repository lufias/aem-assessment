import { render, screen, fireEvent } from '@testing-library/angular';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { NgChartsModule } from 'ng2-charts';
import { DashboardComponent } from './dashboard.component';
import { LoginActions } from '../auth/store';

describe('DashboardComponent', () => {
  const initialState = {
    auth: {
      login: {
        token: 'test-token',
        loading: false,
        error: null
      }
    },
    dashboard: {
      chartDonut: [],
      chartBar: [],
      tableUsers: [],
      loading: false,
      error: null
    }
  };

  async function setup(stateOverrides: any = {}) {
    const state = {
      ...initialState,
      dashboard: { ...initialState.dashboard, ...stateOverrides }
    };

    const { fixture } = await render(DashboardComponent, {
      imports: [NgChartsModule],
      providers: [provideMockStore({ initialState: state })]
    });

    const store = fixture.debugElement.injector.get(MockStore);
    const dispatchSpy = spyOn(store, 'dispatch').and.callThrough();

    return { fixture, store, dispatchSpy };
  }

  describe('page rendering', () => {
    it('should display the dashboard title in navbar', async () => {
      await setup();

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('should display the sign out button', async () => {
      await setup();

      expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
    });

    it('should display Overview section heading', async () => {
      await setup();

      expect(screen.getByText('Overview')).toBeInTheDocument();
    });

    it('should display User List section heading', async () => {
      await setup();

      expect(screen.getByText('User List')).toBeInTheDocument();
    });

    it('should display chart card titles', async () => {
      await setup();

      expect(screen.getByText('Donut Chart')).toBeInTheDocument();
      expect(screen.getByText('Bar Chart')).toBeInTheDocument();
    });
  });

  describe('data loading', () => {
    it('should display loading spinner when loading', async () => {
      await setup({ loading: true });

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should not display loading spinner when not loading', async () => {
      await setup({ loading: false });

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('should display error message when there is an error and no data', async () => {
      await setup({ error: 'Failed to load dashboard data', tableUsers: [] });

      expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument();
    });

    it('should hide error message when data is loaded', async () => {
      await setup({
        error: 'Some error',
        tableUsers: [{ firstName: 'John', lastName: 'Doe', username: 'john_doe' }]
      });

      expect(screen.queryByText('Some error')).not.toBeVisible();
    });
  });

  describe('user table', () => {
    it('should display table headers', async () => {
      await setup();

      expect(screen.getByText('#')).toBeInTheDocument();
      expect(screen.getByText('First Name')).toBeInTheDocument();
      expect(screen.getByText('Last Name')).toBeInTheDocument();
      expect(screen.getByText('User Name')).toBeInTheDocument();
    });

    it('should display user data in table', async () => {
      await setup({
        tableUsers: [
          { firstName: 'John', lastName: 'Doe', username: 'john_doe' },
          { firstName: 'Jane', lastName: 'Smith', username: 'jane_smith' }
        ]
      });

      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('Doe')).toBeInTheDocument();
      expect(screen.getByText('john_doe')).toBeInTheDocument();
      expect(screen.getByText('Jane')).toBeInTheDocument();
      expect(screen.getByText('Smith')).toBeInTheDocument();
      expect(screen.getByText('jane_smith')).toBeInTheDocument();
    });

    it('should display row numbers starting from 1', async () => {
      await setup({
        tableUsers: [
          { firstName: 'John', lastName: 'Doe', username: 'john_doe' },
          { firstName: 'Jane', lastName: 'Smith', username: 'jane_smith' }
        ]
      });

      const rows = screen.getAllByRole('row');
      // First row is header, data rows start from index 1
      expect(rows[1]).toHaveTextContent('1');
      expect(rows[2]).toHaveTextContent('2');
    });
  });

  describe('logout', () => {
    it('should dispatch logout action when sign out button is clicked', async () => {
      const { dispatchSpy } = await setup();

      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      fireEvent.click(signOutButton);

      expect(dispatchSpy).toHaveBeenCalledWith(LoginActions.logout());
    });
  });
});
