import React from 'react';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

/** Standard page chrome: header, the focusable main landmark (skip-link target) and footer. */
export default function PageLayout({ children, mainClassName = '', ...mainProps }) {
  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1} className={mainClassName} {...mainProps}>
        {children}
      </main>
      <Footer />
    </>
  );
}
