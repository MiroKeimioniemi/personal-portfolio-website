#!/bin/bash

# Automatically post new blog posts to Bluesky and update front matter
# This script runs before each git commit via the pre-commit hook

set +e  # Don't exit on error - process all files even if some fail

# Colors for friendly output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ============================================================================
# Load Configuration
# ============================================================================

# Find .env file (check root first, then blog directory)
if [ -f .env ]; then
    ENV_FILE=".env"
elif [ -f blog/.env ]; then
    ENV_FILE="blog/.env"
else
    echo -e "${RED}Error: .env file not found${NC}"
    echo "Create a .env file with your Bluesky credentials (see .env.example)"
    exit 1
fi

# Load environment variables
export $(grep -v '^#' "$ENV_FILE" | xargs)

# Check required variables
if [ -z "$BSKY_HANDLE" ] || [ -z "$BSKY_APP_PASSWORD" ]; then
    echo -e "${RED}Error: Missing BSKY_HANDLE or BSKY_APP_PASSWORD in .env${NC}"
    exit 1
fi

# Blog base URL (default if not set)
BASE_URL="${BLOG_BASE_URL:-https://mirokeimioniemi.com/writing}"

# ============================================================================
# Helper Functions
# ============================================================================

# Check if a post already has a Bluesky URL
has_bluesky_url() {
    grep -q "^bsky:" "$1"
}

# Get title from front matter
get_title() {
    local file="$1"
    # Extract title line and remove quotes
    grep "^title:" "$file" | sed 's/^title:[[:space:]]*"\(.*\)"$/\1/' | sed "s/^title:[[:space:]]*'\(.*\)'$/\1/" | sed 's/^title:[[:space:]]*\(.*\)$/\1/'
}

# Get section name from file path (blog, creative-writing, or academic-writing)
get_section() {
    local file="$1"
    if echo "$file" | grep -q "creative-writing"; then
        echo "creative-writing"
    elif echo "$file" | grep -q "academic-writing"; then
        echo "academic-writing"
    else
        echo "blog"
    fi
}

# Get subfolder path relative to content directory (e.g., "book-reviews" from "blog/content/blog/book-reviews/file.md")
get_subfolder_path() {
    local file="$1"
    local section=$(get_section "$file")
    
    # Extract path after blog/content/{section}/
    if echo "$file" | grep -q "blog/content/$section/"; then
        # Get everything after blog/content/{section}/
        local subpath=$(echo "$file" | sed "s|.*blog/content/$section/||")
        # Remove the filename, keep only directory path
        local dirpath=$(dirname "$subpath")
        # If dirpath is ".", return empty (file is in root of section)
        if [ "$dirpath" = "." ]; then
            echo ""
        else
            echo "$dirpath"
        fi
    else
        echo ""
    fi
}

# Convert filename to URL slug
get_slug() {
    local file="$1"
    local filename=$(basename "$file" .md)
    # Make lowercase, replace spaces/special chars with hyphens
    echo "$filename" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g'
}

# Build the full post URL
build_post_url() {
    local file="$1"
    local section=$(get_section "$file")
    local subfolder=$(get_subfolder_path "$file")
    local filename=$(basename "$file" .md)
    local slug=""
    
    # Only include slug if filename is not "index"
    if [ "$filename" != "index" ]; then
        slug=$(get_slug "$file")
    fi
    
    # Build URL:
    # - If filename is "index", use subfolder as the URL (e.g., /blog/markdown-cheat-sheet/)
    # - If filename is not "index", ignore subfolder and use just the slug (e.g., /blog/review-of-thinking-fast-and-slow/)
    if [ "$filename" = "index" ] && [ -n "$subfolder" ]; then
        # index.md in subfolder: use subfolder as URL
        echo "$BASE_URL/$section/$subfolder/"
    elif [ -n "$slug" ]; then
        # Regular file: ignore subfolder, use slug directly
        echo "$BASE_URL/$section/$slug/"
    else
        # Fallback
        echo "$BASE_URL/$section/"
    fi
}

# ============================================================================
# Bluesky API Functions
# ============================================================================

# Login to Bluesky and get access token
login_to_bluesky() {
    local handle="$1"
    local password="$2"
    
    # Call Bluesky API to create session
    local response=$(curl -s -X POST "https://bsky.social/xrpc/com.atproto.server.createSession" \
        -H "Content-Type: application/json" \
        -d "{\"identifier\":\"$handle\",\"password\":\"$password\"}")
    
    # Check for errors
    if echo "$response" | grep -q '"error"'; then
        echo "ERROR"
        return 1
    fi
    
    # Extract access token (simple grep/sed approach)
    local token=$(echo "$response" | grep -o '"accessJwt":"[^"]*"' | sed 's/"accessJwt":"\([^"]*\)"/\1/')
    local did=$(echo "$response" | grep -o '"did":"[^"]*"' | sed 's/"did":"\([^"]*\)"/\1/')
    
    if [ -z "$token" ] || [ -z "$did" ]; then
        echo "ERROR"
        return 1
    fi
    
    echo "$token|$did"
}

# Post to Bluesky
post_to_bluesky() {
    local token="$1"
    local did="$2"
    local text="$3"
    local url="$4"  # URL is passed as separate parameter
    
    # Calculate byte positions for the URL in the UTF-8 encoded text
    # Text format is: "Title\n\nURL"
    # We know the format, so calculate directly: title + 2 newlines
    # Extract title (first line) and count bytes
    local title_part=$(printf '%s' "$text" | head -n 1)
    local title_bytes=$(printf '%s' "$title_part" | wc -c)
    # Add 2 bytes for the two newlines (\n\n)
    local byte_start=$((title_bytes + 2))
    
    # Calculate URL byte length
    local url_byte_length=$(printf '%s' "$url" | wc -c)
    local byte_end=$((byte_start + url_byte_length))
    
    # Escape text for JSON:
    # 1. Escape backslashes (must be first)
    # 2. Escape quotes
    # 3. Replace actual newlines with \n
    local escaped_text=$(printf '%s' "$text" | \
        sed 's/\\/\\\\/g' | \
        sed 's/"/\\"/g' | \
        sed ':a;N;$!ba;s/\n/\\n/g')
    
    # Escape URL for JSON (in the URI field)
    local escaped_url=$(printf '%s' "$url" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g')
    
    # Build JSON payload with facets for link detection
    # According to docs: facets array with index (byteStart, byteEnd) and features (link type with uri)
    local created_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    local json_payload="{\"repo\":\"$did\",\"collection\":\"app.bsky.feed.post\",\"record\":{\"\$type\":\"app.bsky.feed.post\",\"text\":\"$escaped_text\",\"createdAt\":\"$created_at\",\"facets\":[{\"index\":{\"byteStart\":$byte_start,\"byteEnd\":$byte_end},\"features\":[{\"\$type\":\"app.bsky.richtext.facet#link\",\"uri\":\"$escaped_url\"}]}]}}"
    
    local response=$(curl -s -X POST "https://bsky.social/xrpc/com.atproto.repo.createRecord" \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json" \
        -d "$json_payload")
    
    # Check for errors
    if echo "$response" | grep -q '"error"'; then
        echo "ERROR"
        return 1
    fi
    
    # Extract post URI and convert to web URL
    local post_uri=$(echo "$response" | grep -o '"uri":"[^"]*"' | sed 's/"uri":"\([^"]*\)"/\1/')
    local post_id=$(echo "$post_uri" | sed 's/.*\///')
    echo "https://bsky.app/profile/$BSKY_HANDLE/post/$post_id"
}

# ============================================================================
# Front Matter Update
# ============================================================================

# Add or update bsky field in front matter
update_front_matter() {
    local file="$1"
    local bsky_url="$2"
    
    # Escape URL for sed (escape backslashes first, then other special chars)
    local safe_url=$(echo "$bsky_url" | sed 's/\\/\\\\/g' | sed 's/[[\.*^$()+?{|]/\\&/g')
    
    # Check if bsky field exists
    if grep -q "^bsky:" "$file"; then
        # Update existing field
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|^bsky:.*|bsky: \"$safe_url\"|" "$file"
        else
            sed -i "s|^bsky:.*|bsky: \"$safe_url\"|" "$file"
        fi
    else
        # Add new field before closing --- of front matter
        # Find the line number of the SECOND --- (closing front matter, not the last one in file)
        local dash_lines=$(grep -n "^---" "$file" | cut -d: -f1)
        local first_dash=$(echo "$dash_lines" | head -1)
        local second_dash=$(echo "$dash_lines" | head -2 | tail -1)
        
        if [ -z "$second_dash" ] || [ "$second_dash" -le "$first_dash" ]; then
            echo -e "${RED}  ✗ No valid front matter found in file (missing closing ---)${NC}"
            return 1
        fi
        
        # Insert before the second --- (which closes the front matter)
        local insert_line=$((second_dash - 1))
        
        # Use awk for more reliable insertion
        local temp_file="${file}.tmp"
        awk -v line="$insert_line" -v url="$bsky_url" '
            NR == line { print; print "bsky: \"" url "\""; next }
            { print }
        ' "$file" > "$temp_file"
        
        if [ $? -eq 0 ] && [ -f "$temp_file" ]; then
            mv "$temp_file" "$file"
        else
            echo -e "${RED}  ✗ Failed to update front matter${NC}"
            rm -f "$temp_file" 2>/dev/null
            return 1
        fi
    fi
}

# ============================================================================
# Main Processing
# ============================================================================

# Process a single markdown file
process_post() {
    local file="$1"
    
    # Skip creative writing posts
    if echo "$file" | grep -q "creative-writing"; then
        echo -e "${YELLOW}→ Skipping creative writing: $(basename "$file")${NC}"
        return 0
    fi
    
    echo -e "${YELLOW}→ Processing: $(basename "$file")${NC}"
    
    # Skip if already has Bluesky URL
    if has_bluesky_url "$file"; then
        echo -e "${GREEN}  ✓ Already posted to Bluesky, skipping${NC}"
        return 0
    fi
    
    # Get title
    local title=$(get_title "$file")
    if [ -z "$title" ]; then
        echo -e "${RED}  ✗ No title found${NC}"
        return 1
    fi
    
    # Build post URL
    local post_url=$(build_post_url "$file")
    # Format: Title on first line, blank line, then link
    local post_text="$title"$'\n'$'\n'"$post_url"
    
    # Login to Bluesky
    echo -e "${YELLOW}  Logging in...${NC}"
    local session=$(login_to_bluesky "$BSKY_HANDLE" "$BSKY_APP_PASSWORD")
    if [ "$session" = "ERROR" ]; then
        echo -e "${RED}  ✗ Login failed${NC}"
        return 1
    fi
    
    local token=$(echo "$session" | cut -d'|' -f1)
    local did=$(echo "$session" | cut -d'|' -f2)
    
    # Post to Bluesky
    echo -e "${YELLOW}  Posting...${NC}"
    local bsky_url=$(post_to_bluesky "$token" "$did" "$post_text" "$post_url")
    if [ "$bsky_url" = "ERROR" ]; then
        echo -e "${RED}  ✗ Post failed${NC}"
        return 1
    fi
    
    echo -e "${GREEN}  ✓ Posted: $bsky_url${NC}"
    
    # Update front matter
    update_front_matter "$file" "$bsky_url"
    echo -e "${GREEN}  ✓ Updated front matter${NC}"
    
    # Stage the updated file so it's included in the same commit
    git add "$file" 2>/dev/null || true
    
    return 0
}

# ============================================================================
# Main Script
# ============================================================================

main() {
    # Find all markdown files in content directories (including all subfolders)
    local content_dirs=("blog/content/blog" "blog/content/creative-writing" "blog/content/academic-writing")
    local files=()
    
    # Use temp file to collect files (avoids subshell issues)
    local temp_list=$(mktemp 2>/dev/null || echo "/tmp/bluesky_list_$$")
    > "$temp_list"
    
    # Get staged files for each directory
    for dir in "${content_dirs[@]}"; do
        if [ -d "$dir" ]; then
            # Use grep to find files starting with this directory path (handles subfolders)
            git diff --cached --name-only 2>/dev/null | grep "^$dir/" | grep "\.md$" | while IFS= read -r file || [ -n "$file" ]; do
                [ -z "$file" ] && continue
                if [ -f "$file" ] && [ "$(basename "$file")" != "_index.md" ]; then
                    echo "$file" >> "$temp_list"
                fi
            done
        fi
    done
    
    # Read from temp file into array (handle spaces correctly)
    if [ -s "$temp_list" ]; then
        while IFS= read -r file || [ -n "$file" ]; do
            [ -n "$file" ] && files+=("$file")
        done < "$temp_list"
    fi
    rm -f "$temp_list" 2>/dev/null
    
    # Remove duplicates - use temp file to handle spaces correctly
    local unique_files=()
    if [ ${#files[@]} -gt 0 ]; then
        # Use a temp file for deduplication to handle spaces
        local temp_unique=$(mktemp 2>/dev/null || echo "/tmp/bluesky_unique_$$")
        > "$temp_unique"
        for file in "${files[@]}"; do
            echo "$file" >> "$temp_unique"
        done
        # Sort and deduplicate, then read back into array
        local temp_sorted=$(mktemp 2>/dev/null || echo "/tmp/bluesky_sorted_$$")
        sort -u "$temp_unique" > "$temp_sorted"
        while IFS= read -r file || [ -n "$file" ]; do
            [ -n "$file" ] && unique_files+=("$file")
        done < "$temp_sorted"
        rm -f "$temp_unique" "$temp_sorted" 2>/dev/null
    fi
    
    if [ ${#unique_files[@]} -eq 0 ]; then
        echo -e "${GREEN}No new posts to process${NC}"
        return 0
    fi
    
    echo -e "${GREEN}Found ${#unique_files[@]} post(s) to process${NC}"
    # Debug: show which files were found
    for f in "${unique_files[@]}"; do
        echo -e "${YELLOW}  - $f${NC}"
    done
    echo ""
    
    # Process each file
    local success=0
    local failed=0
    
    for file in "${unique_files[@]}"; do
        if process_post "$file"; then
            ((success++))
        else
            ((failed++))
        fi
        echo ""
    done
    
    echo -e "${GREEN}Done: $success succeeded, $failed failed${NC}"
    return 0
}

# Run the script
main "$@"
