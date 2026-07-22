import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function KvkkPage() {
  return (
    <div className="min-h-screen bg-marble">
      <header className="bg-white/90 backdrop-blur-md border-b border-stone-200 shadow-agora sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-agora-dark hover:text-agora-terracotta transition-colors">
            <img src="/agora.png" alt="Agora Voice Logo" className="w-10 h-10 rounded-full border-2 border-bronze-gradient" />
            <span className="font-bold font-agoravoice">Agora Voice</span>
          </a>
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-agora-muted hover:text-agora-terracotta transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Ana Sayfa
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-terracotta-gradient rounded-full mb-6">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-agora-dark mb-4">
            Kişisel Verilerin İşlenmesine İlişkin Aydınlatma Metni
          </h1>
        </div>

        <article className="card-agora rounded-2xl p-8 md:p-10 space-y-8 text-agora-muted leading-relaxed">
          <p>
            İşbu Aydınlatma Metni, Agora Voice İzmir Korosu (&quot;Koro&quot;) tarafından 6698 sayılı Kişisel
            Verilerin Korunması Kanunu (&quot;Kanun&quot;) kapsamında kişisel verilerinizin işlenmesine ilişkin
            olarak sizleri bilgilendirmek amacıyla hazırlanmıştır.
          </p>

          <section>
            <h2 className="text-xl font-bold text-agora-dark mb-3">
              a) Kişisel Verilerin Toplanma Yöntemi ve Hukuki Sebebi
            </h2>
            <p>
              Kişisel verileriniz elektronik ve fiziki ortamda çeşitli yöntemlerle toplanmaktadır. İşbu
              Aydınlatma Metni&apos;nde belirtilen hukuki sebeplerle toplanan kişisel verileriniz, Kanun&apos;un 5.
              ve 6. maddelerinde belirtilen kişisel veri işleme şartları çerçevesinde işlenebilmekte ve
              paylaşılabilmektedir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-agora-dark mb-3">b) Kişisel Verilerin İşlenme Amaçları</h2>
            <p className="mb-4">
              Kişisel verileriniz, Kanun&apos;un 5. ve 6. maddelerinde belirtilen kişisel veri işleme şartları
              çerçevesinde aşağıdaki amaçlarla işlenmektedir:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Koro tarafından sunulan ürün ve hizmetlerden sizleri faydalandırmak için gerekli çalışmaların
                ilgili birimlerce yapılması ve iş süreçlerinin yürütülmesi,
              </li>
              <li>
                Koro tarafından yürütülen faaliyetlerin gerçekleştirilmesi için ilgili iş birimleri tarafından
                gerekli çalışmaların yapılması ve buna bağlı iş süreçlerinin yürütülmesi,
              </li>
              <li>Koro&apos;nun kısa, orta ve uzun vadeli politikalarının planlanması ve icrası,</li>
              <li>
                Koro tarafından sunulan ürün ve hizmetlerin sizlerin beğeni, kullanım alışkanlıkları ve
                ihtiyaçlarına göre özelleştirilerek önerilmesi ve tanıtılması,
              </li>
              <li>
                Koro ile iş ilişkisi içerisinde olan ilgili kişilerin hukuki, teknik ve ticari/iş güvenliğinin
                temini,
              </li>
              <li>Koro faaliyetleri kapsamında seçme ve değerlendirme süreçlerinin yürütülmesi,</li>
              <li>Koro faaliyetlerine ilişkin etkinliklerin planlanması ve icrası,</li>
              <li>Başvuru sonuçlarının duyurulması ve başvuru sahipleriyle iletişim kurulması,</li>
              <li>Hukuki yükümlülüklerin yerine getirilmesi ve resmi kurumlarla paylaşılması,</li>
              <li>Koro faaliyetleriyle ilgili tanıtım ve bilgilendirme faaliyetlerinin gerçekleştirilmesi.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-agora-dark mb-3">c) Kişisel Verilerin Paylaşımı</h2>
            <p>
              Kişisel verileriniz, Kanun&apos;un 8. ve 9. maddelerinde belirtilen kişisel veri işleme şartları ve
              amaçları çerçevesinde, yukarıdaki amaçlar dahilinde Koro ile iş birliği içinde olan kişilerle,
              hukuken yetkili kamu kurum ve kuruluşları ile hukuken yetkili özel hukuk tüzel kişileriyle
              paylaşılabilecektir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-agora-dark mb-3">d) Veri Saklama Süresi</h2>
            <p>
              Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca ve yasal sürelerle sınırlı olarak
              saklanacaktır. Bu sürenin sonunda kişisel verileriniz silinecek veya anonim hale getirilecektir.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-agora-dark mb-3">e) Veri Sahiplerinin Hakları ve Kullanımı</h2>
            <p className="mb-4">
              Kanun&apos;un 11. maddesi uyarınca kişisel veri sahibi olarak aşağıdaki haklara sahipsiniz:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
              <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme,</li>
              <li>
                Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını
                öğrenme,
              </li>
              <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme,</li>
              <li>
                Kişisel verilerinizin eksik veya yanlış işlenmesi halinde bunların düzeltilmesini isteme ve bu
                kapsamda yapılan işlemin kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme,
              </li>
              <li>
                Kanun ve ilgili diğer kanun hükümlerine uygun olarak işlenmiş olmasına rağmen, işlenmesini
                gerektiren sebeplerin ortadan kalkması hâlinde kişisel verilerinizin silinmesini veya yok
                edilmesini isteme ve bu kapsamda yapılan işlemin kişisel verilerin aktarıldığı üçüncü kişilere
                bildirilmesini isteme,
              </li>
              <li>
                İşlenen verilerinizin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle
                kişinin kendisi aleyhine bir sonucun ortaya çıkmasına itiraz etme,
              </li>
              <li>
                Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğraması hâlinde zararın
                giderilmesini talep etme.
              </li>
            </ul>

            <p className="mb-4">
              Kanun&apos;un 28. maddesinin 2. fıkrası veri sahiplerinin talep hakkı bulunmayan halleri sıralamış
              olup bu kapsamda;
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>Kişisel veri işlemenin suç işlenmesinin önlenmesi veya suç soruşturması için gerekli olması,</li>
              <li>İlgili kişinin kendisi tarafından alenileştirilmiş kişisel verilerin işlenmesi,</li>
              <li>
                Kişisel veri işlemenin kanunun verdiği yetkiye dayanılarak görevli ve yetkili kamu kurum ve
                kuruluşları ile kamu kurumu niteliğindeki meslek kuruluşlarınca, denetleme veya düzenleme
                görevlerinin yürütülmesi ile disiplin soruşturma veya kovuşturması için gerekli olması,
              </li>
              <li>
                Kişisel veri işlemenin bütçe, vergi ve mali konulara ilişkin olarak Devletin ekonomik ve mali
                çıkarlarının korunması için gerekli olması,
              </li>
            </ul>
            <p className="mb-4">
              hallerinde verilere yönelik olarak yukarıda belirlenen haklar kullanılamayacaktır.
            </p>

            <p className="mb-4">
              Kanun&apos;un 28. maddesinin 1. fıkrasına göre ise aşağıdaki durumlarda veriler Kanun kapsamı
              dışında olacağından, veri sahiplerinin talepleri bu veriler bakımından da işleme alınmayacaktır:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Kişisel verilerin, üçüncü kişilere verilmemek ve veri güvenliğine ilişkin yükümlülüklere uyulmak
                kaydıyla gerçek kişiler tarafından tamamen kendisiyle veya aynı konutta yaşayan aile fertleriyle
                ilgili faaliyetler kapsamında işlenmesi,
              </li>
              <li>
                Kişisel verilerin resmi istatistik ile anonim hâle getirilmek suretiyle araştırma, planlama ve
                istatistik gibi amaçlarla işlenmesi,
              </li>
              <li>
                Kişisel verilerin millî savunmayı, millî güvenliği, kamu güvenliğini, kamu düzenini, ekonomik
                güvenliği, özel hayatın gizliliğini veya kişilik haklarını ihlal etmemek ya da suç teşkil etmemek
                kaydıyla, sanat, tarih, edebiyat veya bilimsel amaçlarla ya da ifade özgürlüğü kapsamında
                işlenmesi,
              </li>
              <li>
                Kişisel verilerin millî savunmayı, millî güvenliği, kamu güvenliğini, kamu düzenini veya
                ekonomik güvenliği sağlamaya yönelik olarak kanunla görev ve yetki verilmiş kamu kurum ve
                kuruluşları tarafından yürütülen önleyici, koruyucu ve istihbari faaliyetler kapsamında
                işlenmesi,
              </li>
              <li>
                Kişisel verilerin soruşturma, kovuşturma, yargılama veya infaz işlemlerine ilişkin olarak yargı
                makamları veya infaz mercileri tarafından işlenmesi.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-agora-dark mb-3">f) Başvuru ve İletişim Yöntemleri</h2>
            <p className="mb-4">
              Kişisel veri sahipleri yukarıdaki haklarına ilişkin taleplerini, kimliklerini doğrulayıcı belgelerle
              birlikte:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>
                Islak imzalı dilekçeyle noter aracılığıyla veya iadeli taahhütlü posta yoluyla{' '}
                <strong className="text-agora-dark">
                  Narlıdere Atatürk Kültür Merkezi, Mithat Paşa Cad. 447/A Narlıdere/İzmir
                </strong>{' '}
                adresine,
              </li>
              <li>
                Sistemimizde kayıtlı elektronik posta adresiniz üzerinden{' '}
                <a
                  href="mailto:agoravoiceschoir@gmail.com"
                  className="text-agora-terracotta underline hover:text-agora-bronze transition-colors"
                >
                  agoravoiceschoir@gmail.com
                </a>{' '}
                adresine gönderebilir.
              </li>
            </ul>
            <p className="mb-4">Kişisel Verileri Koruma Kurulu tarafından öngörülen bir yöntemi de izleyebilirsiniz.</p>
            <p className="mb-4">
              Başvurularınız Kanun&apos;da belirtilen süre içinde (en geç 30 gün) ücretsiz olarak
              değerlendirilerek cevaplandırılacaktır. İşlemin ayrıca bir maliyet gerektirmesi halinde Kişisel
              Verileri Koruma Kurulu tarafından belirlenen tarifeye göre ücret talep edilebilir.
            </p>
            <p className="mb-4">
              Agora Voice İzmir Korosu, başvuruda bulunan kişinin kimlik doğrulamasını sağlamak ve taleplerini
              netleştirmek amacıyla ek bilgiler talep edebilir, başvuruda belirtilen hususları netleştirmek
              adına, kişisel veri sahibine başvurusu ile ilgili soru yöneltebilir.
            </p>
            <p>
              Kişisel veri sahipleri adına üçüncü kişilerin başvuru talebinde bulunabilmesi için veri sahibi
              tarafından başvuruda bulunacak kişi adına noter kanalıyla düzenlenmiş özel vekâletname
              bulunmalıdır.
            </p>
          </section>
        </article>
      </main>

      <footer className="bg-agora-dark text-white py-6 mt-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-agora-muted text-sm">© 2025 Agora Voice. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}
