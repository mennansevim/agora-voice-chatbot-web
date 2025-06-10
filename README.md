# Agora Voice Web

Agora Voice, an AI-powered music assistant web application.

## 🚀 Features

- Modern and interactive user interface
- Hover effects and animations
- Voice assistant integration
- Responsive design
- Docker support

## 🛠️ Technologies

- React.js
- TypeScript
- Tailwind CSS
- Docker
- Node.js

## 📋 Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- npm or yarn

## 🚀 Installation

### Local Development Environment

1. Clone the repository:
```bash
git clone https://github.com/[your-username]/agoravoiceweb.git
cd agoravoiceweb
```

2. Install dependencies:
```bash
npm install
```

3. Start the application:
```bash
npm start
```

### Running with Docker

1. Build and start the Docker image:
```bash
docker-compose up --build
```

2. The application will be available at http://localhost:3000

## 🎨 Customization

### Changing Sound File

You can customize the hover sound by replacing the `signore-trial.mp3` file in the `public` directory.

### Theme Colors

Since Tailwind CSS is used, you can customize the color scheme from the `tailwind.config.js` file.

## 📁 Project Structure

```
agoravoiceweb/
├── public/
│   ├── signore-trial.mp3
│   └── logo.png
├── src/
│   ├── App.tsx
│   └── index.tsx
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## 🔧 Docker Commands

- Start the application:
```bash
docker-compose up
```

- Run in background:
```bash
docker-compose up -d
```

- Stop the application:
```bash
docker-compose down
```

- View logs:
```bash
docker-compose logs -f
```

## 🤝 Contributing

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

- Instagram: [@agoravoice](https://instagram.com/agoravoice)
- Website: [agoravoice.com](https://agoravoice.com)

## 🙏 Acknowledgments

- All contributors
- Open source community
- Agora Voice team
