import "./globals.css";

export const metadata = {
  title: "HashQuest Arena",
  description: "OPNet Mining & Raffle Ecosystem",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className="antialiased"
        style={{
          // Menggunakan background image dengan overlay gelap agar UI tetap kontras
          backgroundImage: "linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url('/bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          backgroundColor: "#020617", // Fallback warna gelap
          minHeight: "100vh",
        }}
      >
        {/* Konten Utama */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Efek Ambient (Opsional: bikin pojok layar agak gelap/vignette) */}
        <div className="fixed inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.8)] z-0"></div>
      </body>
    </html>
  );
}