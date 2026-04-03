FROM caddy:alpine

# Copy the Caddyfile configuration
COPY Caddyfile /etc/caddy/Caddyfile

# Copy the static website content
COPY public /srv/mjw

# Expose the Cloud Run port
EXPOSE 8080
