// Bu dosyanın adı "proxy.js" olmalı ve "api" adında bir klasörün içinde yer almalıdır.

export default async function handler(request, response) {
  // Sadece GET metoduyla gelen isteklere izin veriyoruz.
  if (request.method !== 'GET') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  // index.html'den gelen "?endpoint=..." kısmını alıyoruz.
  const { endpoint } = request.query;
  const ALBION_API_ROOT = 'https://gameinfo-ams.albiononline.com/api/gameinfo';

  if (!endpoint) {
    return response.status(400).json({ message: 'API endpoint parametresi gerekli' });
  }

  // Albion API'si için tam hedef URL'yi oluşturuyoruz.
  const targetUrl = `${ALBION_API_ROOT}${endpoint}`;

  try {
    // Albion API'sine fetch isteği yapıyoruz.
    const apiResponse = await fetch(targetUrl, {
      headers: {
        // API'ye kim olduğumuzu bildirmek, engellenme riskini azaltabilir.
        'User-Agent': 'TeamSupremacy-GuildPanel-Vercel-Deployment',
      },
    });

    // Albion API'sinden bir hata dönerse, bu hatayı panelimize iletiyoruz.
    if (!apiResponse.ok) {
        return response.status(apiResponse.status).json({ message: `Albion API Hatası: ${apiResponse.statusText}` });
    }

    const data = await apiResponse.json();
    
    // Vercel'in bu cevabı 1 saat boyunca cache'lemesini (önbellekte tutmasını) sağlıyoruz.
    // Bu, API'yi daha az yorar ve paneli hızlandırır.
    response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

    // Gelen veriyi panelimize (index.html'e) gönderiyoruz.
    return response.status(200).json(data);

  } catch (error) {
    console.error('Proxy Hatası:', error);
    return response.status(500).json({ message: 'Proxy sunucusunda bir hata oluştu' });
  }
}
