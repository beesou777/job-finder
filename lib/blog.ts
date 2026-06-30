import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export const MIN_BLOG_WORD_COUNT = 350;

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  readTime: string;
  content: string; // Markdown content
  wordCount: number;
  noindex: boolean;
  faqs?: Array<{ question: string; answer: string }>;
}

const blogDirectory = path.join(process.cwd(), 'content/blog');

function getWordCount(content: string): number {
  const matches = content.match(/\b\w+\b/g);
  return matches ? matches.length : 0;
}

function shouldIndexPost(
  content: string,
  frontmatterNoindex: unknown,
): boolean {
  if (frontmatterNoindex === true) {
    return false;
  }

  return getWordCount(content) >= MIN_BLOG_WORD_COUNT;
}

/**
 * Get all blog post slugs
 */
export function getAllBlogSlugs(): string[] {
  try {
    if (!fs.existsSync(blogDirectory)) {
      return [];
    }
    const files = fs.readdirSync(blogDirectory);
    return files
      .filter((file) => file.endsWith('.md'))
      .map((file) => file.replace(/\.md$/, ''));
  } catch (error) {
    console.error('Error reading blog directory:', error);
    return [];
  }
}

/**
 * Get blog post by slug
 */
export function getBlogPostBySlug(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(blogDirectory, `${slug}.md`);
    
    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    const trimmedContent = content.trim();
    const wordCount = getWordCount(trimmedContent);
    const noindex = !shouldIndexPost(trimmedContent, data.noindex);

    return {
      slug: data.slug || slug,
      title: data.title || '',
      description: data.description || '',
      date: data.date || new Date().toISOString(),
      category: data.category || 'General',
      readTime: data.readTime || '5 min read',
      content: trimmedContent, // Keep as markdown
      wordCount,
      noindex,
      faqs: data.faqs || undefined,
    };
  } catch (error) {
    console.error(`Error reading blog post ${slug}:`, error);
    return null;
  }
}

/**
 * Get all blog posts sorted by date (newest first)
 */
export function getAllBlogPosts(options?: { includeNoIndex?: boolean }): BlogPost[] {
  const slugs = getAllBlogSlugs();
  const posts = slugs
    .map((slug) => getBlogPostBySlug(slug))
    .filter((post): post is BlogPost => post !== null)
    .filter((post) => options?.includeNoIndex || !post.noindex)
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA; // Newest first
    });

  return posts;
}

export function getVisibleBlogPosts(): BlogPost[] {
  return getAllBlogPosts();
}

export function getAllBlogPostsForAdmin(): BlogPost[] {
  return getAllBlogPosts({ includeNoIndex: true });
}

/**
 * Get related blog posts (excluding current slug)
 */
export function getRelatedPosts(currentSlug: string, limit: number = 3): BlogPost[] {
  const allPosts = getAllBlogPosts();
  return allPosts
    .filter((post) => post.slug !== currentSlug)
    .slice(0, limit);
}

export function getRecentVisibleBlogPosts(limit: number = 3): BlogPost[] {
  return getAllBlogPosts().slice(0, limit);
}

/**
 * Get all blog posts including hidden/noindex entries.
 */
export function getAllBlogPostsIncludingHidden(): BlogPost[] {
  const slugs = getAllBlogSlugs();
  const posts = slugs
    .map((slug) => getBlogPostBySlug(slug))
    .filter((post): post is BlogPost => post !== null)
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA; // Newest first
    });

  return posts;
}

