#!/bin/bash

# A simple script to test the Open Graph image generation API endpoint.
# It takes a base URL and an Ad ID as arguments, curls the endpoint,
# and saves the output to a file named 'og_image_test_output.png'.

# --- Configuration ---
DEFAULT_BASE_URL="http://localhost:9002"
# This is the Ad ID for the "Sharp White Chevrolet Silverado"
DEFAULT_AD_ID="6961d6fd-23c6-4340-9e2b-5245cd3b0c6d"
OUTPUT_FILE="og_image_test_output.png"

# --- Script ---

# Use provided arguments or fall back to defaults
BASE_URL=${1:-$DEFAULT_BASE_URL}
AD_ID=${2:-$DEFAULT_AD_ID}

# The OG image URL no longer needs query parameters. It's a clean URL.
OG_IMAGE_FULL_URL="${BASE_URL}/api/og/${AD_ID}"

echo "--- Testing Open Graph Image Generation ---"
echo "This script directly fetches the OG image from the API route."
echo ""
echo "Fetching image from: ${OG_IMAGE_FULL_URL}"
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
