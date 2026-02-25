import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Rota değiştiğinde sayfayı en üste kaydırır.
 * UserLayout ve AdminLayout içinde kullanılmalıdır.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
