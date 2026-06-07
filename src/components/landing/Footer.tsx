import { Shield } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="py-20 border-t border-white/5">
    <div className="container mx-auto px-6">
      <div className="grid md:grid-cols-4 gap-12 mb-20">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-primary rounded-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight uppercase font-mono">E-VARA</span>
          </div>
          <p className="text-muted-foreground max-w-sm font-body leading-relaxed">
            Autonomous identity intelligence and threat containment for the modern executive. Built in the grid, verified by the source.
          </p>
        </div>
        <div>
          <h4 className="font-bold uppercase tracking-widest text-xs mb-6">Core Systems</h4>
          <ul className="space-y-4 text-sm text-muted-foreground font-mono uppercase tracking-tighter">
            <li><Link to="/client-portal" className="hover:text-primary transition-colors">Client Portal</Link></li>
            <li><button className="hover:text-primary transition-colors">Neural Net Scan</button></li>
            <li><button className="hover:text-primary transition-colors">Identity Engine</button></li>
            <li><button className="hover:text-primary transition-colors">Threat Surface</button></li>
            <li><button className="hover:text-primary transition-colors">API Keys</button></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold uppercase tracking-widest text-xs mb-6">Legal Protocol</h4>
          <ul className="space-y-4 text-sm text-muted-foreground font-mono uppercase tracking-tighter">
            <li><button className="hover:text-primary transition-colors">Data Privacy</button></li>
            <li><button className="hover:text-primary transition-colors">Terms of Use</button></li>
            <li><button className="hover:text-primary transition-colors">Security Ethics</button></li>
            <li><button className="hover:text-primary transition-colors">Compliance</button></li>
          </ul>
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-12 border-t border-white/5 text-[10px] font-mono uppercase text-muted-foreground tracking-[0.2em]">
        <span>© 2026 E-VARA SECURITY SYSTEMS. ALL RIGHTS RESERVED.</span>
        <div className="flex gap-8">
          <span>LATENCY: 12ms</span>
          <span className="text-success">NODE: SG-0182-ACTIVE</span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
