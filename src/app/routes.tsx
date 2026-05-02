import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Budget } from './pages/Budget';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'transactions', Component: Transactions },
      { path: 'budget', Component: Budget },
      { path: 'reports', Component: Reports },
      { path: 'settings', Component: Settings },
    ],
  },
]);
