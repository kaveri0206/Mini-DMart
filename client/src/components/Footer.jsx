import React from 'react';
import { ShoppingBag, ShieldCheck, Truck, Clock, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="text-lg font-black text-white">D-MartX</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Enterprise grocery commerce platform powered by AI assistance, real-time inventory locking, and scheduled pickup slots.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Shop Departments</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#" className="hover:text-emerald-400">Dairy & Breakfast</a></li>
              <li><a href="#" className="hover:text-emerald-400">Atta, Rice & Dal</a></li>
              <li><a href="#" className="hover:text-emerald-400">Fresh Fruits & Veggies</a></li>
              <li><a href="#" className="hover:text-emerald-400">Snacks & Munchies</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Customer Support</h4>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#" className="hover:text-emerald-400">Track Order Timeline</a></li>
              <li><a href="#" className="hover:text-emerald-400">7-Day Return Policy</a></li>
              <li><a href="#" className="hover:text-emerald-400">Store Pickup Slots</a></li>
              <li><a href="#" className="hover:text-emerald-400">Help & FAQs</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Security & Compliance</h4>
            <p className="text-slate-400 leading-relaxed">
              Protected by RBAC authorization, atomic MongoDB reservation transactions, and OWASP security standards.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-slate-500 text-[11px]">
          <p>© 2026 D-MartX Commerce Inc. All rights reserved.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Built for Enterprise Full Stack Practical Assessment
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;