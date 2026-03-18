"use client";

import * as React from 'react';
import {
    RainbowKitProvider,
    getDefaultConfig,
    darkTheme,
    lightTheme
} from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import {
    QueryClientProvider,
    QueryClient,
} from "@tanstack/react-query";
import { WagmiProvider } from 'wagmi';
import {
    bsc,
    bscTestnet
} from 'wagmi/chains';
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";

const config = getDefaultConfig({
    appName: 'Cashflow Protocol',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'c0f9941a5472eb2e3a1f19f201018698', // Read from env, fallback to public unrestricted key
    chains: [bsc, bscTestnet],
    ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem>
            <Web3Providers>{children}</Web3Providers>
        </NextThemesProvider>
    );
}

function Web3Providers({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = React.useState(false);
    const { resolvedTheme } = useTheme();

    React.useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider theme={resolvedTheme === 'dark' ? darkTheme() : lightTheme()}>
                    {mounted ? children : null}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
