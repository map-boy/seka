import Foundation
import FirebaseFirestore

struct Creator: Identifiable, Codable {
    var id: String
    var name: String
    var handle: String
    var avatar: String
    var bio: String
    var badge: String
    var followerCount: Int
    var followingCount: Int
    var totalLikes: Int
}

struct MemePost: Identifiable, Codable {
    @DocumentID var id: String?
    var creatorId: String
    var category: String
    var type: String // "image" or "reel"
    var mediaUrl: String
    var duration: String?
    var caption: String
    var hashtags: [String]
    var likesCount: Int
    var commentsCount: Int
    var sharesCount: Int
    var downloadsCount: Int
    @ServerTimestamp var createdAt: Timestamp?

    var creator: Creator? = nil
    var isLiked: Bool = false
    var isSaved: Bool = false
    var isMine: Bool = false

    enum CodingKeys: String, CodingKey {
        case id, creatorId, category, type, mediaUrl, duration, caption, hashtags
        case likesCount, commentsCount, sharesCount, downloadsCount, createdAt
    }
}

struct CommentDoc: Identifiable, Codable {
    @DocumentID var id: String?
    var memeId: String
    var authorId: String
    var authorName: String
    var authorAvatar: String
    var text: String
    var likesCount: Int
    @ServerTimestamp var createdAt: Timestamp?
}