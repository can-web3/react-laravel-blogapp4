import { Outlet } from "react-router-dom";
import Header from "@/components/user/Header";
import Footer from "@/components/user/Footer";
import ScrollToTop from "@/components/ScrollToTop";

export default function UserLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}