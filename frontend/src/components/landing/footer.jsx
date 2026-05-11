export function Footer() {
  const sections = [
    { heading: "Product", links: ["Features", "Pricing", "Documentation"] },
    { heading: "Company",  links: ["About", "Blog", "Contact"] },
    { heading: "Legal",    links: ["Privacy", "Terms", "Cookies"] },
  ]

  return (
    <footer className="bg-[#0a0818] border-t border-[#2d2a50] py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-10 mb-10 animate-fade-in">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 gradient-indigo rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/30">
                <span className="text-white font-bold text-sm">TH</span>
              </div>
              <span className="font-bold text-white text-lg tracking-tight">TrendHive</span>
            </div>
            <p className="text-sm text-[#6b7280] leading-relaxed">AI-powered trend discovery for the modern world.</p>
          </div>

          {/* Links */}
          {sections.map((section) => (
            <div key={section.heading}>
              <h4 className="font-semibold text-white mb-4 text-sm tracking-wide">{section.heading}</h4>
              <ul className="space-y-2.5 text-sm">
                {section.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-[#6b7280] hover:text-indigo-400 transition-colors duration-200">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#2d2a50] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[#6b7280]">© 2025 TrendHive. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            {["Twitter", "LinkedIn", "GitHub"].map((social) => (
              <a key={social} href="#" className="text-[#6b7280] hover:text-indigo-400 transition-colors duration-200">
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
