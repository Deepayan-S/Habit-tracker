# Habit Tracker 

A sleek and minimal habit tracking web application built entirely using **TypeScript**, with both frontend and backend implemented using **Vite**. The app supports user authentication, habit tracking, and is fully deployed on **Vercel** for a seamless experience.

## Features
- User authentication (login & signup)
- Add, remove, and update daily habits
- Track habit streaks and completions
- Persistent storage using a backend database
- Type-safe codebase using TypeScript on both client and server

## Tech Stack
- **Frontend**: TypeScript, Vite, HTML, CSS
- **Backend**: TypeScript, Vite (API Routes or Server Entry)
- **Authentication**: JWT-based auth
- **Deployment**: [Vercel](https://vercel.com)

## Live Demo
🔗 [View Live on Vercel](https://your-vercel-app-url.vercel.app)

## Getting Started
### 1. Clone the Repository
```sh
git clone https://github.com/your-username/habit-tracker.git
cd habit-tracker
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Set Environment Variables
Create a `.env` file and add your environment variables:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 4. Run Locally
```sh
npm run dev
```
Then visit `http://localhost:3000` in your browser.

## Folder Structure
```
habit-tracker/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── api/               # Vite backend routes
│   ├── styles/
│   └── main.ts
├── index.html
├── tsconfig.json
├── vite.config.ts
├── package.json
└── README.md
```

## Customization
- Customize UI styles in the `src/styles/` folder.
- Extend or modify routes under `src/api/`.
- Connect to any database by updating connection logic.

## Deployment
This app is deployed via Vercel with both frontend and backend handled through the same Vite project. Be sure to set your environment variables in the Vercel dashboard.

## License
Licensed under the MIT License.

## Contributing
Pull requests are welcome! Feel free to fork the repo and submit improvements.

---

Track your habits. Build consistency. Stay accountable.

✨ Made with Vite, TypeScript, and ❤️

