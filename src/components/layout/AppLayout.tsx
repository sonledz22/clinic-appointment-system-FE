import type { ReactNode } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: Readonly<AppLayoutProps>) => (
  <div className="app-shell">
    <Header />
    <main className="app-main">{children}</main>
    <Footer />
  </div>
);

export default AppLayout;
