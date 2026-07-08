#!/bin/sh
set -e

# Create a javascript file that populates a global variable
ENV_CONFIG_FILE="/usr/share/nginx/html/env-config.js"

# Base64-encode the raw PEM CA so it satisfies certificate-authority-data and
# collapses to a single line for safe injection below. Works on both busybox
# (no wrapping) and coreutils (wraps at 76, so strip newlines with tr).
CLUSTER_CA_CERTIFICATE_B64=$(printf '%s' "${CLUSTER_CA_CERTIFICATE:-}" | base64 | tr -d '\n')

echo "window._env_ = {" > $ENV_CONFIG_FILE
echo "  CAPTAIN_DOMAIN: \"${CAPTAIN_DOMAIN:-localhost}\"," >> $ENV_CONFIG_FILE
echo "  INTERNAL_LB_ENABLED: \"${INTERNAL_LB_ENABLED:-FALSE}\"," >> $ENV_CONFIG_FILE
echo "  KUBEADM_ENABLED: \"${KUBEADM_ENABLED:-FALSE}\"," >> $ENV_CONFIG_FILE
echo "  GOLDILOCKS_ENABLED: \"${GOLDILOCKS_ENABLED:-FALSE}\"," >> $ENV_CONFIG_FILE
echo "  CLUSTER_CA_CERTIFICATE: \"${CLUSTER_CA_CERTIFICATE_B64}\"" >> $ENV_CONFIG_FILE
echo "};" >> $ENV_CONFIG_FILE

echo "Generated runtime config at $ENV_CONFIG_FILE"

exec nginx -g "daemon off;"