# Agora Voice Web

Agora Voice, yapay zeka destekli müzik asistanı web uygulaması.

## 🚀 Özellikler

- Modern ve etkileşimli kullanıcı arayüzü
- Hover efektleri ve animasyonlar
- Sesli asistan entegrasyonu
- Responsive tasarım
- Docker desteği

## 🛠️ Teknolojiler

- React.js
- TypeScript
- Tailwind CSS
- Docker
- Node.js

## 📋 Gereksinimler

- Node.js (v18 veya üzeri)
- Docker ve Docker Compose
- npm veya yarn

## 🚀 Kurulum

### Yerel Geliştirme Ortamı

1. Projeyi klonlayın:
```bash
git clone https://github.com/[kullanıcı-adınız]/agoravoiceweb.git
cd agoravoiceweb
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Uygulamayı başlatın:
```bash
npm start
```

### Docker ile Çalıştırma

1. Docker imajını oluşturun ve başlatın:
```bash
docker-compose up --build
```

2. Uygulama http://localhost:3000 adresinde çalışmaya başlayacaktır.

## 🎨 Özelleştirme

### Ses Dosyası Değiştirme

`public` klasöründeki `signore-trial.mp3` dosyasını değiştirerek hover sesini özelleştirebilirsiniz.

### Tema Renkleri

Tailwind CSS kullanıldığı için, `tailwind.config.js` dosyasından renk şemasını özelleştirebilirsiniz.

## 📁 Proje Yapısı

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

## 🔧 Docker Komutları

- Uygulamayı başlatma:
```bash
docker-compose up
```

- Arka planda çalıştırma:
```bash
docker-compose up -d
```

- Uygulamayı durdurma:
```bash
docker-compose down
```

- Logları görüntüleme:
```bash
docker-compose logs -f
```

## 🤝 Katkıda Bulunma

1. Bu depoyu fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 📞 İletişim

- Instagram: [@agoravoice](https://instagram.com/agoravoice)
- Website: [agoravoice.com](https://agoravoice.com)

## 🙏 Teşekkürler

- Tüm katkıda bulunanlara
- Açık kaynak topluluğuna
- Agora Voice ekibine
