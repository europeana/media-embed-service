# Media Embed Service

[![Build Status](https://travis-ci.com/europeana/media-embed-service.svg?branch=master)](https://travis-ci.com/europeana/media-embed-service)

Created as part of the [Europeana Media Project](https://pro.europeana.eu/project/europeana-media)

### Build Setup

Install package dependencies:
* `npm install`

Optionally, create a `.env` file:
* `copy .env.example`
* `supply values for:`
  * EUROPEANA_IIIF_PRESENTATION_API_URL

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

### Development Server

Run:
* `npm run start:dev`

to starts a dev server on port 9001.

### Build for production

Build and run for production with the supplied [Dockerfile](./Dockerfile):

```
docker build -t europeana/media-embed-service .
docker run \
  --restart=unless-stopped --port 8080:80 \
  --detach --name europeana-media-embed-service \
  europeana/media-embed-service
```

Pre-built, versioned images are published to
[Docker Hub](https://hub.docker.com/r/europeana/media-embed-service):
```
docker pull europeana/media-embed-service:${VERSION}
docker run \
  --restart=unless-stopped --port 8080:80 \
  --detach --name europeana-media-embed-service \
  europeana/media-embed-service:${VERSION}
```

### Use

The server will return a blank page unless url parameters are supplied to specify the media.  

The following parameters are accepted:
* path: the record identifier of an item in Europeana
* manifest: optionally to using the path, the uri-encoded reference to the Europeana Manifest of an item
* width: the preferred (max) width of the embed
* height: the preferred (max) height of the embed
* xywh: the region (of an image) to show, specifiable as:
  * a comma-delimited list of absolute values
  * a comma-delimited list of percentages values

### Examples

* [audio](https://embed.europeana.eu/2059213/data_sounds_8961?width=960&height=320)
* [video](https://embed.europeana.eu/2051926/data_euscreenXL_EUS_3C083B8925D2E14C954507769E47992A)
* [image](https://embed.europeana.eu/2021672/resource_document_mauritshuis_670?width=800&height=300)
* [image](https://embed.europeana.eu/2021672/resource_document_mauritshuis_670?xywh=2534,0,2534,3000&width=800&height=300) (cropped)
* [image](https://embed.europeana.eu/2021672/resource_document_mauritshuis_670?xywh=percent:0,0,50,50) (cropped using percentages)


## License

Licensed under the EUPL v1.2.

For full details, see [LICENSE.md](LICENSE.md).
