import Foundation
import FirebaseFirestore
import FirebaseStorage
import UIKit

class MemeService: ObservableObject {
    private let db = Firestore.firestore()
    private var listener: ListenerRegistration?

    @Published var memes: [MemePost] = []

    // Mirrors the web app's subscribeToMemes() - first page, live, PAGE_SIZE = 20
    func subscribeToMemes() {
        listener?.remove()
        listener = db.collection("memes")
            .order(by: "createdAt", descending: true)
            .limit(to: 20)
            .addSnapshotListener { [weak self] snapshot, error in
                guard let docs = snapshot?.documents else { return }
                self?.memes = docs.compactMap { try? $0.data(as: MemePost.self) }
            }
    }

    func stopListening() {
        listener?.remove()
    }

    // Uploads to memes/{uid}/{fileName} - matches deployed storage.rules
    // (50MB limit, image/* or video/* only)
    func uploadMemeImage(uid: String, image: UIImage) async throws -> String {
        guard let data = image.jpegData(compressionQuality: 0.9) else {
            throw NSError(domain: "Sekaa", code: 1, userInfo: [NSLocalizedDescriptionKey: "Could not encode image"])
        }
        let fileName = "meme_\(Int(Date().timeIntervalSince1970 * 1000)).jpg"
        let ref = Storage.storage().reference().child("memes/\(uid)/\(fileName)")
        let metadata = StorageMetadata()
        metadata.contentType = "image/jpeg"
        _ = try await ref.putDataAsync(data, metadata: metadata)
        return try await ref.downloadURL().absoluteString
    }

    func uploadMemeVideo(uid: String, fileURL: URL) async throws -> String {
        let fileName = "meme_\(Int(Date().timeIntervalSince1970 * 1000)).mov"
        let ref = Storage.storage().reference().child("memes/\(uid)/\(fileName)")
        let metadata = StorageMetadata()
        metadata.contentType = "video/quicktime"
        let data = try Data(contentsOf: fileURL)
        _ = try await ref.putDataAsync(data, metadata: metadata)
        return try await ref.downloadURL().absoluteString
    }

    // Matches web app's createMeme() exactly - same field names, same defaults
    func createMeme(creatorId: String, category: String, type: String, mediaUrl: String,
                     caption: String, hashtags: [String], duration: String? = nil) async throws {
        var data: [String: Any] = [
            "creatorId": creatorId,
            "category": category,
            "type": type,
            "mediaUrl": mediaUrl,
            "caption": caption,
            "hashtags": hashtags,
            "createdAt": FieldValue.serverTimestamp(),
            "likesCount": 0,
            "commentsCount": 0,
            "sharesCount": 0,
            "downloadsCount": 0
        ]
        if let duration = duration {
            data["duration"] = duration
        }
        try await db.collection("memes").addDocument(data: data)
    }

    // Matches web app's toggleLikeMeme() - same doc ID scheme: {uid}_{memeId}
    func toggleLike(uid: String, memeId: String) async throws {
        let likeRef = db.collection("memeLikes").document("\(uid)_\(memeId)")
        let memeRef = db.collection("memes").document(memeId)

        _ = try await db.runTransaction { transaction, errorPointer in
            let likeSnap: DocumentSnapshot
            do {
                likeSnap = try transaction.getDocument(likeRef)
            } catch {
                errorPointer?.pointee = error as NSError
                return nil
            }

            if likeSnap.exists {
                transaction.deleteDocument(likeRef)
                transaction.updateData(["likesCount": FieldValue.increment(Int64(-1))], forDocument: memeRef)
            } else {
                transaction.setData(["uid": uid, "memeId": memeId, "reaction": "", "createdAt": FieldValue.serverTimestamp()], forDocument: likeRef)
                transaction.updateData(["likesCount": FieldValue.increment(Int64(1))], forDocument: memeRef)
            }
            return nil
        }
    }
}