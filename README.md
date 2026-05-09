<div align="center">
  <h1>HubSource</h1>
  <p><strong>A collaborative platform for discovering, sharing, and managing learning resources</strong></p>
  
  ![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
  ![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square&logo=typescript)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=flat-square&logo=tailwind-css)
  ![Firebase](https://img.shields.io/badge/Firebase-Latest-FFA500?style=flat-square&logo=firebase)
  ![MongoDB](https://img.shields.io/badge/MongoDB-9.6-green?style=flat-square&logo=mongodb)
  
  [Features](#features) • [Quick Start](#quick-start) • [Project Structure](#project-structure) • [Contributing](#contributing)
</div>

---

## 🎯 Features

- **📚 Resource Discovery** - Browse and search learning resources by category
- **⭐ Ratings & Reviews** - Like, save, and comment on resources
- **👥 User Profiles** - Build your reputation with a detailed profile and leaderboard ranking
- **🔐 Secure Authentication** - Firebase authentication with JWT tokens
- **💬 Social Interaction** - Comment on resources, follow users, and engage with the community
- **🏆 Leaderboard** - Compete and see top contributors
- **📱 Responsive Design** - Beautiful UI with Tailwind CSS and Shadcn components
- **🤖 AI Integration** - Powered by Google's Gemini AI

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (recommended 20+)
- **npm** or **yarn**
- Firebase project setup
- MongoDB instance

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/hubsource.git
   cd hubsource
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**
   Copy `.env.example` to `.env.local` and fill in your credentials:

   ```bash
   cp .env.example .env.local
   ```

   Required environment variables:
   - `NEXT_PUBLIC_FIREBASE_API_KEY` - Your Firebase API key
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Your Firebase project ID
   - `MONGODB_URI` - MongoDB connection string
   - `JWT_SECRET` - Secret key for JWT tokens
   - `GEMINI_API_KEY` - Google Gemini API key

4. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
hubsource/
├── src/
│   ├── app/                  # Next.js app directory
│   │   ├── api/              # API routes
│   │   ├── admin/            # Admin pages
│   │   ├── login/            # Authentication pages
│   │   ├── profile/          # User profile pages
│   │   ├── resources/        # Resource pages
│   │   └── ...
│   ├── components/           # React components
│   │   ├── ui/               # Shadcn UI components
│   │   ├── cards/            # Card components
│   │   └── layout/           # Layout components
│   ├── lib/                  # Utility functions
│   │   ├── firebase.ts       # Firebase initialization
│   │   ├── mongodb.ts        # MongoDB connection
│   │   ├── jwt.ts            # JWT utilities
│   │   └── utils.ts          # Helper functions
│   ├── models/               # Data models
│   │   ├── User.ts
│   │   ├── Resource.ts
│   │   └── Comment.ts
│   ├── services/             # Business logic
│   │   └── resourceService.ts
│   └── types.ts              # TypeScript definitions
├── scripts/                  # Utility scripts
│   └── seedAdmin.ts          # Database seeding
├── public/                   # Static assets
└── ...config files
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔧 Configuration Files

- **`next.config.mjs`** - Next.js configuration
- **`tsconfig.json`** - TypeScript configuration
- **`tailwind.config.ts`** - Tailwind CSS configuration
- **`postcss.config.mjs`** - PostCSS configuration

## 📦 Technology Stack

### Frontend

- **React 19** - UI library
- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/ui** - Component library
- **Zod** - Data validation

### Backend

- **Next.js API Routes** - REST API
- **MongoDB** - Primary database
- **Firestore** - Real-time database
- **Firebase Auth** - Authentication
- **JWT** - Token-based auth

### AI & Services

- **Google Gemini AI** - AI integration
- **Express** - Server framework
- **Mongoose** - MongoDB ODM

## 🤝 Contributing

We'd love to have your contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to get started.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

- 📖 Check the [documentation](https://github.com/yourusername/hubsource/wiki)
- 💬 Open an [issue](https://github.com/yourusername/hubsource/issues)
- 📧 Contact the team

## 🙏 Acknowledgments

- [Shadcn/ui](https://ui.shadcn.com/) - Component library
- [Next.js](https://nextjs.org/) - React framework
- [Firebase](https://firebase.google.com/) - Backend services
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework

---

<div align="center">
  <p>Made with ❤️ by the HubSource team</p>
</div>
