export const metadata = {
  title: "M'S FLEET SERVICE",
  description: "Dispatch Portal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f1f5f9' }}>
        {children}
      </body>
    </html>
  );
}
