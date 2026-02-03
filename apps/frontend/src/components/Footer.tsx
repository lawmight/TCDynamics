import { Link } from 'react-router-dom'

import ExternalLink from '@/components/ui/ExternalLink'
import CheckCircle from '~icons/lucide/check-circle'
import Clock from '~icons/lucide/clock'
import Train from '~icons/lucide/train'
import Twitter from '~icons/lucide/twitter'
import Users from '~icons/lucide/users'

const Footer = () => {
  return (
    <footer className="border-t border-border/40 bg-background py-12">
      <div className="container mx-auto px-4">
        {/* Top Row: Trust Signals */}
        <div className="mb-12 flex flex-wrap justify-center gap-6 border-b border-border/40 pb-12 font-mono text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-primary" />
            <span>Réponse sous 2h</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="size-4 text-primary" />
            <span>Équipe française</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="size-4 text-primary" />
            <span>RGPD conforme</span>
          </div>
          <div className="flex items-center gap-2">
            <Train className="size-4 text-primary" />
            <span>Accès RER C</span>
          </div>
        </div>

        {/* Bottom Row: Navigation Grid */}
        <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-4 md:text-left">
          {/* Column 1: Company */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-slate-400 transition-colors hover:text-primary"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/#contact"
                  className="text-slate-400 transition-colors hover:text-primary"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Product */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/#features"
                  className="text-slate-400 transition-colors hover:text-primary"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  to="/#pricing"
                  className="text-slate-400 transition-colors hover:text-primary"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Social */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">Social</h3>
            <ul className="space-y-2">
              <li>
                <ExternalLink
                  href="https://x.com/tomcoustols"
                  className="flex items-center justify-center gap-2 text-slate-400 transition-colors hover:text-primary md:justify-start"
                >
                  <Twitter className="size-4" />
                  <span>Twitter/X</span>
                </ExternalLink>
              </li>
              <li>
                <ExternalLink
                  href="https://www.linkedin.com/in/tom-coustols/"
                  className="flex items-center justify-center gap-2 text-slate-400 transition-colors hover:text-primary md:justify-start"
                >
                  <span className="text-primary">🔗</span>
                  <span>LinkedIn</span>
                </ExternalLink>
              </li>
              <li>
                <ExternalLink
                  href="https://www.facebook.com/tom.coustols"
                  className="flex items-center justify-center gap-2 text-slate-400 transition-colors hover:text-primary md:justify-start"
                >
                  <span className="text-primary">📘</span>
                  <span>Facebook</span>
                </ExternalLink>
              </li>
              <li>
                <ExternalLink
                  href="https://www.instagram.com/tomcoustols/"
                  className="flex items-center justify-center gap-2 text-slate-400 transition-colors hover:text-primary md:justify-start"
                >
                  <span className="text-primary">📸</span>
                  <span>Instagram</span>
                </ExternalLink>
              </li>
              <li>
                <ExternalLink
                  href="https://www.youtube.com/@tomtowo"
                  className="flex items-center justify-center gap-2 text-slate-400 transition-colors hover:text-primary md:justify-start"
                >
                  <span className="text-primary">📺</span>
                  <span>YouTube</span>
                </ExternalLink>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">Legal</h3>
            <ul className="space-y-2">
              <li>
                <ExternalLink
                  href="https://www.termsfeed.com/live/fa645ea2-fa78-4258-9064-630eeef14d62"
                  className="text-slate-400 transition-colors hover:text-primary"
                >
                  Privacy Policy
                </ExternalLink>
              </li>
              <li>
                <ExternalLink
                  href="https://www.termsfeed.com/live/0d2ed5d6-3b2e-4040-b09d-1ff7cb705693"
                  className="text-slate-400 transition-colors hover:text-primary"
                >
                  Terms & Conditions
                </ExternalLink>
              </li>
              <li>
                <ExternalLink
                  href="https://app.termsfeed.com/download/5a5ab972-5165-4b73-97d1-ed0a6524d7ac"
                  className="text-slate-400 transition-colors hover:text-primary"
                >
                  EULA
                </ExternalLink>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-border/40 pt-8 text-center text-sm text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} TCDynamics. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
