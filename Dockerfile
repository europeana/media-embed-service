# Builds an image with the client-side JS bundle for the media embed service,
# served by an NGINX with support for Europeana identifier URL paths.

FROM nginx:stable-alpine

ENV EUROPEANA_IIIF_PRESENTATION_API_URL=https://iiif.europeana.eu/presentation \
    EUROPEANA_IIIF_PRESENTATION_API_KEY= \
    CHROMEDRIVER_SKIP_DOWNLOAD=true \
    GECKODRIVER_SKIP_DOWNLOAD=true \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

RUN rm -r /usr/share/nginx/html && \
    mkdir /build

COPY docker/etc/nginx /etc/nginx
COPY . /build

# TODO: git is only needed to install NPM packages direct from GitHub. Remove
#       when no longer needed.
RUN apk add --no-cache nodejs npm git && \
    cd /build && \
    npm install && \
    NODE_ENV=production npm run build && \
    apk del nodejs npm git && \
    mv public /usr/share/nginx/html && \
    cd && rm -r /build
