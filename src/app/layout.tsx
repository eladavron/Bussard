import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes'
import './globals.css';
import { OptionsProvider } from '@/src/context/OptionsContext';

export const metadata: Metadata = {
    title: 'Codename "Bussard"',
    description: 'A personal movie collection manager built with Next.js and Heroui.',
};

export default function RootLayout({
    children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
        <html lang='en' suppressHydrationWarning>
            <body>
                <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
                    <OptionsProvider>
                        <main className='main-page'>
                            <div className='mx-auto'>
                                {children}
                            </div>
                        </main>
                    </OptionsProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
