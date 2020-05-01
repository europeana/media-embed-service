# Media Embed Service

[![Build Status](https://travis-ci.com/europeana/media-embed-service.svg?branch=master)](https://travis-ci.com/europeana/media-embed-service)

Created as part of the [Europeana Media Project](https://pro.europeana.eu/project/europeana-media)

### Build Setup

Install package dependencies:
* `npm install`

### Linting
To lint-check the `.js` run:
* `npm run lint`
* `npm run lint:fix`

To lint-check the `.scss` run:

* `npm run lint:style`
* `npm run lint:style:fix`

### Testing

Run unit tests with either of:
* `npm run test`
* `npm test`

Generate a coverage report with:
* `npm run test:coverage`

Run an accessibility test with:
* `npm run test:accessibility`

### Development Server

Run:
* `npm run start:dev`

to starts a dev server on port 9001.

### Build for production

`npm run build`

### Use

The server will return a blank page unless url parameters are supplied to specify the media.  The following parameters are accepted:

* manifest: the uri-encoded location the video, audio or image
* width: the preferred (max) width of the embed
* height: the preferred (max) height of the embed
* xywh: the region (of an image) to show, specifiable as:
  * a comma-delimited list of absolute values
  * a comma-delimited list of percentages values

### Examples

* [audio](http://europeana-media-video-embed.eanadev.org/?width=960&height=320&manifest=https%3A%2F%2Fiiif.europeana.eu%2Fpresentation%2F2059213%2Fdata_sounds_8961%2Fmanifest%3Fformat%3D3%26wskey%3Dapi2demo)
* [video](http://europeana-media-video-embed.eanadev.org/?width=960&height=620&manifest=https%3A%2F%2Fiiif-api-test.eanadev.org%2Fpresentation%2F2051926%2Fdata_euscreenXL_EUS_3C083B8925D2E14C954507769E47992A%2Fmanifest%3Fformat%3D3%26wskey%3Dapi2demo)
* [image](http://europeana-media-video-embed.eanadev.org/?width=800&height=300&manifest=https%3A%2F%2Fiiif.europeana.eu%2Fpresentation%2F2021672%2Fresource_document_mauritshuis_670%2Fmanifest%3Fformat%3D3%26wskey%3Dapi2demo)
* [image](http://europeana-media-video-embed.eanadev.org/?xywh=2534,0,2534,3000&width=800&height=300&manifest=https%3A%2F%2Fiiif.europeana.eu%2Fpresentation%2F2021672%2Fresource_document_mauritshuis_670%2Fmanifest%3Fformat%3D3%26wskey%3Dapi2demo) (cropped)
* [image](http://europeana-media-video-embed.eanadev.org/?xywh=percent:0,0,50,50&width=800&height=300&manifest=https%3A%2F%2Fiiif.europeana.eu%2Fpresentation%2F2021672%2Fresource_document_mauritshuis_670%2Fmanifest%3Fformat%3D3%26wskey%3Dapi2demo) (cropped using percentages)
