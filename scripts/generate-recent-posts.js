const fs = require('fs');
const path = require('path');

// Function to parse front matter from markdown file
function parseFrontMatter(content) {
    const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontMatterRegex);
    
    if (!match) {
        return { frontMatter: {}, content: content };
    }
    
    const frontMatterText = match[1];
    const body = match[2];
    const frontMatter = {};
    
    // Parse YAML-like front matter (simplified parser)
    frontMatterText.split('\n').forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
            const key = line.substring(0, colonIndex).trim();
            let value = line.substring(colonIndex + 1).trim();
            
            // Remove quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || 
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            
            // Handle boolean values
            if (value === 'true') value = true;
            else if (value === 'false') value = false;
            // Handle arrays (simplified)
            else if (value.startsWith('[') && value.endsWith(']')) {
                value = value.slice(1, -1).split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
            }
            
            frontMatter[key] = value;
        }
    });
    
    return { frontMatter, content: body };
}

// Function to get summary from content
function getSummary(content, maxLength = 200) {
    // Remove markdown links, images, and formatting
    let text = content
        .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Convert links to text
        .replace(/#{1,6}\s+/g, '') // Remove headers
        .replace(/\*\*([^\*]+)\*\*/g, '$1') // Remove bold
        .replace(/\*([^\*]+)\*/g, '$1') // Remove italic
        .replace(/`([^`]+)`/g, '$1') // Remove code
        .replace(/\n+/g, ' ') // Replace newlines with spaces
        .trim();
    
    if (text.length > maxLength) {
        text = text.substring(0, maxLength).trim() + '...';
    }
    
    return text;
}

// Function to generate URL slug from title
function slugify(title) {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

// Function to get image path
function getImagePath(filePath, imageName) {
    if (!imageName) return null;
    
    // If image starts with /, it's already a full path
    if (imageName.startsWith('/')) {
        return imageName;
    }
    
    // Otherwise, construct path relative to blog content
    const dir = path.dirname(filePath);
    const imagePath = path.join(dir, imageName);
    
    // Check if image exists
    if (fs.existsSync(imagePath)) {
        // Return path relative to writing directory (Hugo output)
        const relativePath = path.relative(path.join(__dirname, '../blog/content/blog'), dir);
        const parts = relativePath.split(path.sep);
        const year = parts[0];
        
        // Handle both folder-based and file-based posts
        const isFolderPost = path.basename(filePath) === 'index.md';
        let postSlug;
        
        if (isFolderPost) {
            postSlug = slugify(path.basename(dir));
        } else {
            postSlug = slugify(path.basename(filePath, '.md'));
        }
        
        return `/writing/blog/${year}/${postSlug}/${imageName}`;
    }
    
    return null;
}

// Function to get post URL
function getPostUrl(filePath, date) {
    const relativePath = path.relative(path.join(__dirname, '../blog/content/blog'), filePath);
    const parts = path.dirname(relativePath).split(path.sep);
    const year = parts[0];
    
    // Check if it's a folder-based post (has index.md)
    const dir = path.dirname(filePath);
    const isFolderPost = path.basename(filePath) === 'index.md';
    
    let slug;
    if (isFolderPost) {
        // Slugify the folder name
        slug = slugify(path.basename(dir));
    } else {
        slug = slugify(path.basename(filePath, '.md'));
    }
    
    return `/writing/blog/${year}/${slug}/`;
}

// Function to scan blog directory recursively
function scanBlogDirectory(dir, posts = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            scanBlogDirectory(filePath, posts);
        } else if (file.endsWith('.md') && file !== '_index.md') {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const { frontMatter, content: body } = parseFrontMatter(content);
                
                // Only process blog posts (not creative writing, etc.)
                if (frontMatter.type === 'blog' || (!frontMatter.type && filePath.includes('blog'))) {
                    // Skip drafts
                    if (frontMatter.draft === true || frontMatter.draft === 'true') {
                        return;
                    }
                    
                    const date = frontMatter.date || '1970-01-01';
                    const title = frontMatter.title || path.basename(filePath, '.md');
                    const highlight = frontMatter.highlight === true || frontMatter.highlight === 'true';
                    const image = frontMatter.image ? getImagePath(filePath, frontMatter.image) : null;
                    const url = getPostUrl(filePath, date);
                    const tags = frontMatter.tags || [];
                    
                    // Calculate summary length based on whether there's an image
                    // For 16:9 images, we want shorter summaries (150 chars)
                    // For posts without images, use longer summaries (600 chars) to fill the space
                    const summaryLength = image ? 200 : 600;
                    const summary = frontMatter.summary || getSummary(body, summaryLength);
                    
                    posts.push({
                        title,
                        date,
                        url,
                        summary,
                        highlight,
                        ...(image && { image }),
                        ...(tags.length > 0 && { tags })
                    });
                }
            } catch (error) {
                console.error(`Error processing ${filePath}:`, error.message);
            }
        }
    });
    
    return posts;
}

// Main function
function generateRecentPosts() {
    const blogDir = path.join(__dirname, '../blog/content/blog');
    
    if (!fs.existsSync(blogDir)) {
        console.error('Blog directory not found:', blogDir);
        process.exit(1);
    }
    
    console.log('Scanning blog directory...');
    const allPosts = scanBlogDirectory(blogDir);
    
    // Sort by date (newest first)
    allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Get recent posts (first 10)
    const recentPosts = allPosts.slice(0, 10);
    
    // Get highlights
    const highlights = allPosts.filter(post => post.highlight);
    
    const output = {
        recentPosts,
        highlights
    };
    
    // Write to data directory
    const outputPath = path.join(__dirname, '../data/recent-posts.json');
    const outputDir = path.dirname(outputPath);
    
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`✅ Generated ${outputPath}`);
    console.log(`   - ${recentPosts.length} recent posts`);
    console.log(`   - ${highlights.length} highlights`);
}

// Run if called directly
if (require.main === module) {
    generateRecentPosts();
}

module.exports = { generateRecentPosts };
