import { Link } from 'react-router-dom'

import CheckCircle from '~icons/lucide/check-circle'
import Clock from '~icons/lucide/clock'
import Train from '~icons/lucide/train'
import Twitter from '~icons/lucide/twitter'
import Users from '~icons/lucide/users'

const Footer = () => {
  return (
    <footer className="border-border/40 bg-background border-t py-12">
      <div className="container mx-auto px-4">
        {/* Top Row: Trust Signals */}
        <div className="border-border/40 text-muted-foreground mb-12 flex flex-wrap justify-center gap-6 border-b pb-12 font-mono text-sm">
          <div className="flex items-center gap-2">
            <Clock className="text-primary size-4" />
            <span>Réponse sous 2h</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="text-primary size-4" />
            <span>Équipe française</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="text-primary size-4" />
            <span>RGPD conforme</span>
          </div>
          <div className="flex items-center gap-2">
            <Train className="text-primary size-4" />
            <span>Accès RER C</span>
          </div>
        </div>

        {/* Bottom Row: Navigation Grid */}
        <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-4 md:text-left">
          {/* Column 1: Company */}
          <div className="space-y-4">
            <h3 className="text-foreground text-lg font-bold">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="hover:text-primary text-slate-400 transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/#contact"
                  className="hover:text-primary text-slate-400 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Product */}
          <div className="space-y-4">
            <h3 className="text-foreground text-lg font-bold">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/#features"
                  className="hover:text-primary text-slate-400 transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  to="/#pricing"
                  className="hover:text-primary text-slate-400 transition-colors"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Social */}
          <div className="space-y-4">
            <h3 className="text-foreground text-lg font-bold">Social</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://x.com/tomcoustols"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary flex items-center justify-center gap-2 text-slate-400 transition-colors md:justify-start"
                >
                  <Twitter className="size-4" />
                  <span>Twitter/X</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/tom-coustols/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary flex items-center justify-center gap-2 text-slate-400 transition-colors md:justify-start"
                >
                  <span className="text-primary">🔗</span>
                  <span>LinkedIn</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/profile.php?id=61551507203997"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary flex items-center justify-center gap-2 text-slate-400 transition-colors md:justify-start"
                >
                  <span className="text-primary">📘</span>
                  <span>Facebook</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/tomcoustols/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary flex items-center justify-center gap-2 text-slate-400 transition-colors md:justify-start"
                >
                  <span className="text-primary">📸</span>
                  <span>Instagram</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.youtube.com/@tomcoustols"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary flex items-center justify-center gap-2 text-slate-400 transition-colors md:justify-start"
                >
                  <span className="text-primary">📺</span>
                  <span>YouTube</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div className="space-y-4">
            <h3 className="text-foreground text-lg font-bold">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.termsfeed.com/live/fa645ea2-fa78-4258-9064-630eeef14d62"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary text-slate-400 transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="https://www.termsfeed.com/live/0d2ed5d6-3b2e-4040-b09d-1ff7cb705693"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary text-slate-400 transition-colors"
                >
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a
                  href="https://app.termsfeed.com/download/5a5ab972-5165-4b73-97d1-ed0a6524d7ac"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary text-slate-400 transition-colors"
                >
                  EULA
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-border/40 mt-12 border-t pt-8 text-center text-sm text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} TCDynamics. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
