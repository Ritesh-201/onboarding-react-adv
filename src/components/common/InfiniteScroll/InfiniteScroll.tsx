import React, { useState, useEffect, useCallback, useRef } from 'react';
import './InfiniteScroll.css';

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

interface InfiniteScrollProps {
  loadMoreData: () => Promise<Post[]>;
  hasMore: boolean;
  loading: boolean;
}

// Custom hook for infinite scroll
const useInfiniteScroll = (callback: () => void, hasMore: boolean, loading: boolean) => {
  const observer = useRef<IntersectionObserver | null>(null);
  
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        callback();
      }
    }, {
      threshold: 1.0,
      rootMargin: '100px'
    });
    
    if (node) observer.current.observe(node);
  }, [callback, hasMore, loading]);

  return lastElementRef;
};

// Real API function using JSONPlaceholder
const fetchPosts = async (page: number, limit: number = 10): Promise<Post[]> => {
  try {
    // Using JSONPlaceholder API - it has 100 posts, but we'll cycle through them
    const response = await fetch(`https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=${limit}`);
    const posts = await response.json();
    
    // If we get fewer posts than expected, we'll start recycling with modified IDs
    if (posts.length < limit) {
      const start = (page - 1) * limit;
      const additionalPosts: Post[] = Array.from({ length: limit - posts.length }, (_, index) => ({
        id: start + posts.length + index + 1,
        title: `Recycled Post ${start + posts.length + index + 1}: ${posts[index % posts.length]?.title || 'Lorem ipsum'}`,
        body: `${posts[index % posts.length]?.body || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'} (Recycled content to demonstrate infinite scroll)`,
        userId: Math.floor(Math.random() * 10) + 1
      }));
      return [...posts, ...additionalPosts];
    }
    
    return posts;
  } catch (error) {
    console.error('Error fetching from API:', error);
    // Fallback to generated content
    const start = (page - 1) * limit;
    return Array.from({ length: limit }, (_, index) => ({
      id: start + index + 1,
      title: `Generated Post ${start + index + 1}: Lorem ipsum dolor sit amet`,
      body: `This is generated content for post ${start + index + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
      userId: Math.floor(Math.random() * 10) + 1
    }));
  }
};

// InfiniteScroll List Component
const InfiniteScrollList: React.FC<InfiniteScrollProps> = ({ loadMoreData, hasMore, loading }) => {
  const [posts, setPosts] = useState<Post[]>([]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    try {
      const newPosts = await loadMoreData();
      setPosts(prevPosts => [...prevPosts, ...newPosts]);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  }, [loadMoreData, loading, hasMore]);

  const lastElementRef = useInfiniteScroll(loadMore, hasMore, loading);

  // Initial load
  useEffect(() => {
    loadMore();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="infinite-scroll-container">
      <div className="posts-list">
        {posts.map((post, index) => (
          <div
            key={post.id}
            className="post-item"
            ref={index === posts.length - 1 ? lastElementRef : null}
          >
            <h4 className="post-title">{post.title}</h4>
            <p className="post-body">{post.body}</p>
            <div className="post-meta">
              <span>Post ID: {post.id}</span>
              <span>User: {post.userId}</span>
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading more posts...</p>
        </div>
      )}
    </div>
  );
};

// Main InfiniteScroll Demo Component
const InfiniteScroll: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [hasMore] = useState(true); // Always true for infinite scroll
  const [page, setPage] = useState(1);

  const loadMoreData = async (): Promise<Post[]> => {
    setLoading(true);
    
    try {
      const newPosts = await fetchPosts(page);
      setPage(prevPage => prevPage + 1);
      
      // Keep hasMore always true for true infinite scroll
      // setHasMore(false); // Removed this line
      
      return newPosts;
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="infinite-scroll-demo">
      <div className="demo-header">
        <h3>Infinite Scroll Component</h3>
        <p>Demonstrates true infinite scrolling with real API data and performance optimization:</p>
      </div>

      <div className="pattern-explanation">
        <h4>React Patterns & Performance Techniques:</h4>
        <div className="patterns-grid">
          <div className="pattern-item">
            <strong>Intersection Observer API:</strong>
            <p>Efficiently detects when to load more content without scroll event listeners</p>
          </div>
          <div className="pattern-item">
            <strong>Custom Hooks:</strong>
            <p>useInfiniteScroll hook encapsulates scroll logic and can be reused</p>
          </div>
          <div className="pattern-item">
            <strong>useCallback Optimization:</strong>
            <p>Prevents unnecessary re-renders of child components</p>
          </div>
          <div className="pattern-item">
            <strong>Ref Forwarding:</strong>
            <p>Passing refs to dynamically determine the last element</p>
          </div>
          <div className="pattern-item">
            <strong>Real API Integration:</strong>
            <p>Uses JSONPlaceholder API with content recycling for true infinite scroll</p>
          </div>
        </div>
      </div>

      <div className="demo-content">
        <InfiniteScrollList
          loadMoreData={loadMoreData}
          hasMore={hasMore}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default InfiniteScroll;
