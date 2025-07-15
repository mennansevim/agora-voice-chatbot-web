import React from 'react';
import { Music, Users, Euro, Mail, Instagram, Globe, CheckCircle, Star, MapPin, Calendar } from 'lucide-react';

const Secmeler = () => {
  return (
    <section id="secmeler" className="min-h-screen bg-stone-50 py-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-terracotta-gradient rounded-full mb-8">
            <Music className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-agora-dark mb-6">
            🎶 <span className="text-agora-bronze">Seçmeler</span>
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-agora-bronze mb-4">
            Agora Voice 2025 / 2026 – Çok Sesli A Capella Koro Seçmeleri
          </h2>
          <p className="text-xl text-agora-muted max-w-6xl mx-auto leading-relaxed">
           
            Başvurular 16 Temmuz -  15 Ağustos 2025 tarihleri arasında yapılacaktır. 
            Amacımız yurtiçi ve yurtdışı festivallerde ülkemizi ve İzmir'i temsil edecek ekibi oluşturmaktır. 
            <br />
          
            Katılımcılar, uluslararası bir sahnede çok sesli müziğin coşkusunu paylaşma fırsatı bulacaklardır.
          </p>
        </div>

        {/* Kimler Başvurabilir */}
        <div className="card-agora rounded-2xl p-8 mb-12">
          <h3 className="text-3xl font-bold text-agora-dark mb-6 flex items-center">
            <Users className="w-8 h-8 text-agora-terracotta mr-3" />
            👥 Kimler Başvurabilir?
          </h3>
          <p className="text-lg text-agora-muted mb-6">Agora Voice'a katılmak için:</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                <p className="text-agora-muted">20 – 49 yaş aralığında olmalısınız.</p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                <p className="text-agora-muted">Konak/İzmir merkezli provalara düzenli katılım sağlayabilmelisiniz.</p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                <p className="text-agora-muted">2026 yılında festivale katılımınız için yurt dışı seyahati yapabilecek durumda olmalısınız.</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                <p className="text-agora-muted">Temel düzeyde nota bilgisi ve müzik kulağına sahip olmanız beklenir.</p>
              </div>
              <div className="flex items-start space-x-3">
                <Star className="w-6 h-6 text-agora-gold mt-1 flex-shrink-0" />
                <p className="text-agora-muted">Daha önce çok sesli müzik deneyimi edinmiş olmanız avantajdır ancak zorunlu değildir.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seçme Aşamaları */}
        <div className="card-agora rounded-2xl p-8 mb-12">
          <h3 className="text-3xl font-bold text-agora-dark mb-6 flex items-center">
            <Music className="w-8 h-8 text-agora-terracotta mr-3" />
            🧪 Seçme Aşamaları Nelerdir?
          </h3>
          <p className="text-lg text-agora-muted mb-8">Agora Voice seçmeleri canlı ve birebir yapılır. Aşamalar aşağıdaki gibidir:</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-terracotta/10 bg-stone-100 rounded-xl p-6 border border-terracotta/20">
              <h4 className="text-xl font-semibold text-agora-dark mb-3">1. Müzik Kulağı Testi</h4>
              <ul className="text-agora-muted space-y-2">
                <li>Piyano ile verilen rehber tek, çift, üç ve dört sesin tekrarı istenir.</li>
                <li>Adayın müzik kulağı ölçülür.</li>
              </ul>
            </div>

            <div className="bg-bronze/10 rounded-xl bg-stone-100 p-6 border border-bronze/20">
              <h4 className="text-xl font-semibold text-agora-dark mb-3">2. Ezgi Tekrarı</h4>
              <ul className="text-agora-muted space-y-2">
                <li>Verilen iki küçük ezgi piyano ile çalınır.</li>
                <li>Adayın tekrarı istenir.</li>
              </ul>
            </div>

            <div className="bg-gold/10 rounded-xl bg-stone-100 p-6 border border-gold/20">
              <h4 className="text-xl font-semibold text-agora-dark mb-3">3. Ritim Duygusu</h4>
              <ul className="text-agora-muted space-y-2">
                <li>Verilen rehber iki ritmin tekrarı istenir.</li>
                <li>Adayın ritim duygusu ölçülür.</li>
              </ul>
            </div>

            <div className="bg-olive/10 rounded-xl bg-stone-100 p-6 border border-olive/20 ">
              <h4 className="text-xl font-semibold text-agora-dark mb-3">4. Hazırlanan Eser</h4>
              <ul className="text-agora-muted space-y-2">
                <li>Adayın hazırladığı bir eseri seslendirmesi istenir.</li>
                <li>Dil, tür ve tarz serbesttir.</li>
              </ul>
            </div>

            <div className="bg-stone-100 rounded-xl p-6 border border-stone-200 md:col-span-2">
              <h4 className="text-xl font-semibold text-agora-dark mb-3">5. Ortak Eser Seslendirme</h4>
              <ul className="text-agora-muted space-y-2">
                <li>Belirlenen ortak eserin başvuru sırasında adaya iletilen uygun partisyonu istenir.</li>
                <li>Aday tarafından seslendirilmesi beklenir.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Prova Bilgileri */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="card-agora rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-agora-dark mb-6 flex items-center">
              <MapPin className="w-7 h-7 text-agora-terracotta mr-3" />
              📍 Prova ve Lokasyon Bilgileri
            </h3>
            <div className="space-y-4">
              <p className="text-agora-muted">Tüm provalar <span className="text-agora-terracotta font-semibold">Konak / İzmir</span> Türkan Saylan Kültür Merkezi'nde yapılacaktır</p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-agora-terracotta" />
                  <span className="text-agora-dark font-semibold">🗓️ Cuma 19.00 – 22.30</span>
                </div>
       
              </div>
            </div>
          </div>

          <div className="card-agora rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-agora-dark mb-6 flex items-center">
              <Euro className="w-7 h-7 text-agora-bronze mr-3" />
              💸 Başvuru ve Katılım Ücreti
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <span className="text-agora-muted">Seçmelere katılım ücretsizdir</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <span className="text-agora-muted">Koro aidat bedeli başvuru sürecinde belirlenecektir</span>
              </div>

            </div>
          </div>
        </div>

        {/* SSS */}
        <div className="card-agora rounded-2xl p-8 mb-12">
          <h3 className="text-3xl font-bold text-agora-dark mb-8 text-center">❓ Sık Sorulan Sorular</h3>
          <div className="space-y-6">
            {/* Başvuru ile ilgili sorular */}
            <div>
              <div className="text-xl font-bold text-agora-bronze mb-4">Başvuru</div>
              {[
                {q: 'Seçme randevusuna gelemeyeceksem ne yapmalıyım?', a: 'Durumu erken bildirmeniz hâlinde yeni bir gün/saat ayarlayabiliriz. Seçme dönemi sona erdiyse, bir sonraki seçme sürecini beklemeniz gerekebilir.'},
                {q: 'Seçme saatleri nasıl belirleniyor?', a: 'Katılım durumunuza göre gün ve saat belirlenerek size iletilir. Uymuyorsa lütfen en kısa sürede geri dönüş yapın.'},
                {q: 'Katkı payı ne zaman ödeniyor?', a: 'Turne kadrosu kesinleşince ödeme tarihleri ve yöntemleri paylaşılır.'},
                {q: 'Vize ve pasaport işlemleri nasıl yürütülüyor?', a: 'Pasaport başvurusu bireysel olarak yapılır. Vize işlemleri koro yönetimi tarafından yürütülür.'},
                {q: 'Vize reddi yaşanırsa ne olur?', a: 'Bu durumda maalesef festivale katılım sağlanamaz. Konsolosluk süreci dış etken olduğu için garanti verilemez.'},
                {q: 'Sahne kostümleri nasıl belirleniyor?', a: 'Kostüm detayları üyeliğiniz onaylandıktan sonra paylaşılır. Nereden temin edileceği konusunda bilgilendirme yapılır.'},
                {q: 'Fotoğraf ve videolar nasıl kullanılıyor?', a: 'Tanıtım, sosyal medya ve arşiv amaçlı kullanılabilir. Kullanım için yazılı onay alınır.'},
              ].map((item, i) => (
                <div key={i}>
                  <div className="font-semibold text-agora-dark mb-1">{item.q}</div>
                  <div className="text-agora-muted text-sm mb-4">
                    {Array.isArray(item.a) ? (
                      item.a.map((line, j) => (
                        <div key={j} className="mb-1">{line}</div>
                      ))
                    ) : (
                      item.a
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Seçme ve Prova ile ilgili sorular */}
            <div>
              <div className="text-xl font-bold text-agora-bronze mb-4 mt-8">Seçme ve Prova</div>
              {[
                {q: 'Provalar nerede ve ne zaman yapılıyor?', a: 'Her cuma 19.30–18.00 saatlerinde yapılır. Yer: Türkan Saylan Kültür Merkezi Konak/ İzmir.'},
                {q: 'Provalar hangi dilde yürütülüyor?', a: 'Provalar Türkçe yürütülür. Farklı dillerdeki eserler için özel telaffuz çalışmaları yapılır.'},
                {q: 'Her provaya katılım zorunlu mu?', a: 'Evet. Rutin ve ek çalışmalara düzenli katılım beklenir.'},
                {q: 'Ek prova ya da grup çalışmaları yapılıyor mu?', a: 'Evet, ihtiyaç durumunda ek çalışmalar yapılır. Tarih ve saatler önceden duyurulur.'},
                {q: 'Konser ve turneler hangi dönemlerde oluyor?', a: 'Genellikle hafta sonlarına ve tatil günlerine denk getirilir.'},
                {q: 'Yıl içinde takvim nasıl işler?', a: 'Prova ve konser takvimi dönem başında paylaşılır. Resmi tatillerde de çalışma olabilir.'},
              ].map((item, i) => (
                <div key={i}>
                  <div className="font-semibold text-agora-dark mb-1">{item.q}</div>
                  <div className="text-agora-muted text-sm mb-4">
                    {Array.isArray(item.a) ? (
                      item.a.map((line, j) => (
                        <div key={j} className="mb-1">{line}</div>
                      ))
                    ) : (
                      item.a
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Koro ve Korist ile ilgili sorular */}
            <div>
              <div className="text-xl font-bold text-agora-bronze mb-4 mt-8">Koro</div>
              {[
                {q: 'Agora Voice nedir?', a: 'Agora Voice, farklı korolarda deneyim kazanmış koristlerin bir araya gelerek kurduğu, müziğe tutkuyla bağlı bir vokal topluluğudur.'},
                {q: 'Ne zaman kuruldunuz?', a: 'Koromuz, ilk çalışmasını 27 Ocak 2025 tarihinde gerçekleştirmiştir.'},
                {q: 'Adınızı nereden alıyorsunuz?', a: 'İzmir’in tarihî ve kültürel simgelerinden biri olan Antik Agora’dan ilham alıyoruz.'},
                {q: 'Koro şefiniz kimdir?', a: 'Şefimiz, deneyimli müzik eğitimcisi Özlem Varışlı Atçeken’dir.'},
                {q: 'Korepetitörünüz kimdir?', a: 'Piyanist, aranjör ve şefimizin eşi Rıza Atçeken çalışmalarımıza eşlik etmektedir.'},
                {q: 'Kimlerden oluşuyorsunuz?', a: 'Koromuz, farklı meslek gruplarından gelen, daha önce çeşitli korolarda görev almış, deneyimli koristlerden oluşmaktadır.'},
                {q: 'Hangi müzik türlerini seslendiriyorsunuz?', a: 'Klasik çok sesli eserlerden çağdaş koro düzenlemelerine kadar geniş bir repertuvar çalışıyoruz.'},
                {q: 'Hedefiniz nedir?', a: 'Sanatı, sesi ve ortak tutkuyu bir araya getirerek yurt içi ve yurt dışında ülkemizi başarıyla temsil etmektir.'},
                {q: 'Çalışma koşullarınız nelerdir?', a: 'Bütün sistem birlikte söyleme üzerine kurulu olduğundan, sağlık ve çalışma mesaisi gibi zorunlu ve özel durumlar dışında çalışmalara düzenli ve tam katılım (en az %80) beklenir. Aksi durumda korist çalışmalara katılmaya devam edebilir, fakat ilk etkinlikte yer alamaz. Diğer etkinliklere katılımı ise koristin bireysel çaba ve çalışmaları doğrultusunda şefin vereceği karara bağlıdır. Bu durum online ve partisyon çalışmaları için de geçerlidir.'},
                {q: 'Koristlerin görev ve sorumlulukları nelerdir?', a: ['1- Eserle ilgili verilen ödevi yerine getirir.', '2- Uyarılar doğrultusunda gerekli düzeltmeleri yapar.', '3- Çalışmalara Partisyonunu eksiksiz öğrenerek, hazır gelir.', '4- Korunun sanatsal ve sosyal işleyişinde uygun görülen ekiplerde aktif görev alır.']},
              ].map((item, i) => (
                <div key={i}>
                  <div className="font-semibold text-agora-dark mb-1">{item.q}</div>
                  <div className="text-agora-muted text-sm mb-4">
                    {Array.isArray(item.a) ? (
                      item.a.map((line, j) => (
                        <div key={j} className="mb-1">{line}</div>
                      ))
                    ) : (
                      item.a
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Başvuru */}
        <div className="bg-gradient-to-r from-terracotta/10 to-bronze/10 rounded-2xl p-8 mb-12 border border-terracotta/20">
          <h3 className="text-3xl font-bold text-agora-dark mb-6 text-center">📬 Başvuru Nasıl Yapılır?</h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-xl font-semibold text-agora-dark mb-4">Başvuru Süreci:</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-terracotta-gradient rounded-full flex items-center justify-center text-white text-sm font-bold mt-1">1</div>
                  <p className="text-agora-muted">Başvuru formunu eksiksiz doldurun</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-terracotta-gradient rounded-full flex items-center justify-center text-white text-sm font-bold mt-1">2</div>
                  <p className="text-agora-muted">Size e-posta yoluyla ulaşılacak ve seçme randevusu verilecektir</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xl font-semibold text-agora-dark mb-4">Seçmelere geldiğinizde:</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <p className="text-agora-muted">Hafif bir şeyler yiyip gelin</p>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <p className="text-agora-muted">Şarkınızı önceden seçmiş olun</p>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <p className="text-agora-muted">15 dakika erken gelin</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Secmeler; 