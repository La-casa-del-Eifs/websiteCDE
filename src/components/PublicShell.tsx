import Navbar from "./Navbar";
import Footer from "./Footer";
import DemoBanner from "./DemoBanner";
import FloatingWhatsApp from "./FloatingWhatsApp";

export default function PublicShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <DemoBanner />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
