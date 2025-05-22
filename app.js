const express = require('express');
const app = express();

app.get('/scrape', async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URLパラメータが必要です' });
  }

  try {
    console.log(`スクレイピング開始: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ScrapeBot/1.0)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    
    const textContent = html
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<style[^>]*>.*?<\/style>/gis, '')
      .replace(/<nav[^>]*>.*?<\/nav>/gis, '')
      .replace(/<header[^>]*>.*?<\/header>/gis, '')
      .replace(/<footer[^>]*>.*?<\/footer>/gis, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    res.json({
      success: true,
      url: url,
      content: textContent,
      method: 'fetch_api',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('エラー:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      url: url
    });
  }
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'スクレイピングAPI稼働中',
    endpoints: {
      scrape: '/scrape?url=対象URL'
    }
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 API起動: http://localhost:${PORT}`);
});
