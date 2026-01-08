import { Outfit } from 'next/font/google';
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import 'react-toastify/dist/ReactToastify.css'; 
import { Autorization } from '@/components/autorization/Autorization';
import { Loading } from '@/components/loading/Loading';
import { Providers } from "./providers"; 

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <Providers>
          <Loading />
          <Autorization /> 
          {children}
        </Providers>
      </body>
    </html>
  );
}