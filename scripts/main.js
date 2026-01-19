const hamburger = document.querySelector(".hamburger");
const mobileNav = document.querySelector(".mobile-nav");
const dropdownMenu = document.querySelector(".dropdown-menu");

document.onclick = (element) => {

    if (element.target.classList.contains("hamburger")) {
        mobileNav.classList.toggle("hidden");

    } else if (!mobileNav.classList.contains("hidden") && !element.target.classList.contains("mobile-nav")) {
        mobileNav.classList.toggle("hidden");
    
    } else if (element.target.classList.contains("dropdown-triangle-content")) {
        dropdownMenu.classList.toggle("hidden");

    } else if ((!dropdownMenu.classList.contains("hidden") && !element.target.classList.contains("dropdown-triangle-content")) || element.target.classList.contains("dropdown-triangle-inv-content")) {
        dropdownMenu.classList.toggle("hidden");
    };

}

// Load recent blog posts
async function loadRecentPosts() {
    try {
        const response = await fetch('./data/recent-posts.json');
        if (!response.ok) {
            throw new Error('Failed to fetch recent posts');
        }
        const data = await response.json();
        
        // Display recent posts (limit to 3)
        const recentPostsContainer = document.getElementById('recent-posts-container');
        if (recentPostsContainer && data.recentPosts) {
            const postsToShow = data.recentPosts.slice(0, 3);
            recentPostsContainer.innerHTML = postsToShow.map(post => {
                // Format date as DD.MM.YYYY to match blog page
                const date = new Date(post.date);
                const formattedDate = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
                
                const imageHtml = post.image 
                    ? `<a href="${post.url}" class="blog-list-tile-image">
                         <img src="${post.image}" alt="${post.title}" loading="lazy" onerror="this.style.display='none'">
                       </a>`
                    : '';
                
                const tagsHtml = post.tags && post.tags.length > 0 && post.tags.some(tag => tag && tag.trim())
                    ? `<div class="blog-list-tile-tags">
                         ${post.tags.filter(tag => tag && tag.trim()).map(tag => `<a href="/writing/tags/${tag.toLowerCase().replace(/\s+/g, '-')}" class="blog-list-tile-tag">${tag}</a>`).join('')}
                       </div>`
                    : '';
                
                return `
                    <article class="blog-list-tile-item">
                        ${imageHtml}
                        <span class="blog-list-tile-date">${formattedDate}</span>
                        <a href="${post.url}" class="blog-list-tile-link">${post.title}</a>
                        <p class="blog-list-tile-summary">${post.summary}</p>
                        ${tagsHtml}
                    </article>
                `;
            }).join('');
        }
        
        // Display highlights (limit to 4 most recent)
        const highlightsContainer = document.getElementById('highlights-container');
        if (highlightsContainer && data.highlights) {
            const highlightsToShow = data.highlights.slice(0, 4);
            highlightsContainer.innerHTML = highlightsToShow.map(post => {
                const date = new Date(post.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
                const imageHtml = post.image 
                    ? `<img src="${post.image}" alt="${post.title}" class="highlight-post-image" loading="lazy" onerror="this.style.display='none'">`
                    : '';
                
                return `
                    <article class="highlight-post-item">
                        <a href="${post.url}">
                            ${imageHtml}
                            <h3 class="highlight-post-title">${post.title}</h3>
                            <p class="highlight-post-date">${date}</p>
                            <p class="highlight-post-summary">${post.summary}</p>
                        </a>
                    </article>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading recent posts:', error);
        // Hide sections if loading fails
        const recentPostsSection = document.querySelector('.blog-posts-section');
        const highlightsSection = document.querySelector('.highlights-section');
        if (recentPostsSection) recentPostsSection.style.display = 'none';
        if (highlightsSection) highlightsSection.style.display = 'none';
    }
}

// Load posts when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadRecentPosts);
} else {
    loadRecentPosts();
}