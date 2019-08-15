const request = require('request');
const cheerio = require('cheerio');

module.exports = app => {
  app.post('/scrape', (req, res) => {
    var url = req.body.url;
    console.log('POST with url: ' + url);
    request(url, (error, response, html) => {
      if (!error && response.statusCode == 200) {
        //console.log(html);
        const $ = cheerio.load(html);
        const lyrics = $('.lyrics')
          .text()
          .trim();

        //console.log(lyrics);
        res.json({ lyrics: lyrics });
        res.end();
      }
    });
  });
};
