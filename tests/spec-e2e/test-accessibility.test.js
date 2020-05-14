const base_port = 8081;
const base_url = `http://127.0.0.1:${base_port}/public/index.html`;
const manifest_url = `http%3A%2F%2F127.0.0.1%3A${base_port}%2Ftests%2Ffixture-data%2Fmanifest.json`;
const target_url = base_url + '?manifest=' + manifest_url;

const waitTime = 10000;
const selCanvas = '.canvas-container';

module.exports = {
  beforeEach: (browser) => {
     browser.url(target_url)
     .waitForElementVisible(selCanvas, waitTime);
  },
  'Accessibility Check': function (browser) {
    browser
      .initAccessibility()
      .assert.accessibility('.eups-player', {
        verbose: true
      })
      .end()
  }
};
