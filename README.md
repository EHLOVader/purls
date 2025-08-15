# pURLs

**Parameter editor for URLs.** When adding URL parameters to existing ones, this will help keep the separators clear and ensure you have a functional URL.

## ✨ Features

### Core Functionality
- **Smart URL Parsing** - Automatically extracts and organizes query parameters
- **Visual Parameter Management** - Clear visual indicators for \`?\` and \`&\` separators
- **Fragment Handling** - Properly manages URL fragments (\`#section\`) and fixes malformed URLs
- **Real-time URL Building** - Instantly see your reconstructed URL as you edit

### Advanced Features
- **🔄 Redirect Analysis** - Test how your parameters behave through redirect chains
- **📊 UTM Template** - One-click addition of all UTM tracking parameters
- **⚠️ Change Detection** - Visual warnings when parameter values change during redirects
- **📋 Copy to Clipboard** - Easy copying of your final URL

### Planned Features
- **🔄 Drag & Drop Reordering** - Rearrange parameters by dragging
- **🏷️ Parameter Templates** - Boilerplate sets for Google Analytics, HubSpot, Facebook, etc.
- **🧹 Tracker Removal** - Easy removal of common tracking parameters
- **📝 Array Parameter Support** - Handle parameters with \`[]\` syntax

## 🚀 Getting Started

### Prerequisites
- Node.js 18.18.0 or higher
- npm or yarn

### Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/yourusername/purls.git
cd purls

# Install dependencies
npm install

# Start the development server
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## 🛠️ Usage

### Basic Usage
1. **Paste your URL** into the input field
2. **Edit parameters** using the key/value inputs
3. **Add new parameters** with the "Add Parameter" button
4. **Copy the final URL** when you're done

### UTM Tracking
1. Click **"Add UTM Fields"** to add all UTM parameters at once
2. Fill in your campaign details:
   - \`utm_source\` - Traffic source (google, newsletter, etc.)
   - \`utm_medium\` - Marketing medium (cpc, email, social, etc.)
   - \`utm_campaign\` - Campaign name
   - \`utm_term\` - Paid search keywords
   - \`utm_content\` - Content differentiation

### Redirect Testing
1. Build your URL with parameters
2. Click **"Check Redirects"** to test the redirect chain
3. Review the analysis to ensure parameters are preserved

### Fragment Management
- **Add fragments** with the "Add Fragment" button
- **Fix malformed URLs** - pURLs automatically corrects URLs where \`#\` appears before \`?\`
- **Proper positioning** - Fragments are always placed at the end of the final URL

## 🏗️ Built With

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful and accessible UI components

## 📁 Project Structure

\`\`\`
purls/
├── app/
│   ├── api/
│   │   └── redirect-check/
│   │       └── route.ts          # Server-side redirect checking
│   ├── globals.css               # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main application
├── components/
│   └── ui/                      # shadcn/ui components
├── lib/
│   └── utils.ts                 # Utility functions
└── public/                      # Static assets
\`\`\`

## 🚀 Deployment

### Vercel (Recommended)
The easiest way to deploy pURLs is using Vercel:

\`\`\`bash
npm run build
npx vercel --prod
\`\`\`

### Static Deployment (GitHub Pages, Netlify)
For static hosting, the redirect checking feature requires a server. The core URL parameter editing works perfectly as a static site.

### Docker
\`\`\`bash
# Build the image
docker build -t purls .

# Run the container
docker run -p 3000:3000 purls
\`\`\`

## 🤝 Contributing

Contributions are welcome! Here are some ways you can help:

### Priority Features
- [ ] Drag and drop parameter reordering
- [ ] Parameter templates (GA, HubSpot, Facebook, etc.)
- [ ] Tracker removal tools
- [ ] Array parameter support (\`param[]\`)
- [ ] Bulk parameter import/export
- [ ] URL validation and suggestions

### Development Setup
1. Fork the repository
2. Create a feature branch: \`git checkout -b feature/amazing-feature\`
3. Make your changes and test thoroughly
4. Commit your changes: \`git commit -m 'Add amazing feature'\`
5. Push to the branch: \`git push origin feature/amazing-feature\`
6. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide React](https://lucide.dev/)

## 📞 Support

If you have questions or need help:
- 🐛 [Report bugs](https://github.com/yourusername/purls/issues)
- 💡 [Request features](https://github.com/yourusername/purls/issues)
- 📧 [Contact support](mailto:support@purls.dev)

---

**pURLs** - Making URL parameter management simple and reliable
