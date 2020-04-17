const base_port = 8081;
const base_url = `http://127.0.0.1:${base_port}/public/index.html`;
const manifest_url = `http%3A%2F%2F127.0.0.1%3A${base_port}%2Ftests%2Ffixture-data%2Fmanifest.json`;
const target_url = base_url + '?manifest=' + manifest_url;

const waitTime = 10000;
const selTime = '.canvas-time';
const selPlay = '.button-play';
const selPlayIcon = selPlay + ' .av-icon';

const selCanvas = '.canvas-container';


const fmtWHParam = (w, h) => {
  return `&width=${w}&height=${h}`
};

const confirmSizeFromParams = (browser, w, h) => {
  return browser.url(target_url + fmtWHParam(w, h))
  .getElementSize(selCanvas, function (result) {
    this.assert.ok(result.value.width === w, `Check width (${result.value.width}) is ${w}`);
    this.assert.ok(result.value.height === h, `Check height (${result.value.height}) is ${h}`);
  })
};


module.exports = {
  'Limit the player size according to the url parameters (500 / 400)': (browser) => {
    confirmSizeFromParams(browser, 500, 400).end()
  },
  'Limit the player size according to the url parameters (800 / 500)': (browser) => {
    confirmSizeFromParams(browser, 800, 500).end()
  },
  'Limit the player size according to the url parameters (1200 / 800)': (browser) => {
    confirmSizeFromParams(browser, 800, 500).end()
  }
};
