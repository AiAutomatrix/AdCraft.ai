#!/bin/bash

# A simple script to test the Open Graph image generation API endpoint.
# It takes a base URL and an Ad ID as arguments, curls the endpoint,
# and saves the output to a file named 'og_image_test_output.png'.

# --- Configuration ---
DEFAULT_BASE_URL="https://adcraft-ai-cogmora.vercel.app"
# This is the Ad ID for the "Sharp White Chevrolet Silverado"
DEFAULT_AD_ID="6961d6fd-23c6-4340-9e2b-5245cd3b0c6d"
# The public user ID for this ad
DEFAULT_USER_ID="AeTPE84GYyVMM7o0vmJAldCUfQ72"
OUTPUT_FILE="og_image_test_output.png"

# --- Script ---

# Use provided arguments or fall back to defaults
BASE_URL=${1:-$DEFAULT_BASE_URL}
USER_ID=${2:-$DEFAULT_USER_ID}
AD_ID=${3:-$DEFAULT_AD_ID}

# Construct the full public page URL that the crawler will hit
# We need to hit the profile page, which in turn generates the correct meta tags
# pointing to the OG image API.
PUBLIC_PAGE_URL="${BASE_URL}/profile/${USER_ID}?ad=${AD_ID}"

echo "--- Testing Open Graph Image Generation ---"
echo "This script simulates a social media crawler."
echo ""
echo "Step 1: Fetching the public ad page to find the 'og:image' URL..."
echo "Public Page URL: ${PUBLIC_PAGE_URL}"

# Use curl and grep to extract the og:image URL from the HTML
# -s: Silent mode
# -L: Follow redirects
# grep -oP: Use Perl-compatible regex to find and output only the matching part
# sed 's/&amp;/\&/g': Replace HTML-encoded ampersands with actual ampersands
OG_IMAGE_URL_RAW=$(curl -s -L "${PUBLIC_PAGE_URL}" | grep -oP 'property="og:image"\s*content="\K[^"]+')

if [ -z "$OG_IMAGE_URL_RAW" ]; then
    echo ""
    echo "❌ Error: Could not find the 'og:image' meta tag on the page."
    echo "Please check if the page at ${PUBLIC_PAGE_URL} is loading correctly and has the right meta tags."
    echo "--- Test Complete ---"
    exit 1
fi

# The extracted URL is relative, so we need to prepend the base URL
OG_IMAGE_FULL_URL="${BASE_URL}${OG_IMAGE_URL_RAW}"

echo "Found 'og:image' URL: ${OG_IMAGE_FULL_URL}"
echo ""

echo "Step 2: Fetching the generated image..."
echo "Saving output to: ${OUTPUT_FILE}"

# Use curl to make the request to the actual OG image URL and save the output
# -w: Write out the HTTP status code
HTTP_STATUS=$(curl -s -L -o "${OUTPUT_FILE}" -w "%{http_code}" "${OG_IMAGE_FULL_URL}")

echo ""
echo "--- Results ---"
echo "HTTP Status Code from Image API: ${HTTP_STATUS}"

# Check if the request was successful (HTTP 200)
if [ "${HTTP_STATUS}" -eq 200 ]; then
    # Check if the output file is a PNG image
    if file "${OUTPUT_FILE}" | grep -q 'PNG image data'; then
        echo "✅ Success! A valid PNG image was downloaded to ${OUTPUT_FILE}."
        echo "You can open the file to verify its content."
    else
        echo "⚠️ Warning: The request was successful (HTTP 200), but the output is not a valid PNG image."
        echo "The server might be returning an error message as a text response."
        echo "Content of ${OUTPUT_FILE}:"
        cat "${OUTPUT_FILE}"
    fi
else
    echo "❌ Error: The image generation request failed with HTTP status ${HTTP_STATUS}."
    echo "The server returned an error. The content of the response is saved in ${OUTPUT_FILE}."
    echo "Content of ${OUTPUT_FILE}:"
    cat "${OUTPUT_FILE}"
fi

echo "--- Test Complete ---"
