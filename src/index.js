import './index.scss';

const EuropeanaMediaPlayer = require('europeanamediaplayer').default;

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
let manifest;
let player;
let timeoutMouseMove;
export { player };

let windowLocationHref = window.location.href;

export const setWindowLocation = (url) => {
  windowLocationHref = url;
};

window.addEventListener('load', () => {

  const urlParams = new URL(windowLocationHref).searchParams;

  if (urlParams.get('manifest')) {

    loadJSON(urlParams.get('manifest'), (manifestData) => {

      let mediaMode = manifestData.items[0].items[0].items[0].body.type.toLowerCase();
      $('.player-wrapper').addClass(mediaMode);

      manifest = urlParams.get('manifest');

      if (urlParams.get('width') && urlParams.get('height')) {
        setEmbedDimensions(urlParams.get('width'), urlParams.get('height'), mediaMode === 'image');
      }
      if (['audio', 'video'].indexOf(mediaMode) > -1) {
        initialisePlayer($('.player-wrapper'), manifest, mediaMode);
      } else if (mediaMode === 'image') {
        const rootItem = manifestData.items[0];
        const imgUrl = rootItem.items[0].items[0].body.id;
        const xywhParam = urlParams.get('xywh');
        if (!(xywhParam && handleMediaFragment(imgUrl, rootItem.width, rootItem.height, urlParams))) {
          $('.player-wrapper').append(`<img src="${manifestData.items[0].items[0].items[0].body.id}" alt="">`);
        }
        $('.player-wrapper').removeClass('loading');
        initialiseAttribution(manifestData.items[0], mediaMode);
      }
    });
  } else {
    console.log('no manifest supplied');
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

  $('.player-wrapper').append('<div class="xywh-img-wrapper"><div class="xywh-img"'
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
    $('.player-wrapper').css('padding-top', `${pct}%`);
  }
};

export const initialiseAttribution = (manifestJsonld, mediaMode) => {
  if (!manifestJsonld.requiredStatement && !manifestJsonld.requiredStatement.en[0]) {
    console.log('(no attribution found)');
    return;
  }

  const pw = $('.player-wrapper');

  pw.on('mousemove', () => {
    pw.addClass('moving');
    if (timeoutMouseMove) {
      window.clearTimeout(timeoutMouseMove);
    }
    timeoutMouseMove = setTimeout(() => {
      pw.removeClass('moving');
    }, 3000);
  });

  $('.options-container').on('mouseenter', () => {
    pw.addClass('force-controls');
  });

  $('.options-container').on('mouseleave', () => {
    pw.removeClass('force-controls');
  });

  let svgData = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>';
  let htmlAttribution = manifestJsonld.requiredStatement.en[0];

  // TMP CODE TO REMOVE WHEN API RESPONSE SUPPLIES THIS
  if ($(htmlAttribution).length && $(htmlAttribution).length === 2) {
    let styling = '<style type="text/css">@import url(\'/icons/style.css\');</style>';
    let markup = $(htmlAttribution)[1];
    let x = $(markup);
    x.prepend(styling);
    htmlAttribution = x[0].outerHTML;
  }
  // END TMP CODE TO REMOVE

  let btnInfoEl = $('<a class="btn btn-info" data-name="Info">' + svgData + '</a>');
  let btnInfo = mediaMode === 'image' ? btnInfoEl.appendTo($('.info')) : btnInfoEl.insertAfter($('.time-display'));
  let attribution;

  if (player) {
    attribution = $(htmlAttribution).addClass('attribution').appendTo($('.canvas-container'));
    // allow other menus to close this menu
    attribution.attr('data-opener', 'Info');
  } else {
    attribution = $(htmlAttribution).addClass('attribution').appendTo($('.info'));
  }

  btnInfo.on('open-close', (e, value) => {
    if (value) {
      btnInfo.addClass('open');
    } else {
      btnInfo.removeClass('open');
    }
  });

  setLinkElementData($('[data-name=title]'), manifestJsonld);

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

export const setLinkElementData = ($el, manifest) => {
  if (manifest.label) {
    const text = manifest.label[Object.keys(manifest.label)[0]];
    $el.text(text);
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

export const initialiseEmbed = (mediaMode) => {

  $('.player-wrapper').removeClass('loading');

  let manifestJsonld = player.manifest.__jsonld;

  initialiseAttribution(manifestJsonld, mediaMode);
  setLinkElementData($('.title-link'), manifestJsonld);
  $('.logo-link').removeAttr('style');

  if (duration === -1 && manifestJsonld.items[0].duration) {
    duration = manifestJsonld.items[0].duration;
  }
};

export const initialisePlayer = (playerWrapper, mediaUrl, mediaMode) => {
  let p = new EuropeanaMediaPlayer(playerWrapper, { manifest: mediaUrl }, { mode: 'player', manifest: mediaUrl });
  player = p.player;

  player.avcomponent.on('mediaerror', () => {
    console.log('mediaerror (reinit)');
    initialiseEmbed(mediaMode);
  });
  player.avcomponent.on('mediaready', () => {
    console.log('mediaready (reinit)');
    if (mediaMode === 'audio') {
      $('.eups-player').removeAttr('style');
    }
    initialiseEmbed(mediaMode);
  });
  player.avcomponent.on('play', () => {
    playerWrapper.addClass('playing');
  });
  player.avcomponent.on('pause', () => {
    playerWrapper.removeClass('playing');
  });
};
