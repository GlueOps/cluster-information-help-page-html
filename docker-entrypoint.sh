#!/bin/sh
set -e

# Create a javascript file that populates a global variable
ENV_CONFIG_FILE="/usr/share/nginx/html/env-config.js"

echo "window._env_ = {" > $ENV_CONFIG_FILE
echo "  CAPTAIN_DOMAIN: \"${CAPTAIN_DOMAIN:-localhost}\"," >> $ENV_CONFIG_FILE
echo "  INTERNAL_LB_ENABLED: \"${INTERNAL_LB_ENABLED:-FALSE}\"" >> $ENV_CONFIG_FILE
echo "};" >> $ENV_CONFIG_FILE

echo "Generated runtime config at $ENV_CONFIG_FILE"

exec nginx -g "daemon off;"