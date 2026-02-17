
#!/bin/sh

# Replace environment variables in the built JavaScript files
# This allows us to use environment variables at runtime instead of build time

echo "Injecting environment variables..."

# Find the main JS file (it will have a hash in the name)
MAIN_JS_FILE=$(find /usr/share/nginx/html/assets -name "index-*.js" | head -1)

if [ -n "$MAIN_JS_FILE" ]; then
    echo "Found main JS file: $MAIN_JS_FILE"
    
    # Replace the placeholder values with actual environment variables
    if [ -n "$CAPTAIN_DOMAIN" ]; then
        sed -i "s|CAPTAIN_DOMAIN_PLACEHOLDER|$CAPTAIN_DOMAIN|g" "$MAIN_JS_FILE"
        echo "Replaced CAPTAIN_DOMAIN_PLACEHOLDER with: $CAPTAIN_DOMAIN"
    fi

    # Replace INTERNAL_LB_ENABLED placeholder (default: FALSE)
    INTERNAL_LB_VALUE="${INTERNAL_LB_ENABLED:-FALSE}"
    sed -i "s|INTERNAL_LB_ENABLED_PLACEHOLDER|$INTERNAL_LB_VALUE|g" "$MAIN_JS_FILE"
    echo "Replaced INTERNAL_LB_ENABLED_PLACEHOLDER with: $INTERNAL_LB_VALUE"
else
    echo "Warning: Could not find main JS file"
fi

# Also replace in HTML files if they exist
HTML_FILES=$(find /usr/share/nginx/html -name "*.html")
for HTML_FILE in $HTML_FILES; do
    if [ -f "$HTML_FILE" ]; then
        echo "Processing HTML file: $HTML_FILE"
        if [ -n "$CAPTAIN_DOMAIN" ]; then
            sed -i "s|CAPTAIN_DOMAIN_PLACEHOLDER|$CAPTAIN_DOMAIN|g" "$HTML_FILE"
            echo "Replaced CAPTAIN_DOMAIN_PLACEHOLDER in $HTML_FILE with: $CAPTAIN_DOMAIN"
        fi
        INTERNAL_LB_VALUE="${INTERNAL_LB_ENABLED:-FALSE}"
        sed -i "s|INTERNAL_LB_ENABLED_PLACEHOLDER|$INTERNAL_LB_VALUE|g" "$HTML_FILE"
    fi
done

echo "Environment variable injection complete"
echo "Starting nginx..."

# Start nginx directly
nginx -g "daemon off;"