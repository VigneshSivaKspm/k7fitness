import { BrowserRouter, Route, Routes } from 'react-router';
import { ContentProvider } from './context/ContentContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import FloatingWhatsApp from './components/layout/FloatingWhatsApp';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Privacy from './pages/Privacy';
import StructuredData from './components/layout/StructuredData';

function SiteLayout({ children }) {
  return (
    <>
      <a
        href="#home"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <StructuredData />
      <Navbar />
      {children}
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}

export default function App() {
  return (
    <ContentProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <SiteLayout>
                <Home />
              </SiteLayout>
            }
          />
          <Route
            path="/privacy"
            element={
              <SiteLayout>
                <Privacy />
              </SiteLayout>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ContentProvider>
  );
}
