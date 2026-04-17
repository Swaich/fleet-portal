export const metadata = {
  title: "M'S FLEET SERVICE",
  description: "Dispatch and Payroll Portal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
