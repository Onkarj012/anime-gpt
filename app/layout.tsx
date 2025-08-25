import "./global.css";
import "./markdown.css";
import "./chat-sessions.css";
import { inter, notoSansJP } from "./fonts";

export const metadata = {
  title: "AnimeGPT",
  description: "The place for all your anime questions",
};

const RootLayout = ({ children }) => {
  return (
    <html lang="en" className={`${inter.variable} ${notoSansJP.variable}`}>
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
