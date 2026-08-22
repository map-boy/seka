export interface Creator {
 id: string;
 name: string;
 handle: string;
 avatar: string;
 isFollowing: boolean;
 bio: string;
 badge: string;
 rank: number;
 followerCount: number;
 followingCount: number;
 memeCount: number;
 totalLikes: number;
}

export type Category =
 | 'All'
 | 'For You'
 | 'Relatable'
 | 'Dark Humor'
 | 'Anime'
 | 'Gaming'
 | 'Tech'
 | 'Sports'
 | 'Wholesome'
 | 'Dank';

export type PostType = 'image' | 'reel';

export interface MemePost {
 id: string;
 creatorId: string;
 creator: Creator;
 createdAt: string;
 category: Category;
 type: PostType;
 mediaUrl: string;
 duration?: string;
 caption: string;
 hashtags: string[];
 likes: number;
 commentsCount: number;
 shares: number;
 downloads: number;
 isLiked: boolean;
 reaction?: string;
 isSaved: boolean;
 isMine?: boolean;
}

export interface Comment {
 id: string;
 memeId: string;
 authorName: string;
 authorAvatar: string;
 timestamp: string;
 text: string;
 likes: number;
 isLiked: boolean;
}

export interface StatusItem {
 id: string;
 creatorId: string;
 creatorName: string;
 creatorAvatar: string;
 mediaUrl: string;
 caption: string;
 timestamp: string;
 views: number;
 isViewed: boolean;
 isMine?: boolean;
}

export interface ChatMessage {
 id: string;
 threadId: string;
 senderId: string;
 senderName: string;
 senderAvatar: string;
 text?: string;
 meme?: MemePost;
 timestamp: string;
 isMine: boolean;
}

export interface ChatThread {
 id: string;
 name: string;
 avatar: string;
 isGroup: boolean;
 lastMessage: string;
 timestamp: string;
 unreadCount: number;
 messages: ChatMessage[];
}

export interface MemeTemplate {
 id: string;
 name: string;
 thumbnailUrl: string;
 defaultTopText: string;
 defaultBottomText: string;
 category: Category;
}

