import Link from "next/link";

export function Footer() {
    return (
        <footer className="border-t border-surface-border bg-background py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <span className="font-display text-xl font-bold tracking-tight text-white mb-4 block">
                            Cashflow<span className="text-primary">Protocol</span>
                        </span>
                        <p className="text-slate-400 text-sm max-w-sm">
                            Bridging real-world economic activity with decentralized financial infrastructure.
                            The future of yield is grounded in real revenue.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold tracking-wider text-white uppercase mb-4">Platform</h3>
                        <ul className="space-y-3">
                            <li><Link href="/explore" className="text-sm text-slate-400 hover:text-white transition-colors">Explore Pools</Link></li>
                            <li><Link href="/dashboard/investor" className="text-sm text-slate-400 hover:text-white transition-colors">Investor Portfolio</Link></li>
                            <li><Link href="/dashboard/business" className="text-sm text-slate-400 hover:text-white transition-colors">For Businesses</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold tracking-wider text-white uppercase mb-4">Resources</h3>
                        <ul className="space-y-3">
                            <li><Link href="/about" className="text-sm text-slate-400 hover:text-white transition-colors">How it Works</Link></li>
                            <li><Link href="/faq" className="text-sm text-slate-400 hover:text-white transition-colors">FAQs</Link></li>
                            <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Documentation</a></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-surface-border flex flex-col md:flex-row justify-between items-center">
                    <p className="text-slate-500 text-sm">
                        &copy; {new Date().getFullYear()} Cashflow Protocol. All rights reserved.
                    </p>
                    <div className="mt-4 md:mt-0 flex gap-4 text-sm text-slate-500">
                        <Link href="/legal" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link href="/legal" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="/legal" className="hover:text-white transition-colors">Risk Disclosures</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
