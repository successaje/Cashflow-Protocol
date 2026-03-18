import { ShieldAlert, FileText, Lock } from "lucide-react";

export default function LegalPage() {
    return (
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-20 min-h-[calc(100vh-4rem)]">
            <div className="mb-12">
                <h1 className="font-display text-4xl font-bold text-foreground mb-4">Legal & Compliance</h1>
                <p className="text-slate-500">Effective Date: October 15, 2026</p>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-[#F3BA2F] prose-a:no-underline hover:prose-a:underline">

                <div className="flex items-center gap-3 mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400">
                    <ShieldAlert className="h-6 w-6 flex-shrink-0" />
                    <p className="text-sm font-medium m-0">This document does not constitute financial advice. All investments carry risk, including the potential loss of principal. CashflowTokens are highly illiquid and experimental digital assets.</p>
                </div>

                <section className="mb-12">
                    <div className="flex items-center gap-2 mb-4 border-b border-surface-border pb-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <h2 className="text-2xl m-0">1. Terms of Service</h2>
                    </div>
                    <p>
                        By accessing or using the Cashflow Protocol ("Protocol"), you agree to be bound by these Terms of Service. The Protocol is a decentralized suite of smart contracts on the BNB Chain that facilitate peer-to-peer liquidity provision.
                    </p>
                    <h3>1.1 Interface Usage</h3>
                    <p>
                        The Cashflow Protocol web interface (this website) is a graphical user interface designed to help users interact with the underlying decentralized smart contracts. We do not have access to your funds, nor do we custody any digital assets. You are solely responsible for managing your cryptographic private keys and web3 wallets.
                    </p>
                    <h3>1.2 Jurisdictional Restrictions</h3>
                    <p>
                        The Protocol interface is not intended for use by persons or entities in jurisdictions where the distribution or use of such services would be contrary to local law or regulation, specifically including the United States of America, Cuba, Iran, North Korea, Syria, and regions of Ukraine.
                    </p>
                </section>

                <section className="mb-12">
                    <div className="flex items-center gap-2 mb-4 border-b border-surface-border pb-2">
                        <ShieldAlert className="h-5 w-5 text-emerald-500" />
                        <h2 className="text-2xl m-0">2. Risk Disclosures</h2>
                    </div>
                    <p>
                        Participation in real-world asset (RWA) tokenization pools involves substantial risks:
                    </p>
                    <ul>
                        <li><strong>Smart Contract Risk:</strong> While audited, the smart contracts governing the Cashflow Pools may contain undiscovered vulnerabilities that could lead to a total loss of funds.</li>
                        <li><strong>Business Default Risk:</strong> The underlying businesses tokenizing their revenue may fail to generate sufficient cashflow to fulfill yield obligations.</li>
                        <li><strong>Oracle Failure:</strong> The decentralized oracle nodes reading Point of Sale (PoS) data may experience downtime, manipulation, or synchronization errors.</li>
                    </ul>
                </section>

                <section>
                    <div className="flex items-center gap-2 mb-4 border-b border-surface-border pb-2">
                        <Lock className="h-5 w-5 text-[#F3BA2F]" />
                        <h2 className="text-2xl m-0">3. Privacy Policy</h2>
                    </div>
                    <p>
                        Cashflow Protocol respects your privacy. As a web3 application, we do not require conventional account registration.
                    </p>
                    <p>
                        <strong>Data we collect:</strong> We collect non-identifiable analytics to improve interface performance. Wallet addresses interacting with the Protocol are public by the nature of the BNB Chain blockchain.
                    </p>
                </section>

            </div>
        </div>
    );
}
