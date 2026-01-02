import { FC } from 'react';
import Link from 'next/link';
import { Layers, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer: FC = () => {
    return (
        <footer className="bg-[#F3F4F6] py-12 sm:py-16 border-t border-gray-200 w-full">
            <div className="mx-auto max-w-5xl px-6 flex flex-col items-center text-center gap-10 md:flex-row md:justify-between md:items-start md:text-left">
                {/* Logo Section */}
                <div className="flex items-center">
                    <Layers className="h-8 w-8 text-[var(--neuro-green)]" />
                    <span className="text-xl font-bold text-black ml-2">NeuroCrece</span>
                </div>

                {/* Navigation Links */}
                <nav className="flex flex-row gap-4 flex-wrap justify-center md:gap-8">
                    <Link href="/faq" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
                        FAQ
                    </Link>
                    <Link href="/privacy-policy" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
                        Política de Privacidad
                    </Link>
                    <Link href="/terms-of-service" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
                        Términos de Servicio
                    </Link>
                </nav>

                {/* Social Indicators */}
                <div className="flex gap-6">
                    <Link href="#" aria-label="Facebook">
                        <Facebook className="text-black w-5 h-5 hover:text-[#22C55E] transition-colors cursor-pointer" />
                    </Link>
                    <Link href="#" aria-label="Instagram">
                        <Instagram className="text-black w-5 h-5 hover:text-[#22C55E] transition-colors cursor-pointer" />
                    </Link>
                    <Link href="#" aria-label="Twitter">
                        <Twitter className="text-black w-5 h-5 hover:text-[#22C55E] transition-colors cursor-pointer" />
                    </Link>
                </div>
            </div>

            {/* Copyright */}
            <div className="mx-auto max-w-5xl px-6 mt-12 pt-8 border-t border-gray-300 w-full text-center">
                <p className="text-xs text-gray-400">
                    © 2024 NeuroCrece. Todos los derechos reservados.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
