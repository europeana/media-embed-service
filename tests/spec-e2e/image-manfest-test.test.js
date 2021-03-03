const base_port = 8081;
const base_url = `http://127.0.0.1:${base_port}/public/index.html`;
const manifest_url = `http%3A%2F%2F127.0.0.1%3A${base_port}%2Ftests%2Ffixture-data%2Fmanifest-image.json`;
const target_url = base_url + '?manifest=' + manifest_url;
const waitTime = 10000;
const selWrapper = '.player-wrapper';

module.exports = {
  'The info button is present': (browser) => {
    browser.url(target_url)
    .waitForElementPresent('img', waitTime)
    .waitForElementPresent(selWrapper, waitTime)
  }
};
