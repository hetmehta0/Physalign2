#!/bin/bash

# Navigate to the project directory
cd /Users/ap/Downloads/phsy

# Initialize git repository
git init

# Add README.md file
git add README.md

# Make first commit
git commit -m "first commit"

# Rename branch to main
git branch -M main

# Add remote origin (replace with your actual repository URL)
git remote add origin https://github.com/AKZYP/PhysAlign.git

# Push to GitHub
git push -u origin main

# Add all other files
git add .

# Make second commit with all project files
git commit -m "Initial commit with all project files"

# Push all files
git push

echo "Git repository setup complete!"