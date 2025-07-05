import "./global.css";

export const metadata = {
  title: "AnimeGPT",
  description: "The place for all your anime questions",
};

const RootLayout = ({ children }) => {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
