#!/bin/bash

# Define the environment file paths
ENV_EXAMPLE=".env.example"
ENV_FILE=".env"

# Check if .env already exists
if [ -f "$ENV_FILE" ]; then
    read -p "A .env file already exists. Do you want to overwrite it? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled. Existing .env file was preserved."
        exit 1
    fi
fi

# Check if .env.example exists
if [ ! -f "$ENV_EXAMPLE" ]; then
    echo "Error: .env.example file not found!"
    exit 1
fi

# Copy .env.example to .env
cp "$ENV_EXAMPLE" "$ENV_FILE"

# Make the script executable
chmod +x "$ENV_FILE"

echo "Environment file created successfully!"
echo "Your .env file is ready at: $(pwd)/$ENV_FILE"
echo "Please review and update the values as needed."

# Display the current values
echo -e "\nCurrent environment variables:"
echo "--------------------------------"
cat "$ENV_FILE" 