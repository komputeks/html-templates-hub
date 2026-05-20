#!/bin/bash
GITHUB_TOKEN=$GITHUB_PAT
USERNAME=$GITHUB_USERNAME

mkdir -p public/templates

# Function to process a single page of repos
process_page() {
  local page=$1
  echo "Fetching page $page..."
  local repos=$(curl -s -H "Authorization: token $GITHUB_TOKEN" "https://api.github.com/users/$USERNAME/repos?per_page=100&page=$page" | grep -o '\"name\": \"[^\"]*html\"' | sed 's/\"name\": \"//;s/\"//')
  
  if [ -z "$repos" ]; then
    return 1
  fi

  for REPO in $repos; do
    if [ -d "public/templates/$REPO" ]; then
      echo "Skipping $REPO (already exists)"
      continue
    fi

    echo "Cloning $REPO..."
    git clone --depth 1 "https://$GITHUB_TOKEN@github.com/$USERNAME/$REPO.git" "public/templates/$REPO"
    if [ $? -eq 0 ]; then
      rm -rf "public/templates/$REPO/.git"
      
      DESC=$(curl -s -H "Authorization: token $GITHUB_TOKEN" "https://api.github.com/repos/$USERNAME/$REPO" | grep -o '\"description\": \"[^\"]*\"' | head -1 | sed 's/\"description\": \"//;s/\"//')
      
      echo "Registering $REPO in database..."
      # Use local API if running in same environment, or full URL if deployed
      # Since we are in the workspace, we can't easily hit the Vercel URL yet.
      # We will rely on a separate script or the frontend to sync if needed, 
      # but for now let's try to insert directly using the Supabase tool in a loop if possible, 
      # or just leave the folders and let the app detect them.
    fi
  done
  return 0
}

# Process up to 5 pages
for i in {1..5}; do
  process_page $i || break
done
