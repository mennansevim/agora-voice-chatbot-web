# .NET Testing & AI-Assisted Testing

## A Comprehensive Guide for Interns

---

---

### Slayt 1 — Kapak

# Software Testing in .NET

### From Zero to Confident Code

---

---

### Slayt 2 — Agenda

# Agenda

- **Why Testing Matters?**
    - Cost of bugs: development vs production
    - Real-world disaster: Knight Capital ($440M loss)
    - Test vs no test: the real cost comparison

- **Unit Test vs Integration Test**
    - Testing Pyramid (Unit → Integration → E2E)
    - When to use each, side-by-side comparison

- **Test Frameworks & Assertions**
    - xUnit, NUnit, MSTest overview
    - FluentAssertions & Shouldly

- **Mocking**
    - Moq: syntax & usage
    - NSubstitute: syntax & usage
    - Head-to-head comparison

- **Testcontainers & In-Memory DB**
    - Running real databases in Docker for tests
    - EF Core InMemory provider: when to use, when to avoid

- **AI-Assisted Testing**
    - Benefits, risks & dangers of AI-generated tests
    - Quality checklist & workflow
    - Demo: AI-generated unit test (before & after review)

- **Hands-On Examples**
    - Writing a unit test for a service method
    - Writing an integration test with WebApplicationFactory

---

**English Narrative:**
Here is our agenda for today's session. We will start by understanding why testing matters, backed by real-world cost data and a catastrophic failure story. Then we will dive into the differences between unit tests and integration tests, followed by an overview of .NET test frameworks and assertion libraries. Next, we will explore mocking with Moq and NSubstitute, and learn how to use Testcontainers and the EF Core InMemory provider for database testing. We will then discuss how AI tools can help — and hurt — your testing workflow. Finally, we will close with two hands-on examples where we write a unit test and an integration test from scratch.

**Konuşma Notları:**
İşte bugünkü oturumumuzun ajandası. Önce testin neden önemli olduğunu gerçek dünya verileri ve felaket hikayeleriyle anlayacağız. Sonra unit test ile integration test farkını, .NET test framework'lerini ve assertion kütüphanelerini inceleyeceğiz. Ardından Moq ve NSubstitute ile mocking konusuna, Testcontainers ve EF Core InMemory provider ile veritabanı testlerine bakacağız. AI ile test yazmanın avantaj ve risklerini tartışacağız. Son olarak da iki hands-on örnekle bir unit test ve bir integration test yazacağız. Yaklaşık 40 dakikalık yoğun bir oturum olacak, hazırsanız başlayalım.

---

---

## BÖLÜM 1: WHY TESTING MATTERS (5 dk)

---

---

### Slayt 3 — What Happens Without Tests?

# What Happens Without Tests?

## Real-World Disaster: Knight Capital Group (2012)

- **Company:** Knight Capital Group — one of the largest US market makers
- **What happened:** A deployment pushed old, untested code to production
- **Result:** Automated trading system executed erroneous trades for **45 minutes**
- **Financial loss:** **$440 million** in a single morning
- **Aftermath:** Company went bankrupt and was acquired
- **Root cause:** No automated tests to catch the regression; manual deployment process with no safety nets

> "If a single automated regression test had existed for that code path, the deployment would have been blocked."

---

**English Narrative:**
In August 2012, Knight Capital Group — one of the largest market makers in the United States — deployed a software update that accidentally reactivated legacy trading code. Within 45 minutes of the market opening, the system executed millions of erroneous trades, resulting in a loss of 440 million dollars. The company, which had been worth 365 million dollars the day before, was effectively bankrupt by lunchtime. The root cause was devastatingly simple: there were no automated tests covering that code path, no regression suite to catch the reactivation, and no deployment gate to prevent untested code from reaching production. This is not an edge case — this is what happens when testing is treated as optional.

**Konuşma Notları:**
Şimdi size gerçek hayattan bir felaket senaryosu anlatacağım. 2012 yılında Knight Capital Group — Amerika'nın en büyük borsa aracılarından biri — bir yazılım güncellemesi yayınladı. Bu güncelleme sırasında eski, artık kullanılmayan bir trading kodu yanlışlıkla aktif hale geldi. Borsa açıldıktan sadece 45 dakika sonra sistem milyonlarca hatalı işlem gerçekleştirdi. Sonuç: tek bir sabahta 440 milyon dolar kayıp. Bir gün önce 365 milyon dolar değerindeki şirket, öğle yemeğine kadar fiilen iflas etti. Peki bunun sebebi neydi? Çok basit: o kod için tek bir otomatik test bile yazılmamıştı. Bir regression test olsaydı, deployment sırasında bu hata yakalanacak ve production'a asla çıkmayacaktı. Bu uç bir örnek değil — testin "opsiyonel" olarak görülmesinin doğal sonucu.

---

---

### Slayt 4 — Cost of Bugs: When You Find Them Matters

# Cost of Bugs

## The Later You Find a Bug, The More Expensive It Gets

| Stage | Relative Cost | Example |
|-------|--------------|---------|
| **Development** (while coding) | **1x** | Developer catches typo in logic |
| **Code Review** | **1.5x** | Peer spots missing null check |
| **QA / Testing** | **3-5x** | Tester finds broken workflow |
| **Staging / Pre-prod** | **10x** | Performance issue discovered late |
| **Production** | **30-100x** | Customer-facing outage, data loss |

### Key Insight
- A bug caught during development costs **minutes** to fix
- The same bug in production costs **days** of investigation + hotfix + deployment + reputation damage

---

**English Narrative:**
The cost of fixing a bug rises exponentially the later it is discovered. Industry research consistently shows that a defect caught during development costs a fraction of what the same defect costs in production. During coding, a developer might spend five minutes fixing a logic error. If that same error reaches production, it can trigger an outage, require emergency investigation by multiple engineers, necessitate a hotfix deployment, and cause reputational damage with customers. Studies from IBM and the National Institute of Standards and Technology place the production-to-development cost ratio anywhere from 30x to 100x. The takeaway is clear: investing time in tests during development is not a luxury — it is the cheapest form of quality assurance you will ever get.

**Konuşma Notları:**
Bir hata ne kadar geç bulunursa, düzeltme maliyeti o kadar katlanarak artar. Geliştirme sırasında bir hatayı düzeltmek belki 5 dakikanızı alır — bir typo, bir yanlış koşul. Ama aynı hata production'a çıktığında neler olur? Önce müşteri şikayet eder, sonra birden fazla mühendis acil durum toplantısına çekilir, sorun araştırılır, hotfix yazılır, test edilir, deploy edilir, müşteriye açıklama yapılır. Bu süreçte harcanan zaman ve para, orijinal hatanın 30 ila 100 katı olabilir. IBM ve NIST araştırmaları bunu defalarca kanıtlamıştır. Yani test yazmak aslında ekstra maliyet değil — aksine, yapabileceğiniz en ucuz kalite güvence yatırımıdır. Bunu aklınızda tutun çünkü sık sık "test yazmaya vaktimiz yok" cümlesini duyacaksınız. Aslında test yazmamaya vaktiniz yok.

---

---

### Slayt 5 — Test vs No Test: Cost Comparison

# Writing Tests vs Skipping Tests

## The Real Cost Comparison

### With Tests ✅
- Development time increases by **15-25%**
- Bugs caught **before** they reach production
- Refactoring is **safe** — tests act as a safety net
- New team members can understand expected behavior from tests
- CI/CD pipeline catches regressions **automatically**
- Long-term maintenance cost: **LOW**

### Without Tests ❌
- Development is faster **initially** (short-term gain)
- Every change carries risk of **breaking existing features**
- Debugging time increases as codebase grows
- Fear of refactoring → **technical debt** accumulates
- Manual testing is **slow, inconsistent, non-repeatable**
- Long-term maintenance cost: **HIGH and unpredictable**

### Bottom Line
> Short-term: Tests cost ~20% more dev time
> Long-term: Tests **save 4-10x** in maintenance and bug-fixing costs

---

**English Narrative:**
Let us compare the two paths honestly. Writing tests does increase your initial development time — typically by 15 to 25 percent. That is a real cost and we should not pretend otherwise. However, that upfront investment pays dividends almost immediately. With tests in place, your CI/CD pipeline automatically catches regressions before they reach users. Refactoring becomes safe because your tests tell you instantly if you have broken something. New team members can read tests to understand expected behavior without digging through implementation details. Without tests, you get faster initial delivery, but every subsequent change becomes a gamble. Developers become afraid to refactor, technical debt accumulates, and manual testing — which is slow, inconsistent, and non-repeatable — becomes your only safety net. The data is clear: teams that invest in testing spend 4 to 10 times less on maintenance and bug-fixing over the lifetime of a project.

**Konuşma Notları:**
Şimdi dürüst bir karşılaştırma yapalım. Test yazmak geliştirme sürenizi yüzde 15 ila 25 artırır — bu gerçek bir maliyet ve bunu görmezden gelmemiz doğru olmaz. Ama bu yatırımın getirisi neredeyse hemen başlar. Testleriniz olduğunda CI/CD pipeline'ınız her push'ta otomatik olarak regression'ları yakalar. Refactoring güvenli hale gelir çünkü testler bir şeyi kırıp kırmadığınızı anında söyler. Yeni ekip arkadaşlarınız testleri okuyarak beklenen davranışı anlayabilir. Peki test yazmazsanız ne olur? İlk başta daha hızlı ilerlersiniz, evet. Ama her sonraki değişiklik bir kumar haline gelir. Geliştiriciler refactoring yapmaktan korkmaya başlar, technical debt birikir, ve tek güvenceniz yavaş, tutarsız ve tekrarlanamayan manuel test olur. Araştırmalar gösteriyor ki test yazan ekipler, projenin ömrü boyunca bakım ve hata düzeltme maliyetlerinde 4 ila 10 kat daha az harcıyor.

---

---

## BÖLÜM 2: UNIT TEST vs INTEGRATION TEST (5 dk)

---

---

### Slayt 6 — The Testing Pyramid

# The Testing Pyramid

```
        /‾‾‾‾‾‾‾\
       /  E2E /   \        ← Few, slow, expensive
      /  UI Tests  \
     /‾‾‾‾‾‾‾‾‾‾‾‾‾\
    / Integration    \      ← Moderate count, medium speed
   /   Tests          \
  /‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
 /     Unit Tests        \  ← Many, fast, cheap
/‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\
```

- **Unit Tests (base):** 70-80% of all tests — fast, isolated, test single units of logic
- **Integration Tests (middle):** 15-25% — test interactions between components
- **E2E Tests (top):** 5-10% — test full user workflows, slowest and most brittle

### The Rule
> Write **many** unit tests, **some** integration tests, and **few** E2E tests.

---

**English Narrative:**
The testing pyramid is a widely adopted model that guides how you should distribute your testing effort. At the base, you have unit tests — they should make up 70 to 80 percent of your test suite. They are fast, isolated, and cheap to write and maintain. In the middle layer sit integration tests, which verify that different components work together correctly. These are slower and more complex but catch issues that unit tests cannot. At the very top are end-to-end tests that simulate real user workflows through the entire application. These are the slowest, most expensive, and most brittle. The key principle is simple: rely heavily on fast unit tests for logic verification, use integration tests to validate component interactions, and reserve E2E tests for critical user journeys only.

**Konuşma Notları:**
Testing pyramid — yani test piramidi — test stratejinizi nasıl planlamanız gerektiğini gösteren bir model. Piramidin tabanında unit testler var — toplam testlerinizin yüzde 70-80'ini bunlar oluşturmalı. Çünkü en hızlı çalışan, en ucuz yazılan ve en kolay bakım yapılan testler bunlar. Ortada integration testler var — farklı bileşenlerin birlikte doğru çalışıp çalışmadığını kontrol ederler. Bunlar biraz daha yavaş ve karmaşıktır ama unit testlerin yakalayamadığı sorunları bulurlar. Piramidin tepesinde de end-to-end testler var — gerçek kullanıcı akışlarını baştan sona simüle ederler. Bunlar en yavaş, en pahalı ve en kırılgan olanlardır. Temel kural şu: çok sayıda unit test, makul sayıda integration test, az sayıda E2E test.

---

---

### Slayt 7 — Unit Tests

# Unit Tests

## Testing a Single Unit of Logic in Isolation

### Characteristics
- Tests **one method or function** at a time
- **No external dependencies** (database, file system, network)
- Dependencies are replaced with **mocks/stubs**
- Executes in **milliseconds**
- Can run **hundreds per second**

### What to Unit Test
- Business logic and calculations
- Validation rules
- Data transformations
- Conditional branching (if/else paths)
- Edge cases (null, empty, boundary values)

### Example Scenario
> Testing that `CalculateDiscount(totalAmount, customerType)` returns the correct discount percentage for a VIP customer.

---

**English Narrative:**
A unit test verifies a single, isolated piece of logic — typically one method or function. The key characteristic of a unit test is isolation: it does not depend on databases, file systems, APIs, or any external service. Instead, all dependencies are replaced with mocks or stubs so that the test focuses purely on the logic under test. Because of this isolation, unit tests execute extremely fast — usually in milliseconds — and you can run hundreds of them per second. You should write unit tests for business logic, validation rules, data transformations, conditional branches, and edge cases. Think of a unit test as asking: "Given this specific input, does this specific method produce the correct output?" If the answer depends on a database query or an API call, you are crossing into integration test territory.

**Konuşma Notları:**
Unit test, tek bir metodu veya fonksiyonu izole bir şekilde test etmektir. İzolasyon buradaki anahtar kelime — yani test ettiğiniz kod parçası dışında hiçbir şeye bağımlılık yok. Veritabanı yok, dosya sistemi yok, network çağrısı yok. Peki bağımlılıklar varsa ne olacak? Onları mock veya stub ile taklit ediyorsunuz. Bu sayede testleriniz milisaniyeler içinde çalışır, saniyede yüzlerce test koşturabilirsiniz. Unit test yazmanız gereken yerler: iş mantığı hesaplamaları, validasyon kuralları, veri dönüşümleri, if-else dallanmaları ve edge case'ler — yani null, boş string, sınır değerler gibi durumlar. Bir unit test aslında şu soruyu sorar: "Bu belirli input'u verdiğimde, bu metot doğru output'u üretiyor mu?" Eğer cevap bir veritabanı sorgusuna veya API çağrısına bağlıysa, artık integration test alanına geçiyorsunuz demektir.

---

---

### Slayt 8 — Integration Tests

# Integration Tests

## Testing How Components Work Together

### Characteristics
- Tests **interactions between multiple components**
- Uses **real dependencies** (database, HTTP client, message queue)
- Slower than unit tests (seconds, not milliseconds)
- Requires **setup and teardown** of external resources
- Catches issues that unit tests **cannot detect**

### What to Integration Test
- Database queries (EF Core + real/in-memory DB)
- API endpoints (HTTP request → response cycle)
- Service-to-service communication
- Authentication & authorization flows
- Message queue publishing and consuming

### Example Scenario
> Testing that `POST /api/orders` correctly saves an order to the database and returns a 201 response with the created order ID.

---

**English Narrative:**
Integration tests verify that multiple components work together correctly. Unlike unit tests, integration tests use real or near-real dependencies: an actual database, an HTTP client making real requests, or a message broker processing real messages. This means they are inherently slower — taking seconds rather than milliseconds — and require setup and teardown of external resources. However, they catch an entire class of bugs that unit tests simply cannot detect: incorrect SQL queries, serialization mismatches, misconfigured dependency injection, authentication failures, and more. In the .NET ecosystem, integration tests typically use WebApplicationFactory to spin up the application in-memory and make real HTTP requests against it. The key is balance: you don't need to integration-test every code path, just the critical interactions between your components.

**Konuşma Notları:**
Integration test ise birden fazla bileşenin birlikte doğru çalışıp çalışmadığını kontrol eder. Unit test'ten farklı olarak burada gerçek veya gerçeğe yakın bağımlılıklar kullanılır — gerçek bir veritabanı, gerçek HTTP istekleri, gerçek bir mesaj kuyruğu. Bu yüzden doğal olarak daha yavaştırlar — milisaniyeler değil saniyeler sürerler — ve test öncesi kaynak hazırlama, test sonrası temizleme işlemleri gerekir. Ama çok önemli bir avantajları var: unit testlerin asla yakalayamayacağı hataları bulurlar. Yanlış SQL sorguları, serialization uyumsuzlukları, dependency injection yapılandırma hataları, authentication sorunları... .NET'te integration testleri genellikle WebApplicationFactory kullanarak uygulamayı in-memory olarak ayağa kaldırır ve gerçek HTTP istekleri gönderirsiniz. Önemli olan denge: her kod yolunu integration test ile test etmenize gerek yok, sadece bileşenler arası kritik etkileşimleri test edin.

---

---

### Slayt 9 — Unit vs Integration: Side-by-Side Comparison

# Unit Test vs Integration Test

## Side-by-Side Comparison

| Aspect | Unit Test | Integration Test |
|--------|-----------|-----------------|
| **Scope** | Single method/class | Multiple components |
| **Dependencies** | Mocked/stubbed | Real or containerized |
| **Speed** | Milliseconds | Seconds |
| **Isolation** | Fully isolated | Partial isolation |
| **Setup complexity** | Minimal | Moderate to high |
| **What it catches** | Logic errors | Wiring & configuration errors |
| **Flakiness** | Very low | Can be higher |
| **Run frequency** | Every save / every commit | Every commit / every PR |
| **Count in suite** | Many (hundreds) | Fewer (tens) |

### When to Use Which?
- **Unit Test →** Pure logic, calculations, transformations, validation
- **Integration Test →** DB queries, API endpoints, auth flows, external services

---

**English Narrative:**
This table summarizes the key differences. Unit tests are fast, isolated, and focus on logic — you should have many of them. Integration tests are slower, use real dependencies, and focus on component interactions — you need fewer but they cover gaps that unit tests leave open. The two are not competing strategies; they are complementary layers. A healthy test suite has both. As a rule of thumb: if you are testing "does this calculation produce the right number," write a unit test. If you are testing "does this API endpoint save data to the database and return the correct response," write an integration test. Neither replaces the other.

**Konuşma Notları:**
Bu tablo ikisi arasındaki temel farkları özetliyor. Unit testler hızlı, izole ve mantığa odaklıdır — bunlardan çok sayıda olmalı. Integration testler daha yavaş, gerçek bağımlılıklar kullanır ve bileşen etkileşimlerine odaklanır — daha az sayıda ama unit testlerin bıraktığı boşlukları kapatırlar. Bu iki yaklaşım birbirine rakip değil, birbirini tamamlayan katmanlardır. Sağlıklı bir test suite'inde ikisi de bulunur. Pratik bir kural: "Bu hesaplama doğru sonucu üretiyor mu?" diye soruyorsanız unit test yazın. "Bu API endpoint veritabanına doğru kaydediyor mu ve doğru response dönüyor mu?" diye soruyorsanız integration test yazın. Biri diğerinin yerini tutmaz.

---

---

## BÖLÜM 3: .NET TEST FRAMEWORKS (4 dk)

---

---

### Slayt 10 — xUnit: The Modern Standard

# xUnit

## The Default Test Framework for Modern .NET

### Why xUnit?
- Created by the original author of NUnit (v2)
- **Default choice** for ASP.NET Core and .NET libraries
- Used by the .NET team itself for testing the framework
- Clean, modern design with minimal boilerplate

### Key Concepts
```csharp
public class CalculatorTests
{
    [Fact]
    public void Add_TwoNumbers_ReturnsSum()
    {
        var calculator = new Calculator();
        var result = calculator.Add(2, 3);
        Assert.Equal(5, result);
    }

    [Theory]
    [InlineData(1, 1, 2)]
    [InlineData(0, 0, 0)]
    [InlineData(-1, 1, 0)]
    public void Add_WithVariousInputs_ReturnsCorrectSum(
        int a, int b, int expected)
    {
        var calculator = new Calculator();
        Assert.Equal(expected, calculator.Add(a, b));
    }
}
```

- `[Fact]` — A test with no parameters (single test case)
- `[Theory]` + `[InlineData]` — Data-driven test (multiple test cases)
- Constructor = setup, `IDisposable` = teardown (no `[SetUp]`/`[TearDown]`)

---

**English Narrative:**
xUnit is the modern standard for testing in the .NET ecosystem. It was created by Jim Newkirk, the original author of NUnit version 2, specifically to address design issues in earlier frameworks. Today, it is the default test framework for ASP.NET Core projects and is used by the .NET team themselves to test the framework. xUnit uses two main attributes: Fact for single test cases and Theory combined with InlineData for data-driven tests that run the same logic with different inputs. One distinctive design choice in xUnit is that it uses the class constructor for setup and IDisposable for teardown, rather than dedicated setup and teardown attributes. This encourages a cleaner, more natural C-sharp coding style.

**Konuşma Notları:**
xUnit, .NET ekosisteminde modern standart haline gelmiş test framework'üdür. NUnit'in ikinci versiyonunun yazarı Jim Newkirk tarafından, eski framework'lerdeki tasarım sorunlarını çözmek için oluşturulmuştur. Bugün ASP.NET Core projelerinde varsayılan test framework'üdür ve .NET ekibi de kendi framework'ünü test etmek için xUnit kullanır. İki temel attribute var: Fact — parametre almayan tek bir test case için kullanılır. Theory ise InlineData ile birlikte kullanılır — aynı mantığı farklı girdilerle çalıştıran, veri odaklı testler için. xUnit'in ayırt edici bir tasarım tercihi var: setup için class constructor, teardown için IDisposable kullanır. NUnit'teki SetUp ve TearDown attribute'ları yerine C#'ın doğal yapılarını kullanır. Bu daha temiz ve doğal bir kod stili sağlar.

---

---

### Slayt 11 — NUnit & MSTest

# NUnit & MSTest

## Alternative .NET Test Frameworks

### NUnit
```csharp
[TestFixture]
public class CalculatorTests
{
    [SetUp]
    public void Setup() { /* runs before each test */ }

    [Test]
    public void Add_TwoNumbers_ReturnsSum()
    {
        Assert.That(calculator.Add(2, 3), Is.EqualTo(5));
    }

    [TestCase(1, 1, 2)]
    [TestCase(-1, 1, 0)]
    public void Add_Various(int a, int b, int expected)
    {
        Assert.That(calculator.Add(a, b), Is.EqualTo(expected));
    }
}
```
- Mature, feature-rich, fluent constraint model (`Assert.That`)
- `[SetUp]` / `[TearDown]` for lifecycle management

### MSTest
```csharp
[TestClass]
public class CalculatorTests
{
    [TestMethod]
    public void Add_TwoNumbers_ReturnsSum()
    {
        Assert.AreEqual(5, calculator.Add(2, 3));
    }
}
```
- Microsoft's built-in framework, ships with Visual Studio
- `[TestClass]`, `[TestMethod]`, `[DataRow]`
- Good for teams already in the Microsoft ecosystem

### Quick Comparison
| Feature | xUnit | NUnit | MSTest |
|---------|-------|-------|--------|
| Modern .NET standard | ✅ | ✅ | ✅ |
| Data-driven tests | `[Theory]` | `[TestCase]` | `[DataRow]` |
| Setup/Teardown | Constructor | `[SetUp]` | `[TestInitialize]` |
| Community adoption | Highest | High | Moderate |

---

**English Narrative:**
Beyond xUnit, two other frameworks are widely used in the .NET ecosystem. NUnit is a mature, feature-rich framework with a fluent constraint-based assertion model — you write assertions like Assert.That result Is.EqualTo expected, which reads almost like English. It uses explicit SetUp and TearDown attributes for lifecycle management. MSTest is Microsoft's own built-in framework that ships with Visual Studio. It uses TestClass and TestMethod attributes and is a solid choice for teams deeply embedded in the Microsoft ecosystem. All three frameworks are fully supported on modern .NET, so the choice often comes down to team preference. For new projects, xUnit is the most common recommendation, but if your team already uses NUnit or MSTest, there is no urgent reason to switch.

**Konuşma Notları:**
xUnit dışında iki framework daha yaygın olarak kullanılıyor. NUnit — olgun, zengin özelliklere sahip bir framework. Özellikle fluent constraint modeli dikkat çekici: Assert.That result, Is.EqualTo expected şeklinde neredeyse İngilizce gibi okunan assertion'lar yazarsınız. SetUp ve TearDown attribute'ları ile yaşam döngüsü yönetimi yapar. MSTest ise Microsoft'un kendi framework'ü, Visual Studio ile birlikte gelir. TestClass ve TestMethod attribute'larını kullanır. Microsoft ekosisteminde çalışan ekipler için doğal bir tercih. Üç framework de modern .NET üzerinde tam destekleniyor, yani hangisini seçeceğiniz genellikle ekip tercihine bağlı. Yeni projelerde xUnit en çok önerilen seçenek, ama ekibiniz zaten NUnit veya MSTest kullanıyorsa, değiştirmek için acil bir neden yok.

---

---

### Slayt 12 — Assertion Libraries: FluentAssertions & Shouldly

# Assertion Libraries

## Making Tests More Readable

### FluentAssertions
```csharp
// Instead of:
Assert.Equal(5, result);
Assert.True(list.Count > 0);
Assert.Contains("error", message);

// Write:
result.Should().Be(5);
list.Should().NotBeEmpty();
message.Should().Contain("error");

// Complex assertions:
order.Should().NotBeNull();
order.Status.Should().Be(OrderStatus.Completed);
order.Items.Should().HaveCount(3)
           .And.OnlyContain(i => i.Price > 0);
```

### Shouldly
```csharp
result.ShouldBe(5);
list.ShouldNotBeEmpty();
message.ShouldContain("error");
```

### Why Use Them?
- **Readable:** Tests read like English sentences
- **Better error messages:** `Expected 5 but got 3` vs `Assert.Equal failed`
- **Discoverable:** IntelliSense guides you through available assertions
- Works with **any** test framework (xUnit, NUnit, MSTest)

---

**English Narrative:**
While every test framework comes with built-in assertions, dedicated assertion libraries like FluentAssertions and Shouldly make your tests significantly more readable and produce better error messages. With FluentAssertions, instead of writing Assert.Equal 5 result, you write result.Should().Be(5) — which reads naturally and, when it fails, gives you a clear message like "Expected result to be 5 but found 3." Shouldly offers a similar experience with a slightly different syntax. Both libraries work with any test framework and are installed as simple NuGet packages. The improved readability is not just cosmetic — when a test fails six months from now, a clear assertion message helps you understand the failure instantly without re-reading the test code.

**Konuşma Notları:**
Her test framework'ünün kendi assertion mekanizması var, ama FluentAssertions ve Shouldly gibi özel assertion kütüphaneleri testlerinizi çok daha okunabilir hale getirir ve daha iyi hata mesajları üretir. FluentAssertions ile Assert.Equal(5, result) yerine result.Should().Be(5) yazarsınız — bu neredeyse İngilizce gibi okunur. Ve test başarısız olduğunda "Expected result to be 5 but found 3" gibi net bir mesaj alırsınız, "Assert.Equal failed" gibi belirsiz bir mesaj yerine. Shouldly de benzer bir deneyim sunar, biraz farklı syntax ile. Her iki kütüphane de herhangi bir test framework'üyle çalışır — xUnit, NUnit veya MSTest fark etmez. NuGet'ten bir paket ekleyerek kullanmaya başlarsınız. Bu okunabilirlik sadece estetik değil — altı ay sonra bir test patladığında, net assertion mesajları sorunun ne olduğunu anında anlamanızı sağlar.

---

---

## BÖLÜM 4: MOCKING (6 dk)

---

---

### Slayt 13 — What Is Mocking and Why Do We Need It?

# Mocking

## Replacing Real Dependencies with Controlled Substitutes

### The Problem
```
OrderService depends on:
  → IOrderRepository (database)
  → IPaymentGateway (external API)
  → IEmailService (SMTP server)
```
You want to test `OrderService.PlaceOrder()` logic **without**:
- A running database
- A payment provider account
- An email server

### The Solution: Mocks
- **Mock** = A fake object that mimics a real dependency
- You control what it **returns**
- You verify what was **called**
- The real dependency is **never touched**

### Types of Test Doubles
| Type | Purpose |
|------|---------|
| **Stub** | Returns pre-configured data |
| **Mock** | Verifies interactions (was method X called?) |
| **Fake** | Working implementation (e.g., in-memory DB) |
| **Spy** | Records calls for later inspection |

---

**English Narrative:**
Mocking is the technique of replacing real dependencies with controlled substitutes during testing. Consider a typical service: OrderService depends on a repository for database access, a payment gateway for processing payments, and an email service for sending notifications. If you want to unit-test the PlaceOrder method, you do not want to spin up a database, connect to a payment provider, or set up an SMTP server. Instead, you create mock objects that mimic these dependencies. You tell the mock repository to return a specific order when called, you tell the mock payment gateway to return success, and you verify that the email service was called with the correct parameters. This lets you test the business logic of PlaceOrder in complete isolation. There are several types of test doubles — stubs return pre-configured data, mocks verify interactions, fakes are simplified working implementations, and spies record calls for later inspection.

**Konuşma Notları:**
Mocking, test sırasında gerçek bağımlılıkları kontrollü taklitlerle değiştirme tekniğidir. Tipik bir servisi düşünün: OrderService veritabanı erişimi için bir repository'ye, ödeme işlemleri için bir payment gateway'e, bildirim göndermek için bir email servisine bağımlıdır. PlaceOrder metodunu test etmek istediğinizde veritabanı kurmak, ödeme sağlayıcıya bağlanmak veya SMTP sunucu ayarlamak istemezsiniz. Bunun yerine bu bağımlılıkları taklit eden mock nesneler oluşturursunuz. Mock repository'ye "şu sipariş sorulunca bu veriyi dön" dersiniz, mock payment gateway'e "başarılı sonuç dön" dersiniz, ve email service'in doğru parametrelerle çağrılıp çağrılmadığını doğrularsınız. Böylece PlaceOrder'ın iş mantığını tamamen izole bir şekilde test edersiniz. Farklı test double türleri var — stub önceden ayarlanmış veri döner, mock etkileşimleri doğrular, fake basitleştirilmiş çalışan bir implementasyondur, spy ise çağrıları kaydeder.

---

---

### Slayt 14 — Moq: The Most Popular .NET Mocking Library

# Moq

## Syntax and Usage

### Basic Setup and Verification
```csharp
// Arrange: Create mock and configure behavior
var mockRepo = new Mock<IOrderRepository>();
mockRepo.Setup(r => r.GetByIdAsync(42))
        .ReturnsAsync(new Order { Id = 42, Total = 100m });

var mockPayment = new Mock<IPaymentGateway>();
mockPayment.Setup(p => p.ChargeAsync(It.IsAny<decimal>()))
           .ReturnsAsync(PaymentResult.Success);

// Create service with mock dependencies
var service = new OrderService(mockRepo.Object, mockPayment.Object);

// Act
var result = await service.ProcessOrderAsync(42);

// Assert
result.Should().BeTrue();
mockPayment.Verify(
    p => p.ChargeAsync(100m),
    Times.Once);
```

### Key Moq Features
- `Setup()` — Define what a method returns
- `ReturnsAsync()` — For async methods
- `It.IsAny<T>()` — Match any argument
- `It.Is<T>(predicate)` — Match with condition
- `Verify()` — Assert a method was called
- `Times.Once`, `Times.Never`, `Times.Exactly(n)`

---

**English Narrative:**
Moq is the most popular mocking library in the .NET ecosystem. It uses a fluent, lambda-based syntax to set up mock behavior and verify interactions. You create a mock with new Mock of your interface, then use Setup to define what methods should return when called. For async methods, you use ReturnsAsync. The It class provides argument matchers: It.IsAny matches any value, while It.Is with a predicate lets you match specific conditions. After executing your code, you use Verify to assert that specific methods were called with the expected arguments and the expected number of times. Moq strikes a good balance between power and simplicity, making it an excellent default choice for most .NET projects.

**Konuşma Notları:**
Moq, .NET ekosistemindeki en popüler mocking kütüphanesidir. Lambda tabanlı akıcı bir syntax kullanır. Mock oluşturmak için new Mock<IInterface>() dersiniz, sonra Setup ile metotların çağrıldığında ne döneceğini tanımlarsınız. Async metotlar için ReturnsAsync kullanırsınız. It sınıfı argüman eşleştirme sağlar — It.IsAny herhangi bir değeri eşleştirir, It.Is ile koşullu eşleştirme yapabilirsiniz. Kodunuzu çalıştırdıktan sonra Verify ile belirli metotların beklenen argümanlarla ve beklenen sayıda çağrılıp çağrılmadığını doğrularsınız. Buradaki örnekte bir OrderService'i test ediyoruz: repository mock'u 42 numaralı siparişi dönüyor, payment mock'u başarılı sonuç dönüyor, ve sonra ChargeAsync'in doğru tutarla bir kez çağrıldığını doğruluyoruz. Moq güç ve basitlik arasında iyi bir denge kurar.

---

---

### Slayt 15 — NSubstitute: The Clean Alternative

# NSubstitute

## A More Natural Syntax

### Same Scenario with NSubstitute
```csharp
// Arrange: Create substitute and configure
var repo = Substitute.For<IOrderRepository>();
repo.GetByIdAsync(42)
    .Returns(new Order { Id = 42, Total = 100m });

var payment = Substitute.For<IPaymentGateway>();
payment.ChargeAsync(Arg.Any<decimal>())
       .Returns(PaymentResult.Success);

// Create service with substitutes
var service = new OrderService(repo, payment);

// Act
var result = await service.ProcessOrderAsync(42);

// Assert
result.Should().BeTrue();
await payment.Received(1).ChargeAsync(100m);
```

### Key NSubstitute Features
- `Substitute.For<T>()` — Create a substitute (no `.Object` needed)
- `.Returns()` — Define return value
- `Arg.Any<T>()` — Match any argument
- `Arg.Is<T>(predicate)` — Match with condition
- `.Received(n)` — Verify call count
- `.DidNotReceive()` — Verify method was NOT called

### NSubstitute Advantage
> No `.Object` property — the substitute **is** the object. Cleaner, more natural syntax.

---

**English Narrative:**
NSubstitute is an alternative mocking library that prioritizes clean, natural syntax. The most noticeable difference from Moq is that NSubstitute does not require you to access a dot-Object property — the substitute itself is the object you pass to your code. You create substitutes with Substitute.For, configure return values with dot-Returns, and verify calls using dot-Received. The argument matching uses the Arg class instead of Moq's It class, but the concepts are identical. Many developers prefer NSubstitute because the resulting test code looks closer to regular C-sharp code with less ceremony. The choice between Moq and NSubstitute is largely a matter of team preference — both are well-maintained, widely used, and fully capable.

**Konuşma Notları:**
NSubstitute, temiz ve doğal syntax'a öncelik veren alternatif bir mocking kütüphanesidir. Moq'dan en belirgin farkı şu: Moq'da mock.Object diye bir property'ye erişmeniz gerekir, NSubstitute'da ise substitute'un kendisi doğrudan nesnedir — ekstra .Object çağrısı yok. Substitute.For ile substitute oluşturur, .Returns ile dönüş değerlerini ayarlar, .Received ile çağrıları doğrularsınız. Argüman eşleştirme Moq'daki It yerine Arg sınıfıyla yapılır ama kavramlar aynıdır. Bir çok geliştirici NSubstitute'u tercih eder çünkü test kodu normal C# koduna daha yakın görünür, daha az "tören" içerir. Moq ve NSubstitute arasındaki seçim büyük ölçüde ekip tercihi meselesidir — ikisi de iyi bakılıyor, yaygın kullanılıyor ve tam kapasiteli.

---

---

### Slayt 16 — Moq vs NSubstitute

# Moq vs NSubstitute

## Head-to-Head Comparison

| Feature | Moq | NSubstitute |
|---------|-----|-------------|
| **Create mock** | `new Mock<T>()` | `Substitute.For<T>()` |
| **Access object** | `mock.Object` | Directly (no `.Object`) |
| **Setup return** | `.Setup().Returns()` | `.Returns()` directly |
| **Async returns** | `.ReturnsAsync()` | `.Returns()` (same) |
| **Match any arg** | `It.IsAny<T>()` | `Arg.Any<T>()` |
| **Verify call** | `.Verify(expr, Times.Once)` | `.Received(1).Method()` |
| **Verify no call** | `.Verify(expr, Times.Never)` | `.DidNotReceive().Method()` |
| **Learning curve** | Moderate | Low |
| **Community** | Largest | Growing |
| **Strict mode** | `MockBehavior.Strict` | `Substitute.For<T>()` (lenient default) |

### Recommendation
- **New projects:** Either works — pick one and stay consistent
- **Simpler syntax preference:** NSubstitute
- **Largest ecosystem / examples:** Moq
- **Team standard:** Follow whatever your team already uses

---

**English Narrative:**
This side-by-side comparison shows that Moq and NSubstitute offer the same capabilities with different syntax. Moq has the largest community and the most examples online, while NSubstitute offers a slightly simpler syntax that many developers find more intuitive. Both support async methods, argument matching, call verification, and strict or lenient behavior modes. For new projects, either choice is valid — the important thing is to pick one and stay consistent across the codebase. If your team already uses one of them, follow the team standard. If you are starting fresh and prefer fewer lines of code, NSubstitute has a slight edge in readability. If you want the most community resources and examples to learn from, Moq has the larger ecosystem.

**Konuşma Notları:**
Bu karşılaştırma tablosu gösteriyor ki Moq ve NSubstitute aynı yetenekleri farklı syntax'larla sunuyor. Moq'un en büyük topluluğu ve en fazla online örneği var. NSubstitute ise daha basit bir syntax sunuyor, birçok geliştirici daha sezgisel buluyor. İkisi de async metotları, argüman eşleştirmeyi, çağrı doğrulamayı destekliyor. Yeni projeler için ikisi de geçerli — önemli olan birini seçip kod tabanı boyunca tutarlı kalmak. Ekibiniz zaten birini kullanıyorsa, ekip standardını takip edin. Sıfırdan başlıyorsanız ve daha az satır kod tercih ediyorsanız NSubstitute biraz daha avantajlı. En fazla topluluk kaynağı ve öğrenme materyali istiyorsanız Moq'un ekosistemi daha geniş. Hangisini seçerseniz seçin, her ikisi de işinizi görecektir.

---

---

## BÖLÜM 5: TEST CONTAINERS (4 dk)

---

---

### Slayt 17 — What Are Testcontainers?

# Testcontainers

## Real Dependencies in Disposable Docker Containers

### The Problem
- In-memory fakes don't behave exactly like real databases
- Shared test databases cause test pollution
- Setting up local infrastructure is time-consuming

### The Solution
- **Testcontainers** spins up real services in Docker containers for your tests
- Each test run gets a **fresh, isolated** instance
- Container is **automatically destroyed** after tests complete

### Supported Services
- **Databases:** PostgreSQL, SQL Server, MySQL, MongoDB
- **Message brokers:** RabbitMQ, Kafka
- **Caches:** Redis
- **Custom images:** Any Docker image

### How It Works
```
Test starts → Docker container starts → Test runs → Container destroyed
```
- No manual setup required
- Works on any machine with Docker installed
- Consistent behavior across dev machines and CI/CD

---

**English Narrative:**
Testcontainers is a library that lets you spin up real services inside disposable Docker containers during your test runs. The problem it solves is significant: in-memory fakes and stubs do not always behave exactly like real databases — they miss SQL-specific behaviors, constraints, and query optimizations. Shared test databases cause test pollution where one test's data affects another. And setting up local infrastructure manually is tedious and error-prone. Testcontainers eliminates all of these issues. When your test starts, it automatically spins up a fresh Docker container with the exact service you need — a PostgreSQL database, a Redis cache, a RabbitMQ broker — whatever your application depends on. Each test run gets a completely isolated instance. When the test completes, the container is automatically destroyed. This works on any machine with Docker installed, giving you consistent behavior across developer machines and CI/CD pipelines.

**Konuşma Notları:**
Testcontainers, test çalıştırırken gerçek servisleri Docker container'larında ayağa kaldırmanızı sağlayan bir kütüphanedir. Çözdüğü sorun önemli: in-memory taklitler her zaman gerçek veritabanları gibi davranmaz — SQL'e özgü davranışları, constraint'leri ve sorgu optimizasyonlarını kaçırırlar. Paylaşılan test veritabanları ise test kirliliğine neden olur — bir testin verisi diğerini etkiler. Yerel altyapıyı manuel kurmak da zahmetli ve hataya açık. Testcontainers tüm bunları ortadan kaldırır. Testiniz başladığında otomatik olarak ihtiyacınız olan servisin taze bir Docker container'ını ayağa kaldırır — PostgreSQL, Redis, RabbitMQ, ne gerekiyorsa. Her test çalışması tamamen izole bir instance alır. Test bittiğinde container otomatik yok edilir. Docker kurulu herhangi bir makinede çalışır, geliştirici makinelerinde ve CI/CD pipeline'larında tutarlı davranış sağlar.

---

---

### Slayt 18 — Testcontainers in .NET

# Testcontainers for .NET

## Setup and Usage

### Installation
```bash
dotnet add package Testcontainers
dotnet add package Testcontainers.PostgreSql  # or .MsSql, .MySql, etc.
```

### Basic Usage with PostgreSQL
```csharp
public class OrderRepositoryTests : IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder()
        .WithImage("postgres:16-alpine")
        .WithDatabase("testdb")
        .WithUsername("test")
        .WithPassword("test")
        .Build();

    public async Task InitializeAsync()
    {
        await _postgres.StartAsync();

        // Apply EF Core migrations
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(_postgres.GetConnectionString())
            .Options;

        using var context = new AppDbContext(options);
        await context.Database.MigrateAsync();
    }

    public async Task DisposeAsync() => await _postgres.DisposeAsync();

    [Fact]
    public async Task CreateOrder_SavesOrderToDatabase()
    {
        // Uses real PostgreSQL in a container
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(_postgres.GetConnectionString())
            .Options;

        using var context = new AppDbContext(options);
        var repo = new OrderRepository(context);

        var order = new Order { Total = 99.99m };
        await repo.CreateAsync(order);

        var saved = await repo.GetByIdAsync(order.Id);
        saved.Should().NotBeNull();
        saved!.Total.Should().Be(99.99m);
    }
}
```

---

**English Narrative:**
Setting up Testcontainers in a .NET project is straightforward. You install the base Testcontainers NuGet package along with a provider-specific package for your database. In this example, we create a PostgreSQL container using PostgreSqlBuilder, specifying the image version, database name, and credentials. The class implements IAsyncLifetime — an xUnit interface that provides InitializeAsync and DisposeAsync hooks. In InitializeAsync, we start the container and apply EF Core migrations to set up the schema. Each test then uses the real PostgreSQL database running inside the container. When all tests in the class complete, DisposeAsync stops and removes the container. The key method is GetConnectionString, which returns the dynamically assigned connection string for the running container.

**Konuşma Notları:**
.NET projesinde Testcontainers kurmak oldukça basit. NuGet'ten Testcontainers ve veritabanınıza özel paketi kurarsınız. Bu örnekte PostgreSqlBuilder ile bir PostgreSQL container tanımlıyoruz — image versiyonu, veritabanı adı ve kimlik bilgilerini belirtiyoruz. Sınıf IAsyncLifetime interface'ini implemente ediyor — bu xUnit'in InitializeAsync ve DisposeAsync hook'larını sağlayan bir interface'i. InitializeAsync'de container'ı başlatıp EF Core migration'larını uyguluyoruz. Her test gerçek PostgreSQL veritabanını kullanıyor. Tüm testler bittiğinde DisposeAsync container'ı durdurup kaldırıyor. En önemli metot GetConnectionString — çalışan container'ın dinamik olarak atanan connection string'ini döndürür. Böylece testleriniz gerçek bir veritabanıyla çalışır ama tamamen izole ve tekrarlanabilirdir.

---

---

### Slayt 19 — Testcontainers: SQL Server Example

# Testcontainers: SQL Server

## For Teams Using Microsoft SQL Server

```csharp
public class CustomerRepositoryTests : IAsyncLifetime
{
    private readonly MsSqlContainer _mssql = new MsSqlBuilder()
        .WithImage("mcr.microsoft.com/mssql/server:2022-latest")
        .Build();

    public async Task InitializeAsync()
    {
        await _mssql.StartAsync();
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer(_mssql.GetConnectionString())
            .Options;
        using var ctx = new AppDbContext(options);
        await ctx.Database.MigrateAsync();
    }

    public async Task DisposeAsync() => await _mssql.DisposeAsync();

    [Fact]
    public async Task GetCustomer_ReturnsCorrectData()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer(_mssql.GetConnectionString())
            .Options;
        using var ctx = new AppDbContext(options);

        ctx.Customers.Add(new Customer
        {
            Name = "Acme Corp",
            Email = "info@acme.com"
        });
        await ctx.SaveChangesAsync();

        // Act
        var repo = new CustomerRepository(ctx);
        var customer = await repo.GetByEmailAsync("info@acme.com");

        // Assert
        customer.Should().NotBeNull();
        customer!.Name.Should().Be("Acme Corp");
    }
}
```

### CI/CD Consideration
- Ensure Docker is available in your CI/CD runner
- GitHub Actions: `services: docker` is available by default
- Azure DevOps: Use Docker-enabled agents

---

**English Narrative:**
For teams using Microsoft SQL Server, Testcontainers provides the MsSqlBuilder class. The pattern is identical to PostgreSQL: you define the container with a builder, start it in InitializeAsync, and dispose of it after tests. The container uses the official Microsoft SQL Server Docker image. One important consideration for CI/CD is that your build agents need Docker access. GitHub Actions provides Docker by default, while Azure DevOps requires Docker-enabled agents. The startup time for SQL Server containers is slightly longer than PostgreSQL due to the image size, but this is typically acceptable since containers are reused across all tests in a test class.

**Konuşma Notları:**
Microsoft SQL Server kullanan ekipler için Testcontainers MsSqlBuilder sınıfını sunuyor. Pattern PostgreSQL ile aynı: builder ile container tanımlarsınız, InitializeAsync'de başlatırsınız, testler bitince dispose edersiniz. Container resmi Microsoft SQL Server Docker image'ını kullanır. CI/CD için önemli bir nokta: build agent'larınızın Docker erişimi olması gerekiyor. GitHub Actions'da Docker varsayılan olarak var. Azure DevOps'ta Docker özellikli agent'lar kullanmanız gerekir. SQL Server container'ı image boyutu nedeniyle PostgreSQL'den biraz daha yavaş başlar ama bu genellikle kabul edilebilir çünkü container, test sınıfındaki tüm testler boyunca yeniden kullanılır. Artık gerçek SQL Server davranışlarını — trigger'lar, stored procedure'ler, veri tipleri — tam olarak test edebilirsiniz.

---

---

## BÖLÜM 6: IN-MEMORY DATABASE TESTING (3 dk)

---

---

### Slayt 20 — EF Core InMemory Provider

# EF Core InMemory Provider

## Fast, Lightweight Database Testing

### Setup
```bash
dotnet add package Microsoft.EntityFrameworkCore.InMemory
```

### Usage
```csharp
public class ProductServiceTests
{
    private AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task GetProducts_ReturnsOnlyActiveProducts()
    {
        // Arrange
        using var context = CreateContext();
        context.Products.AddRange(
            new Product { Name = "Active Item", IsActive = true },
            new Product { Name = "Deleted Item", IsActive = false }
        );
        await context.SaveChangesAsync();

        var service = new ProductService(context);

        // Act
        var products = await service.GetActiveProductsAsync();

        // Assert
        products.Should().HaveCount(1);
        products.First().Name.Should().Be("Active Item");
    }
}
```

### Advantages
- **No Docker required** — runs entirely in memory
- **Extremely fast** — no disk I/O, no network
- **No setup/teardown** — each test gets a fresh database (unique name)
- **Good for:** Testing LINQ queries, repository logic, simple CRUD

### Limitations ⚠️
- Does **NOT** support SQL-specific features (constraints, triggers, stored procs)
- Does **NOT** enforce referential integrity by default
- Does **NOT** support raw SQL queries
- Behaves differently from real databases in edge cases

---

**English Narrative:**
The EF Core InMemory provider is the simplest way to test database interactions in .NET. You install a single NuGet package and swap your database provider with UseInMemoryDatabase, giving each test a unique database name to ensure isolation. No Docker, no external services, no startup time — the database exists entirely in memory and is extremely fast. This makes it ideal for testing LINQ queries, repository logic, and simple CRUD operations. However, there are significant limitations: InMemory does not support SQL-specific features like constraints, triggers, stored procedures, or raw SQL queries. It also does not enforce referential integrity by default. This means your tests might pass with InMemory but fail against a real database. For simple logic tests, InMemory is perfect. For anything that depends on database-specific behavior, use Testcontainers instead.

**Konuşma Notları:**
EF Core InMemory provider, .NET'te veritabanı etkileşimlerini test etmenin en basit yoludur. Tek bir NuGet paketi kurarsınız ve veritabanı sağlayıcınızı UseInMemoryDatabase ile değiştirirsiniz. Her teste benzersiz bir veritabanı adı verirsiniz ki izolasyon sağlansın. Docker yok, harici servis yok, başlatma süresi yok — veritabanı tamamen bellekte yaşar ve son derece hızlıdır. LINQ sorgularını, repository mantığını ve basit CRUD operasyonlarını test etmek için idealdir. Ama önemli sınırlamaları var: SQL'e özgü özellikleri desteklemez — constraint'ler, trigger'lar, stored procedure'ler, raw SQL sorguları çalışmaz. Referential integrity'yi varsayılan olarak uygulamaz. Bu ne demek? Testleriniz InMemory'de geçer ama gerçek veritabanında patlar! Basit mantık testleri için InMemory mükemmel. Veritabanına özgü davranışlara bağımlı bir şey test ediyorsanız Testcontainers kullanın.

---

---

### Slayt 21 — InMemory vs Testcontainers: When to Use Which

# InMemory vs Testcontainers

## Choosing the Right Approach

| Criteria | InMemory Provider | Testcontainers |
|----------|-------------------|---------------|
| **Speed** | ⚡ Instant | 🐢 Seconds (container startup) |
| **Fidelity** | Low (not real DB) | High (real DB engine) |
| **Setup** | Zero | Docker required |
| **SQL features** | ❌ Not supported | ✅ Full support |
| **Referential integrity** | ❌ Not enforced | ✅ Enforced |
| **Raw SQL queries** | ❌ Not supported | ✅ Supported |
| **CI/CD requirements** | None | Docker on build agent |
| **Best for** | LINQ logic, simple CRUD | Complex queries, migrations, constraints |

### Decision Guide
```
Is my test about pure LINQ / business logic?
  → Yes → Use InMemory (fast & simple)

Does my test depend on SQL behavior, constraints, or raw queries?
  → Yes → Use Testcontainers (real database)

Am I testing that my EF migrations work correctly?
  → Yes → Use Testcontainers (migrations need real DB)
```

---

**English Narrative:**
The choice between InMemory and Testcontainers is not either-or — most mature projects use both. Use InMemory when you are testing pure LINQ logic, simple repository methods, and business rules that do not depend on database-specific behavior. It is fast, requires no setup, and keeps your test suite running in seconds. Use Testcontainers when you need to test complex SQL queries, verify that constraints and foreign keys work correctly, test raw SQL queries, or validate that your EF Core migrations apply cleanly. The slight overhead of container startup is worth it for the confidence of testing against a real database engine. A good rule of thumb: start with InMemory for speed, and switch to Testcontainers when you discover that the database behavior matters for your test scenario.

**Konuşma Notları:**
InMemory ve Testcontainers arasındaki seçim ya biri ya diğeri şeklinde değildir — olgun projelerin çoğu ikisini birden kullanır. InMemory'yi saf LINQ mantığını, basit repository metotlarını ve veritabanına özgü davranışlara bağlı olmayan iş kurallarını test ederken kullanın. Hızlıdır, kurulum gerektirmez, test suite'iniz saniyeler içinde çalışır. Testcontainers'ı ise karmaşık SQL sorgularını, constraint'leri, foreign key'leri, raw SQL'i veya EF Core migration'larının doğru uygulanıp uygulanmadığını test ederken kullanın. Container başlatma süresi küçük bir bedel ama gerçek veritabanı motoruna karşı test etmenin verdiği güven buna değer. Pratik kural: hız için InMemory ile başlayın, test senaryonuz için veritabanı davranışının önemli olduğunu fark ettiğinizde Testcontainers'a geçin.

---

---

## BÖLÜM 7: AI-ASSISTED TESTING (7 dk)

---

---

### Slayt 22 — AI-Assisted Testing: Benefits and Risks

# AI-Assisted Testing

## Using AI Tools to Write Tests — Benefits and Risks

### Benefits ✅
- **Speed:** Generate boilerplate test code in seconds
- **Coverage discovery:** AI can suggest edge cases you might miss
- **Learning tool:** See test patterns applied to your own code
- **Tedious work automation:** Repetitive test scenarios generated fast

### Risks and Dangers ⚠️
- **"Green but meaningless" tests** — tests that always pass but verify nothing
- **Shallow assertions** — checking only that no exception was thrown
- **Hallucinated APIs** — AI invents methods/properties that don't exist
- **Over-mocking** — mocking so much that the test tests the mock, not the code
- **False confidence** — 90% code coverage with low-quality tests is worse than 50% with meaningful tests
- **Copy-paste without understanding** — developers accept AI tests without reviewing

### The Golden Rule
> **AI generates, human reviews.** Never merge AI-generated tests without understanding every assertion.

---

**English Narrative:**
AI tools like GitHub Copilot, ChatGPT, and Cursor can significantly accelerate test writing. They are excellent at generating boilerplate code, suggesting edge cases you might not think of, and demonstrating test patterns applied to your specific codebase. However, AI-generated tests come with serious risks that you must be aware of. The most common problem is "green but meaningless" tests — tests that always pass but do not actually verify meaningful behavior. AI tends to write shallow assertions like "assert no exception was thrown" rather than checking specific output values. It can hallucinate APIs — generating tests that call methods or access properties that do not exist in your code. It often over-mocks, creating tests that essentially verify the mock setup rather than the actual business logic. And perhaps most dangerously, AI-generated tests can create false confidence: seeing 90 percent code coverage feels reassuring, but if those tests are low quality, they will not catch real bugs. The golden rule is simple: AI generates, human reviews. Never merge AI-generated tests into your codebase without understanding every single assertion.

**Konuşma Notları:**
AI araçları — GitHub Copilot, ChatGPT, Cursor — test yazmayı önemli ölçüde hızlandırabilir. Boilerplate kod üretmede, düşünmeyeceğiniz edge case'leri önermede ve test pattern'lerini kodunuza uygulamada mükemmeldirler. Ama ciddi riskleri var ve bunların farkında olmalısınız. En yaygın sorun "green but meaningless" testler — her zaman geçen ama aslında anlamlı bir davranışı doğrulamayan testler. AI sığ assertion'lar yazar — "exception fırlatılmadı" kontrolü yapan ama spesifik çıktı değerlerini kontrol etmeyen. Hallucination sorunu var — kodunuzda olmayan metotları veya property'leri çağıran testler üretebilir. Over-mocking yapar — o kadar çok şey mock'lar ki test aslında iş mantığını değil mock setup'ını test eder. En tehlikelisi de sahte güven yaratmasıdır: yüzde 90 code coverage görünce kendinizi güvende hissedersiniz ama kalitesiz testlerle bu coverage gerçek hataları yakalamaz. Altın kural: AI üretir, insan inceler. AI'ın ürettiği testleri her assertion'ı anlamadan asla merge etmeyin.

---

---

### Slayt 23 — AI-Generated Test Quality Checklist

# AI Test Quality Checklist

## Review Every AI-Generated Test Against This List

### ✅ Does the test verify meaningful behavior?
- Not just "did it run without crashing"
- Checks **specific return values, state changes, or side effects**

### ✅ Are assertions specific enough?
```csharp
// BAD — too vague
result.Should().NotBeNull();

// GOOD — specific and meaningful
result.Status.Should().Be(OrderStatus.Confirmed);
result.Total.Should().Be(149.99m);
result.Items.Should().HaveCount(2);
```

### ✅ Does the test actually call the real method under test?
- Watch for tests that only exercise mocks

### ✅ Do all referenced APIs exist?
- Compile and run the test immediately — catch hallucinations early

### ✅ Is the test name descriptive?
- `MethodName_Scenario_ExpectedResult` pattern
- Example: `PlaceOrder_WhenStockIsZero_ThrowsOutOfStockException`

### ✅ Does it test a single behavior?
- One logical assertion per test (multiple Assert calls for one behavior is fine)

### ✅ Would the test fail if the logic had a bug?
- The ultimate question — if you introduce a bug, does this test catch it?

---

**English Narrative:**
Before accepting any AI-generated test, run it through this checklist. First, does the test verify meaningful behavior — not just that the code ran without throwing an exception? Second, are the assertions specific enough — checking exact values, state changes, and side effects rather than vague null checks? Third, does the test actually call the real method under test, or does it only exercise the mock setup? Fourth, do all referenced APIs actually exist — compile and run the test immediately to catch hallucinations before they waste your time. Fifth, is the test name descriptive, following the MethodName-Scenario-ExpectedResult pattern? Sixth, does it test a single behavior rather than trying to verify everything at once? And finally, the ultimate question: if you deliberately introduced a bug into the production code, would this test catch it? If the answer is no, the test is not doing its job regardless of how it was generated.

**Konuşma Notları:**
AI'ın ürettiği her testi kabul etmeden önce bu checklist'ten geçirin. Birincisi, test anlamlı bir davranışı doğruluyor mu? Sadece "exception fırlatılmadı" kontrolü yetmez — spesifik dönüş değerlerini, durum değişikliklerini kontrol etmeli. İkincisi, assertion'lar yeterince spesifik mi? result.Should().NotBeNull() çok belirsiz, result.Status.Should().Be(OrderStatus.Confirmed) çok daha anlamlı. Üçüncüsü, test gerçekten test edilen metodu çağırıyor mu yoksa sadece mock'ları mı çalıştırıyor? Dördüncüsü, referans verilen tüm API'ler gerçekten var mı? Hemen derleyin ve çalıştırın — hallucination'ları erken yakalayın. Beşincisi, test adı açıklayıcı mı? MethodName_Scenario_ExpectedResult kalıbını kullanmalı. Altıncısı, tek bir davranışı mı test ediyor? Ve son olarak en önemli soru: production koduna bilerek bir hata ekleseniz, bu test onu yakalar mı? Cevap hayırsa, test işini yapmıyor demektir.

---

---

### Slayt 24 — AI-Assisted Testing Workflow

# AI Testing Workflow

## The Right Way to Use AI for Tests

### Step 1: Prompt with Context
```
Write an xUnit test for OrderService.PlaceOrderAsync().
- It should test the happy path where stock is available.
- Use Moq for IOrderRepository and IStockService.
- Assert that the order is saved and stock is decremented.
- Use FluentAssertions.
```

### Step 2: Review the Generated Code
- Read every line — do not copy-paste blindly
- Check assertions for specificity
- Verify all APIs exist in your codebase
- Look for over-mocking or missing edge cases

### Step 3: Compile and Run
- Does it compile? (Catches hallucinated APIs)
- Does it pass? (Baseline check)
- Does it **fail when you break the code**? (Mutation test)

### Step 4: Refine
- Add edge cases AI missed (null inputs, empty collections, boundary values)
- Strengthen weak assertions
- Remove redundant test code

### Anti-Pattern: The "Generate and Forget" Developer
```
AI generates test → Developer commits without reading → 
  Test always passes → Bug ships to production → 
    "But we had 95% coverage!"
```

---

**English Narrative:**
The correct workflow for AI-assisted testing has four steps. First, prompt with context — don't just say "write a test." Tell the AI which method to test, which scenario to cover, which mocking library to use, and what assertions you expect. The more context you provide, the better the output. Second, review the generated code line by line. Check that assertions are specific, all APIs exist, and the test is not over-mocking. Third, compile and run the test immediately. If it compiles, that is a good sign — hallucinated APIs are caught here. If it passes, do a quick mutation test: deliberately break the production code and verify the test fails. If it still passes after you introduce a bug, the test is worthless. Fourth, refine — add edge cases the AI missed, strengthen weak assertions, and clean up redundant code. The anti-pattern to avoid is the "generate and forget" developer who commits AI tests without reading them. That path leads to false confidence, wasted CI cycles, and bugs that slip through despite impressive coverage numbers.

**Konuşma Notları:**
AI ile test yazmanın doğru iş akışı dört adımdan oluşur. Birincisi, bağlamla prompt verin — sadece "test yaz" demeyin. Hangi metodu test edeceğini, hangi senaryoyu kapsayacağını, hangi mocking kütüphanesini kullanacağını ve ne tür assertion'lar beklediğinizi söyleyin. Ne kadar bağlam verirseniz çıktı o kadar iyi olur. İkincisi, üretilen kodu satır satır inceleyin. Assertion'ların spesifik olup olmadığını, tüm API'lerin var olup olmadığını kontrol edin. Üçüncüsü, hemen derleyin ve çalıştırın. Derlendiyse iyi işaret — hallucination yakalanır. Geçtiyse hızlı bir mutation test yapın: production kodunu bilerek bozun ve testin patladığını doğrulayın. Eğer hatayı ekledikten sonra hâlâ geçiyorsa, o test değersizdir. Dördüncüsü, iyileştirin — AI'ın kaçırdığı edge case'leri ekleyin, zayıf assertion'ları güçlendirin. Kaçınmanız gereken anti-pattern: "üret ve unut" geliştirici. AI testi üretir, geliştirici okumadan commit eder, test her zaman geçer, hata production'a çıkar — "ama yüzde 95 coverage'ımız vardı!"

---

---

### Slayt 25 — Demo: AI-Generated Unit Test (Finished Example)

# Demo: AI-Generated Unit Test

## Before and After Human Review

### The Service Under Test
```csharp
public class OrderService
{
    private readonly IOrderRepository _orderRepo;
    private readonly IStockService _stockService;

    public OrderService(IOrderRepository orderRepo, IStockService stockService)
    {
        _orderRepo = orderRepo;
        _stockService = stockService;
    }

    public async Task<OrderResult> PlaceOrderAsync(int productId, int quantity)
    {
        var stock = await _stockService.GetStockAsync(productId);
        if (stock < quantity)
            return OrderResult.OutOfStock;

        var order = new Order
        {
            ProductId = productId,
            Quantity = quantity,
            Status = OrderStatus.Confirmed,
            CreatedAt = DateTime.UtcNow
        };

        await _orderRepo.SaveAsync(order);
        await _stockService.DecrementAsync(productId, quantity);
        return OrderResult.Success;
    }
}
```

### AI-Generated Test (After Human Review & Refinement)
```csharp
public class OrderServiceTests
{
    private readonly Mock<IOrderRepository> _mockRepo;
    private readonly Mock<IStockService> _mockStock;
    private readonly OrderService _sut;

    public OrderServiceTests()
    {
        _mockRepo = new Mock<IOrderRepository>();
        _mockStock = new Mock<IStockService>();
        _sut = new OrderService(_mockRepo.Object, _mockStock.Object);
    }

    [Fact]
    public async Task PlaceOrder_WhenStockAvailable_ReturnsSuccessAndSavesOrder()
    {
        _mockStock.Setup(s => s.GetStockAsync(1)).ReturnsAsync(10);

        var result = await _sut.PlaceOrderAsync(productId: 1, quantity: 3);

        result.Should().Be(OrderResult.Success);
        _mockRepo.Verify(r => r.SaveAsync(
            It.Is<Order>(o =>
                o.ProductId == 1 &&
                o.Quantity == 3 &&
                o.Status == OrderStatus.Confirmed)),
            Times.Once);
        _mockStock.Verify(s => s.DecrementAsync(1, 3), Times.Once);
    }

    [Fact]
    public async Task PlaceOrder_WhenOutOfStock_ReturnsOutOfStockAndDoesNotSave()
    {
        _mockStock.Setup(s => s.GetStockAsync(1)).ReturnsAsync(2);

        var result = await _sut.PlaceOrderAsync(productId: 1, quantity: 5);

        result.Should().Be(OrderResult.OutOfStock);
        _mockRepo.Verify(r => r.SaveAsync(It.IsAny<Order>()), Times.Never);
        _mockStock.Verify(s => s.DecrementAsync(
            It.IsAny<int>(), It.IsAny<int>()), Times.Never);
    }
}
```

### What the Human Review Added
- Verified **specific order properties** (not just "was save called")
- Added **negative test** (out of stock → no save, no decrement)
- Used **descriptive test names** following naming convention
- Verified that side effects **did NOT happen** when they shouldn't

---

**English Narrative:**
Let us walk through a concrete example. Here we have an OrderService with a PlaceOrderAsync method that checks stock, creates an order, saves it, and decrements stock. The AI generated the initial test structure, but human review refined it significantly. The first test verifies the happy path: when stock is available, the method returns Success, saves an order with the correct properties, and decrements stock. Notice the specific assertions — we don't just check that SaveAsync was called, we verify the exact properties of the order object passed to it. The second test covers the negative path: when stock is insufficient, the method returns OutOfStock and — crucially — we verify that neither SaveAsync nor DecrementAsync were called. This negative assertion is something AI often misses but is critical for catching bugs. The AI got us 70 percent of the way there; human review brought it to production quality.

**Konuşma Notları:**
Somut bir örnek üzerinden gidelim. Burada stok kontrolü yapan, sipariş oluşturan, kaydeden ve stoğu azaltan bir PlaceOrderAsync metodumuz var. AI başlangıç test yapısını üretti ama insan incelemesi önemli iyileştirmeler yaptı. İlk test mutlu yolu doğruluyor: stok varken metot Success dönüyor, doğru özelliklerle sipariş kaydediyor ve stoğu azaltıyor. Dikkat edin — sadece SaveAsync çağrıldı mı diye bakmıyoruz, sipariş nesnesinin tam olarak doğru property'lerle kaydedildiğini doğruluyoruz. İkinci test olumsuz yolu kapsıyor: stok yetersizken OutOfStock dönüyor ve — çok önemli — SaveAsync ve DecrementAsync'in çağrılMADIĞINI doğruluyoruz. Bu negatif assertion AI'ın sıklıkla kaçırdığı ama hata yakalamak için kritik olan bir kontrol. AI bizi yüzde 70'e kadar getirdi, insan incelemesi production kalitesine taşıdı.

---

---

## BÖLÜM 8: HANDS-ON EXAMPLES (6 dk)

---

---

### Slayt 26 — Hands-On: The Service We Will Test

# Hands-On: OrderService

## The Code Under Test

### Domain Models
```csharp
public class Order
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalAmount => Quantity * UnitPrice;
    public OrderStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}

public enum OrderStatus { Pending, Confirmed, Shipped, Cancelled }

public record OrderResult(bool IsSuccess, string? ErrorMessage = null, int? OrderId = null);
```

### Interfaces
```csharp
public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(int id);
    Task<int> CreateAsync(Order order);
}

public interface IPricingService
{
    Task<decimal> GetUnitPriceAsync(int productId);
}
```

### Service
```csharp
public class OrderService
{
    private readonly IOrderRepository _orderRepo;
    private readonly IPricingService _pricingService;

    public OrderService(IOrderRepository orderRepo, IPricingService pricingService)
    {
        _orderRepo = orderRepo;
        _pricingService = pricingService;
    }

    public async Task<OrderResult> CreateOrderAsync(int productId, int quantity)
    {
        if (quantity <= 0)
            return new OrderResult(false, "Quantity must be greater than zero");

        var unitPrice = await _pricingService.GetUnitPriceAsync(productId);
        if (unitPrice <= 0)
            return new OrderResult(false, "Product price is invalid");

        var order = new Order
        {
            ProductId = productId,
            Quantity = quantity,
            UnitPrice = unitPrice,
            Status = OrderStatus.Confirmed,
            CreatedAt = DateTime.UtcNow
        };

        var orderId = await _orderRepo.CreateAsync(order);
        return new OrderResult(true, OrderId: orderId);
    }
}
```

---

**English Narrative:**
For our hands-on exercises, we will work with this OrderService. It has a CreateOrderAsync method that validates the quantity, retrieves the unit price from a pricing service, creates an order entity, saves it through the repository, and returns a result. This service has two dependencies — IOrderRepository and IPricingService — which we will mock in our unit test. The method has clear branching logic: it returns an error if quantity is zero or negative, returns an error if the price is invalid, and returns success with the created order ID in the happy path. These branches give us clear test scenarios to cover.

**Konuşma Notları:**
Hands-on örneklerimiz için bu OrderService ile çalışacağız. CreateOrderAsync metodu şunları yapıyor: miktarı valide ediyor, pricing service'ten birim fiyatı alıyor, sipariş entity'si oluşturuyor, repository üzerinden kaydediyor ve sonucu dönüyor. İki bağımlılığı var — IOrderRepository ve IPricingService — bunları unit testlerde mock'layacağız. Metodun net dallanma mantığı var: miktar sıfır veya negatifse hata dönüyor, fiyat geçersizse hata dönüyor, her şey yolundaysa sipariş oluşturup ID ile başarılı sonuç dönüyor. Bu dallanmalar bize test etmemiz gereken senaryoları net olarak veriyor.

---

---

### Slayt 27 — Hands-On 1: Writing a Unit Test

# Hands-On 1: Unit Test

## Step-by-Step Unit Test for OrderService

```csharp
public class OrderServiceTests
{
    private readonly Mock<IOrderRepository> _mockRepo;
    private readonly Mock<IPricingService> _mockPricing;
    private readonly OrderService _sut; // System Under Test

    public OrderServiceTests()
    {
        _mockRepo = new Mock<IOrderRepository>();
        _mockPricing = new Mock<IPricingService>();
        _sut = new OrderService(_mockRepo.Object, _mockPricing.Object);
    }

    // Test 1: Happy path
    [Fact]
    public async Task CreateOrder_WithValidInput_ReturnsSuccessWithOrderId()
    {
        // Arrange
        _mockPricing.Setup(p => p.GetUnitPriceAsync(1)).ReturnsAsync(25.00m);
        _mockRepo.Setup(r => r.CreateAsync(It.IsAny<Order>())).ReturnsAsync(42);

        // Act
        var result = await _sut.CreateOrderAsync(productId: 1, quantity: 3);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.OrderId.Should().Be(42);
        result.ErrorMessage.Should().BeNull();

        _mockRepo.Verify(r => r.CreateAsync(It.Is<Order>(o =>
            o.ProductId == 1 &&
            o.Quantity == 3 &&
            o.UnitPrice == 25.00m &&
            o.Status == OrderStatus.Confirmed
        )), Times.Once);
    }

    // Test 2: Invalid quantity
    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(-100)]
    public async Task CreateOrder_WithInvalidQuantity_ReturnsError(int quantity)
    {
        var result = await _sut.CreateOrderAsync(productId: 1, quantity: quantity);

        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().Be("Quantity must be greater than zero");
        _mockRepo.Verify(r => r.CreateAsync(It.IsAny<Order>()), Times.Never);
    }

    // Test 3: Invalid price
    [Fact]
    public async Task CreateOrder_WhenPriceIsInvalid_ReturnsError()
    {
        _mockPricing.Setup(p => p.GetUnitPriceAsync(1)).ReturnsAsync(0m);

        var result = await _sut.CreateOrderAsync(productId: 1, quantity: 2);

        result.IsSuccess.Should().BeFalse();
        result.ErrorMessage.Should().Be("Product price is invalid");
        _mockRepo.Verify(r => r.CreateAsync(It.IsAny<Order>()), Times.Never);
    }
}
```

### Test Naming Convention
> `MethodName_Scenario_ExpectedBehavior`

### AAA Pattern
> **Arrange** (setup) → **Act** (execute) → **Assert** (verify)

---

**English Narrative:**
Let us build the unit test step by step. First, we set up our test class with mock dependencies and create the System Under Test — our OrderService — in the constructor. This runs before each test, giving us fresh mocks every time. Test one covers the happy path: we configure the pricing service to return 25 dollars, the repository to return order ID 42, call CreateOrderAsync, and verify the result is successful with the correct order ID. We also verify that the repository received an order with the exact expected properties. Test two uses Theory with InlineData to test multiple invalid quantities — zero, negative one, and negative one hundred — all in a single test definition. We verify the error message and confirm the repository was never called. Test three handles the invalid price scenario. Notice the AAA pattern in every test: Arrange the dependencies, Act by calling the method, Assert the results. And notice the naming convention: MethodName underscore Scenario underscore ExpectedBehavior — this makes test output self-documenting.

**Konuşma Notları:**
Unit testi adım adım oluşturalım. Önce test sınıfımızı mock bağımlılıklarıyla kuruyoruz ve constructor'da System Under Test'imizi — OrderService'i — oluşturuyoruz. Bu her testten önce çalışır, her seferinde taze mock'lar verir. Birinci test mutlu yolu kapsıyor: pricing service'i 25 dolar dönecek şekilde ayarlıyoruz, repository'yi sipariş ID 42 dönecek şekilde ayarlıyoruz, CreateOrderAsync'i çağırıyoruz ve sonucun başarılı olduğunu doğru order ID ile doğruluyoruz. Ayrıca repository'nin tam olarak beklediğimiz property'lerle bir sipariş aldığını da doğruluyoruz. İkinci test Theory ile InlineData kullanarak birden fazla geçersiz miktarı tek bir test tanımında test ediyor. Hata mesajını doğruluyoruz ve repository'nin asla çağrılmadığını onaylıyoruz. Üçüncü test geçersiz fiyat senaryosunu ele alıyor. Her testte AAA pattern'ine dikkat edin: Arrange — bağımlılıkları kur, Act — metodu çağır, Assert — sonuçları doğrula. İsimlendirme kuralı da önemli: MethodName_Scenario_ExpectedBehavior — bu test çıktısını kendi kendini belgeleyen hale getirir.

---

---

### Slayt 28 — Hands-On 2: Writing an Integration Test

# Hands-On 2: Integration Test

## Testing the Full API Pipeline with WebApplicationFactory

```csharp
// Custom factory to replace real DB with InMemory
public class TestWebAppFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            // Remove real database registration
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
            if (descriptor != null)
                services.Remove(descriptor);

            // Add InMemory database for testing
            services.AddDbContext<AppDbContext>(options =>
                options.UseInMemoryDatabase("IntegrationTestDb"));

            // Seed test data
            var sp = services.BuildServiceProvider();
            using var scope = sp.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.Database.EnsureCreated();
        });
    }
}

// Integration tests
public class OrdersApiTests : IClassFixture<TestWebAppFactory>
{
    private readonly HttpClient _client;

    public OrdersApiTests(TestWebAppFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CreateOrder_ReturnsCreatedWithOrderId()
    {
        // Arrange
        var request = new { ProductId = 1, Quantity = 3 };
        var content = new StringContent(
            JsonSerializer.Serialize(request),
            Encoding.UTF8,
            "application/json");

        // Act
        var response = await _client.PostAsync("/api/orders", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);

        var body = await response.Content.ReadFromJsonAsync<OrderResponse>();
        body.Should().NotBeNull();
        body!.OrderId.Should().BeGreaterThan(0);
        body.Status.Should().Be("Confirmed");
    }

    [Fact]
    public async Task CreateOrder_WithInvalidQuantity_ReturnsBadRequest()
    {
        var request = new { ProductId = 1, Quantity = -1 };
        var content = new StringContent(
            JsonSerializer.Serialize(request),
            Encoding.UTF8,
            "application/json");

        var response = await _client.PostAsync("/api/orders", content);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
```

### What This Tests (That Unit Tests Cannot)
- HTTP routing and middleware pipeline
- JSON serialization/deserialization
- Dependency injection wiring
- Model validation
- Response status codes and headers

---

**English Narrative:**
For our integration test, we use WebApplicationFactory — a powerful utility in ASP.NET Core that lets you spin up your entire application in-memory and send real HTTP requests to it. We create a custom TestWebAppFactory that inherits from WebApplicationFactory of Program, where we override ConfigureWebHost to swap the real database with an InMemory database. This gives us a fully configured application with all middleware, routing, serialization, and dependency injection working exactly as they would in production — just with a test database. Our integration tests use IClassFixture to share the factory across all tests in the class, and each test creates an HttpClient to send requests. The first test sends a POST request to create an order and verifies the response status code, body content, and specific field values. The second test verifies that invalid input returns a Bad Request. These tests catch issues that unit tests simply cannot: misconfigured routes, broken serialization, missing DI registrations, and incorrect status codes.

**Konuşma Notları:**
Integration test için WebApplicationFactory kullanıyoruz — ASP.NET Core'da uygulamanızın tamamını in-memory olarak ayağa kaldırıp gerçek HTTP istekleri göndermenizi sağlayan güçlü bir araç. TestWebAppFactory sınıfı oluşturuyoruz, WebApplicationFactory'den türetiyoruz ve ConfigureWebHost'u override ederek gerçek veritabanını InMemory veritabanıyla değiştiriyoruz. Böylece tüm middleware, routing, serialization ve dependency injection tam olarak production'daki gibi çalışan bir uygulamamız oluyor — sadece veritabanı test veritabanı. Integration testlerimizde HttpClient ile gerçek HTTP istekleri gönderiyoruz. İlk test POST isteği göndererek sipariş oluşturuyor ve response status code'unu, body içeriğini ve spesifik alanları doğruluyor. İkinci test geçersiz input'un Bad Request döndüğünü doğruluyor. Bu testler unit testlerin yakalayamayacağı şeyleri yakalar: yanlış yapılandırılmış route'lar, bozuk serialization, eksik DI kayıtları ve hatalı status code'ları. İşte bu yüzden ikisine de ihtiyacımız var.

---

---

### Slayt 29 — Key Takeaways & Resources

# Key Takeaways

## What to Remember from This Session

### Core Principles
1. **Testing is an investment, not a cost** — it saves money long-term
2. **Unit tests for logic, integration tests for wiring** — use both
3. **The testing pyramid is your guide** — many unit, some integration, few E2E
4. **Mock dependencies, not the system under test** — keep focus on business logic
5. **AI accelerates but does not replace human judgment** — always review

### .NET Testing Stack Summary
| Purpose | Tool |
|---------|------|
| Test framework | **xUnit** (recommended) |
| Assertions | **FluentAssertions** |
| Mocking | **Moq** or **NSubstitute** |
| In-memory DB | **EF Core InMemory** |
| Real DB testing | **Testcontainers** |
| Integration tests | **WebApplicationFactory** |
| AI assistance | **Copilot / Cursor / ChatGPT** (with review) |

### Resources
- [xUnit Documentation](https://xunit.net/)
- [FluentAssertions Docs](https://fluentassertions.com/)
- [Moq GitHub](https://github.com/moq/moq4)
- [NSubstitute Docs](https://nsubstitute.github.io/)
- [Testcontainers .NET](https://dotnet.testcontainers.org/)
- [ASP.NET Core Integration Testing](https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests)
- [Microsoft Testing Best Practices](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-best-practices)

### Next Steps for Interns
- [ ] Set up a test project in your current solution
- [ ] Write your first unit test for a real service
- [ ] Write your first integration test for an API endpoint
- [ ] Try AI-assisted test generation and review the output critically

---

**English Narrative:**
Let us wrap up with the key messages from this session. First, testing is an investment that pays for itself — remember Knight Capital's 440-million-dollar lesson. Second, unit tests and integration tests serve different purposes and you need both. Third, follow the testing pyramid: many fast unit tests at the base, fewer integration tests in the middle. Fourth, mock dependencies to isolate the code under test, but always verify that the mock setup reflects reality. Fifth, AI tools are powerful accelerators for test writing, but they require human review — never trust an AI-generated test blindly. Your recommended .NET testing stack is xUnit for the framework, FluentAssertions for readable assertions, Moq or NSubstitute for mocking, EF Core InMemory for simple database tests, and Testcontainers for tests that need real database behavior. As your next step, set up a test project in your current solution and write your first real test — the best way to learn testing is by doing it.

**Konuşma Notları:**
Bu oturumdan çıkarmanız gereken ana mesajları özetleyelim. Birincisi, test yazmak kendini amorti eden bir yatırımdır — Knight Capital'ın 440 milyon dolarlık dersini hatırlayın. İkincisi, unit test ve integration test farklı amaçlara hizmet eder, ikisine de ihtiyacınız var. Üçüncüsü, test piramidini takip edin: tabanda çok sayıda hızlı unit test, ortada daha az integration test. Dördüncüsü, bağımlılıkları mock'layarak test edilen kodu izole edin ama mock kurulumunun gerçekliği yansıttığından emin olun. Beşincisi, AI araçları test yazmada güçlü hızlandırıcılardır ama insan incelemesi şarttır — AI'ın ürettiği teste körü körüne güvenmeyin. Önerilen .NET test yığınınız: framework olarak xUnit, okunabilir assertion'lar için FluentAssertions, mocking için Moq veya NSubstitute, basit veritabanı testleri için EF Core InMemory, gerçek veritabanı davranışı gereken testler için Testcontainers. Bir sonraki adımınız: mevcut solution'ınızda bir test projesi kurun ve ilk gerçek testinizi yazın. Test yazmayı öğrenmenin en iyi yolu yapmaktır. Sorularınız varsa şimdi alabilirim, teşekkürler!

---

*End of Presentation*
