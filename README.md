About
===
Kuso-Services is a companion microservice to the Kuso-Bot Discord bot. It provides an API for reading the Kusogrande schedule hosted in Google Docs. The API exposed is documented using swagger-jsdoc so it's available in swagger source in the source code but visiting /api-docs.json or /api/v1/ will render the swagger.


Deploying
===
It's built on Docker generally tailored for use on Dokku (though most of the additional work is in configuring dokku). I'm using Dokku for deployments for two reasons:
  1. I already have Dokku configured on a DigitalOcean droplet
  2. I don't want to pay $60/mo to run a Deis kubernetes cluster (it's not entirely clear if Deis can run on anything less than 4gb ram/host)


Dokku
---
Some general steps for deploying on Dokku (may not include other dokku setup proceedures)
```bash
# Create an app
dokku apps:create kuso-services

#Configure the app
dokku config:set kuso-services NODE_ENV=production ...

#Create the Docker network
docker network create --drive bridge kuso-network

#Configure Dokku to attach to the network
dokku docker-options:add deploy kuso-services "--network kuso-network"
```

After deploying you can check to make sure kuso-services attached to the network and DNS is working correctly.
```bash
# check the to see that kuso-services.web.1 is listed in the network
docker network inspect kuso-network

# attach a busybox to the network
docker run -it --rm --network=kuso-network busybox

# in the busybox wget the kuso-services host to ensure DNS connectivity works
get -qO- kuso-services.web.1:3000
```

### Note about Dokku VHOSTs
At the time of writing kuso-services deploys to port 3000, and Dokku's default nginx configuration will render the default app if nothing is exposed on port 80. In my case this meant another unrelated project showing up on kuso-services.dysio.de. They explain how to change that behavior in the [Domains Documentation](http://dokku.viewdocs.io/dokku/configuration/domains/#default-site).

I used their configuration wholesale, and created a file at `/etc/nginx/conf.d/00-default-vhost.conf` including:
```nginx
server {
  listen 80 default_server;
  listen [::]:80 default_server;

  server_name _;
  return 410;
  log_not_found off;
}
```
