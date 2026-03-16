import "./globals.css";

export const metadata = {
  title: "HashQuest Arena",
  description: "OPNet Mining Game",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en">
      <body
        style={{
          backgroundImage: "url('/bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          minHeight: "100vh",
        }}
      >
        {children}
      </body>
    </html>
  );
}