#!/bin/bash

# A simple script to test the Open Graph image generation API endpoint.
# It takes a base URL and an Ad ID as arguments, curls the endpoint,
# and saves the output to a file named 'og_image_test_output.png'.

# --- Configuration ---
DEFAULT_BASE_URL="https://adcraft-ai-cogmora.vercel.app"
DEFAULT_AD_ID="6961d6fd-23c6-4340-9e2b-5245cd3b0c6d"
OUTPUT_FILE="og_image_test_output.png"

# --- Script ---

# Use provided arguments or fall back to defaults
BASE_URL=${1:-$DEFAULT_BASE_URL}
AD_ID=${2:-$DEFAULT_AD_ID}

# Construct the full API URL
API_URL="${BASE_URL}/api/og/${AD_ID}"

echo "--- Testing Open Graph Image API ---"
echo "Target URL: ${API_URL}"
echo "Saving output to: ${OUTPUT_FILE}"
echo ""

# Use curl to make the request and save the output
# -s: Silent mode (don't show progress meter)
# -L: Follow redirects
# -o: Write output to file
# -w: Write out the HTTP status code
HTTP_STATUS=$(curl -s -L -o "${OUTPUT_FILE}" -w "%{http_code}" "${API_URL}")

echo ""
echo "--- Results ---"
echo "HTTP Status Code: ${HTTP_STATUS}"

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
    echo "❌ Error: The request failed with HTTP status ${HTTP_STATUS}."
    echo "The server returned an error. The content of the response is saved in ${OUTPUT_FILE}."
    echo "Content of ${OUTPUT_FILE}:"
    cat "${OUTPUT_FILE}"
fi

echo "--- Test Complete ---"
