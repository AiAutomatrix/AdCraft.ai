#!/bin/bash

# A script to test uploading a file to your Firebase Storage bucket.

# --- Configuration ---
# Your Firebase Storage bucket name, found in firebase/config.ts
BUCKET_NAME="studio-494843406-f3e2e.appspot.com"
# A public URL for a test image
IMAGE_URL="https://images.unsplash.com/photo-1568605114967-8130f3a36994"
# The name we'll give the downloaded file locally
LOCAL_FILE_NAME="storage_test_image.jpg"
# The destination path within your bucket
DESTINATION_PATH="gs://${BUCKET_NAME}/automated-test-uploads/house-image-1.jpg"

# --- Script ---
echo "--- Starting Firebase Storage Upload Test ---"

# 1. Download the test image using curl
echo "Step 1: Downloading test image from ${IMAGE_URL}..."
curl -s -L -o "${LOCAL_FILE_NAME}" "${IMAGE_URL}"

# Check if the download was successful
if [ ! -f "$LOCAL_FILE_NAME" ]; then
    echo "Error: Failed to download the image. Please check the IMAGE_URL."
    exit 1
fi
echo "Download successful. Image saved as ${LOCAL_FILE_NAME}"

# 2. Upload the image to Firebase Storage using gcloud
echo ""
echo "Step 2: Uploading ${LOCAL_FILE_NAME} to ${DESTINATION_PATH}..."
# The 'gcloud storage cp' command copies files to a bucket.
# It uses the logged-in credentials of the environment.
gcloud storage cp "${LOCAL_FILE_NAME}" "${DESTINATION_PATH}"

# Check the exit code of the gcloud command
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Success! File uploaded successfully."
    echo "You can now go to the Firebase Console -> Storage section to see the uploaded file at 'automated-test-uploads/house-image-1.jpg'."
else
    echo ""
    echo "❌ Error: File upload failed. Please check your storage rules in 'storage.rules' and the bucket name in this script."
    echo "This might be a permissions issue. Your current rules should allow this if they are deployed correctly."
fi

# 3. Clean up the local file
echo ""
echo "Step 3: Cleaning up local file..."
rm "${LOCAL_FILE_NAME}"
echo "--- Test Complete ---"
