import "./global.css";

export const metadata = {
  title: "AnimeGPT",
  description: "The place for all your anime questions",
};

const RootLayout = ({ children }) => {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Noto+Sans+JP:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
