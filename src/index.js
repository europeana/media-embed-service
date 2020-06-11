import './index.scss';
const EuropeanaMediaPlayer = require('@europeana/media-player');

//localhost:9001?manifest=https%3A%2F%2Fiiif.europeana.eu%2F%2Fpresentation%2F%2F08609%2F%2Ffe9c5449_9522_4a70_951b_ef0b27893ae9%2F%2Fmanifest%3Fformat%3D3%26wskey%3Dapi2demo
//const options = {embedid: "6FFlHN"};
//const options = {embedid: "WZpDVT"};
//const options = {embedid: "qBUhte"};
//const options = {embedid: "6BGMFG"};
//const options = {embedid: "Y1pbs4"};

// VIDEO
//http://localhost:9001/?width=960&height=720&manifest=https%3A%2F%2Fiiif.europeana.eu%2F%2Fpresentation%2F%2F08609%2F%2Ffe9c5449_9522_4a70_951b_ef0b27893ae9%2F%2Fmanifest%3Fformat%3D3%26wskey%3Dapi2demo
// IMAGE
//http://localhost:9001/?width=260&height=520&manifest=https%3A%2F%2Fiiif.europeana.eu%2Fpresentation%2F2021672%2Fresource_document_mauritshuis_670%2Fmanifest%3Fformat%3D3%26wskey%3Dapi2demo
// AUDIO
//http://localhost:9001/?width=260&height=520&manifest=https%3A%2F%2Fiiif.europeana.eu%2Fpresentation%2F22%2F_72315%2Fmanifest%3Fformat%3D3%26wskey%3Dapi2demo

let duration = -1;
let player;
let playerWrapper;
export { player };

let windowLocationHref = window.location.href;

export const setWindowLocation = (url) => {
  windowLocationHref = url;
};

window.addEventListener('load', () => {

  playerWrapper = $('.player-wrapper');

  const urlParams = new URL(windowLocationHref).searchParams;
  let manifest = urlParams.get('manifest');

  if (!manifest) {
    const id = (urlParams.get('id')) ? urlParams.get('id') : window.location.pathname;
    if (/^\/[0-9]+\/[a-zA-Z0-9_]+$/.test(id)) {
      manifest = `${API_SERVER}${id}/manifest?format=3&wskey=${API_KEY}`;
    } else {
      console.log('id invalid: ' + id);
    }
  }

  if (manifest) {
    loadUrl(manifest, urlParams);
  } else {
    console.log('no manifest or id supplied');
  }

  if (urlParams.get('t') !== null) {
    //construct start and duration of the temporal fragment
    /* eslint no-undef: "off" */
    let parts = urlParams.get('t').split(',');
    if (split.length > 1) {
      duration = parts[1] - parts[0];
    }
  }
});

export const loadUrl = (manifest, urlParams) => {

  loadJSON(manifest, (manifestData) => {
    let mediaMode = manifestData.items[0].items[0].items[0].body.type.toLowerCase();
    playerWrapper.addClass(mediaMode);
    if (urlParams.get('width') && urlParams.get('height')) {
      setEmbedDimensions(urlParams.get('width'), urlParams.get('height'), mediaMode === 'image');
    }
    if (['audio', 'video'].indexOf(mediaMode) > -1) {
      initialisePlayer(manifest, mediaMode, urlParams.get('lang'));
    } else if (mediaMode === 'image') {
      const rootItem = manifestData.items[0];
      const imgUrl = rootItem.items[0].items[0].body.id;
      const xywhParam = urlParams.get('xywh');
      if (!(xywhParam && handleMediaFragment(imgUrl, rootItem.width, rootItem.height, urlParams))) {
        playerWrapper.append(`<img src="${manifestData.items[0].items[0].items[0].body.id}" alt="">`);
      }
      playerWrapper.removeClass('loading');
      initialiseAttribution(manifestData.items[0], mediaMode, urlParams.get('lang'));
    }
  });
};

export const handleMediaFragment = (imgUrl, imgW, imgH, urlParams) => {

  const noramlisedParam = urlParams.get('xywh').replace(/percent:/, '');
  const isPercent = noramlisedParam !== urlParams.get('xywh');
  const xywh = noramlisedParam.split(',').map((i) => parseInt(i));

  if (!isValidXYWH(isPercent, imgW, imgH, ...xywh)) {
    console.log('Invalid xywh parameters');
    return false;
  }

  let dimensions;

  if (isPercent) {
    dimensions = getFragmentPercent(imgW, imgH, ...xywh);
  } else {
    dimensions = getFragmentPixel(imgW, imgH, ...xywh);
  }

  playerWrapper.append('<div class="xywh-img-wrapper"><div class="xywh-img"'
   + ' style="'
   + 'background-image: url(' + imgUrl + '); '
   + 'background-size: ' + dimensions.size  + '%; '
   + 'background-position: ' + dimensions.position.x + '% ' + dimensions.position.y +  '%; '
   + 'padding-top: ' + dimensions.top + '%;'
   + '"></div></div>');
  return true;
};

export const isValidXYWH = (pct, imgW, imgH, x, y, w, h) => {
  let result = true;
  if (pct && (x < 0 || y < 0 || w < 1 || h < 1 || (x + w) > 100 || (y + h) > 100 || x > 100 || y > 100)) {
    result = false;
  } else if ((x < 0 || y < 0 || w < 1 || h < 1 || (x + w) > imgW || (y + h) > imgH)) {
    result = false;
  }
  return result;
};

export const getOffsetPixels = (imgD, d, pos) => {
  if (pos === 0) {
    return 0;
  }
  let remainFraction = (imgD / d) -1;
  let remainPosition = pos / d;
  return (remainPosition / remainFraction) * 100;
};

export const getOffsetPercent = (pos, d) => {
  let bgScale = 100 / d;
  let numerator = bgScale * pos;
  let denominator = bgScale - 1;
  return [numerator, denominator].indexOf(0) > -1 ? 0 : numerator / denominator;
};

export const dimensionData = (size, x, y, top) => {
  return {
    size,
    position: {
      x,
      y
    },
    top
  };
};

export const getFragmentPercent = (imgW, imgH, x, y, w, h) => {
  const wRatio = 100 / w;
  let realPct = 100 / (imgW / imgH);
  let cropRatio = (realPct / 100) * h;
  let paddingTop = cropRatio * wRatio;
  return dimensionData(wRatio * 100, getOffsetPercent(x, w), getOffsetPercent(y, h), paddingTop);
};

export const getFragmentPixel = (imgW, imgH, x, y, w, h) => {
  return dimensionData(((imgW / w) * 100), getOffsetPixels(imgW, w, x), getOffsetPixels(imgH, h, y), (h/w) * 100);
};

export const loadJSON = (jsonUrl, cb) => {
  fetch(jsonUrl, {
    mode: 'cors',
    method: 'GET'
  })
    .then(res => res.json())
    .then(response => {
      cb(response);
    })
    .catch((err) => {
      console.error(`Could not load ${jsonUrl}`);
      console.log(err);
    });
};

export const setEmbedDimensions = (w, h, noRatio) => {
  const dimensionCss = { 'max-width': w + 'px', 'max-height': h + 'px' };
  $('.europeana-media-embed').css(dimensionCss);
  if (!noRatio) {
    const pct = (h / w) * 100;
    playerWrapper.css('padding-top', `${pct}%`);
  }
};

export const initialiseAttribution = (manifestJsonld, mediaMode, language) => {

  if (!manifestJsonld.requiredStatement && !manifestJsonld.requiredStatement.en[0]) {
    console.log('(no attribution found)');
    return;
  }

  let svgData = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>';
  let htmlAttribution = manifestJsonld.requiredStatement.en[0];

  // TMP CODE TO REMOVE WHEN API RESPONSE SUPPLIES ATTRIBUTION DATA CORRECTLY
  if ($(htmlAttribution).length && $(htmlAttribution).length === 2) {
    let styling = '<style type="text/css">@import url(\'/icons/style.css\');</style>';
    let markup = $(htmlAttribution)[1];
    let x = $(markup);
    x.prepend(styling);
    htmlAttribution = x[0].outerHTML;
  }
  // END TMP CODE TO REMOVE

  let btnInfoEl = $('<button class="btn btn-info" data-name="Info">' + svgData + '</button>');
  let btnInfo = mediaMode === 'image' ? btnInfoEl.appendTo($('.player-wrapper')) : btnInfoEl.insertAfter($('.volume'));

  const attribution = $(htmlAttribution);
  attribution.addClass('attribution');

  // allow other menus to close this menu
  attribution.attr('data-opener', 'Info');

  if (player) {
    btnInfo.after(attribution);
  } else {
    attribution.appendTo($('.player-wrapper'));
  }

  btnInfo.on('open-close', (e, value) => {
    if (value) {
      btnInfo.addClass('open');
    } else {
      btnInfo.removeClass('open');
    }
  });
  setLinkElementData($('[data-name=title]'), manifestJsonld, language);
  attribution.on('click', (e) => {
    if ((e.target.nodeName.toUpperCase() === 'A')) {
      e.stopPropagation();
      return;
    }
    attribution.removeClass('showing');
    btnInfo.removeClass('open');
  });

  btnInfo.on('click', () => {
    if (attribution.is(':visible')) {
      attribution.removeClass('showing');
      btnInfo.removeClass('open');
    } else {
      if (player) {
        player.hidePlayerMenus(player);
      }
      attribution.addClass('showing');
      btnInfo.addClass('open');
    }
  });
};

const getTitle = (manifest, language) => {
  if (manifest.label) {
    if (language && manifest.label[language]) {
      return manifest.label[language];
    } else {
      return manifest.label[Object.keys(manifest.label)[0]];
    }
  } else {
    return null;
  }
};

export const setLinkElementData = ($el, manifest, language) => {
  if (manifest.label) {
    if (language && manifest.label[language]) {
      $el.text(manifest.label[language]);
    } else {
      $el.text(manifest.label[Object.keys(manifest.label)[0]]);
    }
  }
  if (manifest.seeAlso && manifest.seeAlso.length > 0 && manifest.seeAlso[0].id) {
    let url = manifest.seeAlso[0].id;
    url = url.replace('api/v2', 'portal').replace('json-ld', 'html');
    $el.attr({
      href: url,
      target: '_blank',
      rel: 'noopener'
    });
  }
};

export const initialiseEmbed = (mediaMode, language) => {

  playerWrapper.removeClass('loading');

  let manifestJsonld = player.manifest.__jsonld;

  initialiseAttribution(manifestJsonld, mediaMode, language);
  setLinkElementData($('.title-link'), manifestJsonld, language);

  player.setTitle(getTitle(manifestJsonld, language));

  if (duration === -1 && manifestJsonld.items[0].duration) {
    duration = manifestJsonld.items[0].duration;
  }
};

export const initialisePlayer = (mediaUrl, mediaMode, language) => {
  let p = new EuropeanaMediaPlayer(playerWrapper, { manifest: mediaUrl }, { mode: 'player', manifest: mediaUrl, language });

  player = p.player;

  player.avcomponent.on('mediaerror', () => {
    console.log('mediaerror (reinit)');
    initialiseEmbed(mediaMode, language);
  });
  player.avcomponent.on('mediaready', () => {
    console.log('mediaready (reinit)');
    if (mediaMode === 'audio') {
      $('.eups-player').removeAttr('style');
    }
    initialiseEmbed(mediaMode, language);
  });
};
