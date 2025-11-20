import { CheckCircle, Clock, Train, Twitter, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="border-t border-border/40 bg-background py-12">
      <div className="container mx-auto px-4">
        {/* Top Row: Trust Signals */}
        <div className="mb-12 flex flex-wrap justify-center gap-6 border-b border-border/40 pb-12 font-mono text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span>Réponse sous 2h</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span>Équipe française</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-primary" />
            <span>RGPD conforme</span>
          </div>
          <div className="flex items-center gap-2">
            <Train className="h-4 w-4 text-primary" />
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
                  to="/contact"
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
                  to="/features"
                  className="text-slate-400 transition-colors hover:text-primary"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
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
                <a
                  href="https://x.com/tomcoustols"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-slate-400 transition-colors hover:text-primary md:justify-start"
                >
                  <Twitter className="h-4 w-4" />
                  <span>Twitter/X</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.termsfeed.com/live/fa645ea2-fa78-4258-9064-630eeef14d62"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 transition-colors hover:text-primary"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="https://www.termsfeed.com/live/0d2ed5d6-3b2e-4040-b09d-1ff7cb705693"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 transition-colors hover:text-primary"
                >
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a
                  href="https://app.termsfeed.com/download/5a5ab972-5165-4b73-97d1-ed0a6524d7ac"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 transition-colors hover:text-primary"
                >
                  EULA
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-border/40 pt-8 text-center text-sm text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} WorkFlowAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
