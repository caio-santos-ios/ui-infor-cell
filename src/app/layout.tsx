import { Outfit } from 'next/font/google';
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Loading } from '@/components/global/loading';
import { ToastContainer, toast } from 'react-toastify';
import { Autorization } from '@/components/global/autorization';

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
        <Loading />
        <ToastContainer />
        <Autorization />
        <ThemeProvider>
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
