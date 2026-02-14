export default function Footer() {
  return (
    <footer className="bg-black text-gray-400 pt-16 pb-8 border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand & Info */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
                <span className="material-icons-round text-white text-lg">health_and_safety</span>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">MamaGuard</span>
            </div>
            <p className="text-sm mb-6 leading-relaxed">
              Empowering maternal health through voice AI technology. Bridging the gap between rural mothers and lifesaving care.
            </p>
            <div className="flex space-x-4">
              <a className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center hover:bg-primary hover:text-white transition-colors" href="#">
                <span className="material-icons-round text-sm">facebook</span>
              </a>
              <a className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center hover:bg-primary hover:text-white transition-colors" href="#">
                <span className="material-icons-round text-sm">alternate_email</span>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-semibold mb-6">Platform</h4>
            <ul className="space-y-4 text-sm">
              <li><a className="hover:text-primary transition-colors" href="#">How it Works</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">For Clinics</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Impact Stories</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Pricing</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-6">Company</h4>
            <ul className="space-y-4 text-sm">
              <li><a className="hover:text-primary transition-colors" href="#">About Us</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Careers</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Privacy Policy</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Terms of Service</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-6">Contact</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <span className="material-icons-round text-primary text-sm mt-0.5">email</span>
                <span>hello@mamaguard.health</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-icons-round text-primary text-sm mt-0.5">phone</span>
                <span>+234 (0) 800 MAMA SAFE</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-icons-round text-primary text-sm mt-0.5">location_on</span>
                <span>Lagos Innovation Center,<br />Ikoyi, Lagos</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Partner Logos */}
        <div className="border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 opacity-60 hover:opacity-100 transition-opacity">
          <span className="text-xs font-semibold uppercase tracking-wider">In Partnership With:</span>
          <div className="flex items-center gap-8 grayscale">
            {/* Placeholder Logos */}
            <div className="flex items-center gap-2" title="Ministry of Health">
              <div className="h-8 w-8 rounded-full border-2 border-current flex items-center justify-center">
                <span className="material-icons-round text-lg">local_hospital</span>
              </div>
              <span className="font-bold text-lg">MOH</span>
            </div>
            <div className="flex items-center gap-2" title="Global Health Initiative">
              <div className="h-8 w-8 rounded-full border-2 border-current flex items-center justify-center">
                <span className="material-icons-round text-lg">public</span>
              </div>
              <span className="font-bold text-lg">GHI</span>
            </div>
            <div className="flex items-center gap-2" title="Tech for Good">
              <div className="h-8 w-8 rounded-full border-2 border-current flex items-center justify-center">
                <span className="material-icons-round text-lg">auto_awesome</span>
              </div>
              <span className="font-bold text-lg">T4G</span>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-xs text-gray-600">
          © 2023 MamaGuard Health. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
