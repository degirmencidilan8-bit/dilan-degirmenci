# DILAN&BATUHAN sitesi: çalışma notları

Bu not, siteyi düzenleyen herkes (Dilan, Batu ve ikisinin Claude'u) için.
`CLAUDE.md` bu dosyayı içeri aldığı için Claude Code projeyi açınca bunu
otomatik okur. Yeni bir karar alındığında buraya eklenmeli.

## Site nerede, nasıl yayına çıkıyor

- Canlı adres: https://dilan-degirmenci-scripts.vercel.app
- Kod: https://github.com/degirmencidilan8-bit/dilan-degirmenci (gizli depo, dal `main`)
- `main` dalına her gönderimde (push) Vercel siteyi kendiliğinden yeniden kurar,
  1-2 dakikada canlıya çıkar. Ayrıca bir "deploy" adımı yok.
- Vercel hesabı Dilan'ın (ücretsiz Hobby planı). Bir kurulum hata verirse
  kaydı Dilan'ın Vercel panelinde görünür.
- Vercel'de Framework Preset **Next.js** olmalı, Root Directory boş kalmalı.
  ("Other" seçiliyken site 404 veriyordu.)

## İki kişi çalışırken

- Aynı anda çalışmayın. Her oturuma başlarken önce `git pull` ile en son
  hâli çekin. Bitirince gönderin (push) ve birbirinize haber verin.
- Küçük, anlamlı commit'ler atın. Göndermeden önce şunlar hatasız geçmeli:
  `npx tsc --noEmit` ve `npm run lint`.
- `npm run dev` çalışırken `npm run build` çalıştırmayın. Gerekirse önce dev
  sunucusunu durdurun.
- Windows PowerShell'de `npx` betik engeline takılırsa `npx.cmd` kullanın.

## İçerik kuralları (en önemlisi)

- **Metin uydurulmaz.** Marka adı, rol, katkı, yıl, açıklama, alıntı: hepsi
  yalnızca Dilan ya da Batu'nun verdiği metinden, kelimesi kelimesine
  kullanılır. Eksik bilgi boş bırakılır ve sorulur.
- Gerçek bir markanın kimliği (logo, yazı tipi, renk sistemi) taklit edilmez.
- Siteye eklenecek bütün metinlerin listesi ve durumu: `ICERIK.md`.
- Claude'la çalışırken cevaplar Türkçe olmalı.

## Tasarım dili

- Hedef: siteyi açan ilk saniyede "bunların bakışı farklı" demeli.
  Vaka anlatımı değil, izlenim. "Yapısı brutalist, içeriği sinematik."
- Sert çizgiler, köşelerde küçük büyük harfli etiketler (WORK / ABOUT /
  INSTAGRAM / CONTACT), dar ve ağır başlık harfi (Archivo), yuvarlak köşe yok.
  Işık ve derinlik kadrajın içinde.
- Her sayfanın tek bir işi var, iki sayfa aynı işi yapmamalı.
- Örnek alınan siteler: Kargo Studio (kargo-studio.com), Porto Rocha MASP,
  Iconoclast, Somesuch, Stink, Jack Davison, Webber, Bureau Borsche.

## Dosyalar: neyi nerede değiştirirsin

| Ne | Dosya |
| --- | --- |
| Projeler: ad, yıl, disiplin, ajans, kapak, galeri, fotoğraf altı yazıları | `src/data/projects.ts` |
| Proje metinleri: tek cümle, brief, katkı, çıktı, konum | `src/data/colophons.ts` |
| Proje sayfasının kurgusu: hangi fotoğraf tam ekran, ikili, üçlü vb. | `src/data/layouts.ts` (çizen: `src/components/Directed.tsx`) |
| Work sayfasındaki sıra ve kapak kadrajı | `src/data/work-index.ts` |
| Ana sayfa açılışında dönen 12 kare | `src/data/opener.ts` |
| Ana sayfadaki dağınık küçük kareler | `src/data/field.ts` |
| Filmler (kamera arkası, kampanya filmleri) | `src/data/films.ts` |
| E-posta, Instagram, About metni | `src/data/profile.ts` |
| Proje başına başlık harfinin ayarı | `src/data/typography.ts` |
| Sayfalar | `src/app/…` (Next.js App Router) |

`AGENTS.md` dosyasındaki Next.js bloğunu `next dev` kendisi yazıyor, elle
değiştirmeyin. Bu Next.js sürümü (16) eğitim verisindekinden farklı, kod
yazmadan önce `node_modules/next/dist/docs/` okunmalı.

## Fotoğraf eklemek

1. Dosyayı `public/media/<marka-klasörü>/` içine koy.
2. `npm run images` çalıştır. (`dev` ve `build` bunu zaten kendileri
   çalıştırıyor.) Bu, `public/_img` içine WebP boyutlarını ve
   `src/data/image-manifest.json` dosyasını üretir. Bunları elle düzenleme.
3. Fotoğrafı `projects.ts` içinde projenin galerisine, sonra `layouts.ts`
   içinde sayfadaki yerine ekle.

**Çözünürlük kuralı:** Fotoğraflar asla büyütülerek gösterilmemeli.
Tam ekran (`bleed`) ya da açılış (`hero`) için en az 2400 px genişlikte asıl
gerekir. Instagram'dan çıkmış 1080 px dosyalar yalnızca küçük alanlara
(`pair`, `trio`, `offset` küçük, `solo` sm/md) konmalı. Mümkünse her zaman
düzenlenmiş büyük aslı kullanın.

## Video eklemek

- GitHub 100 MB'tan büyük dosyayı kabul etmiyor. Videolar sıkıştırılarak
  eklenir (ffmpeg): H.264, CRF 24, en fazla 2,5 Mbps, en fazla 1920 px,
  yuv420p, AAC 128k, `+faststart`.
- Büyük asıllar git'e girmez. Dilan'ın bilgisayarında `media-originals/`
  klasöründe duruyorlar (bu klasör `.gitignore` içinde).

## Açık konular

- Filmlerin yılları eksik (Arkadaş Basım dışında).
- E-posta ve Instagram şimdilik Dilan'ın kişisel hesapları. İleride ortak
  hesap düşünülebilir.
- Adres hâlâ `…-scripts.vercel.app`. Kendi alan adı ya da
  `dilan-degirmenci.vercel.app` bağlanabilir.
