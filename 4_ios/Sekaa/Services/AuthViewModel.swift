import Foundation
import FirebaseAuth
import FirebaseFirestore

@MainActor
class AuthViewModel: ObservableObject {
    @Published var currentUser: FirebaseAuth.User?
    @Published var isLoading = true
    @Published var errorMessage: String?

    private var handle: AuthStateDidChangeListenerHandle?
    private let db = Firestore.firestore()

    init() {
        handle = Auth.auth().addStateDidChangeListener { [weak self] _, user in
            self?.currentUser = user
            self?.isLoading = false
        }
    }

    func signIn(email: String, password: String) async {
        do {
            try await Auth.auth().signIn(withEmail: email, password: password)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func signUp(email: String, password: String, name: String, handle userHandle: String) async {
        do {
            let result = try await Auth.auth().createUser(withEmail: email, password: password)
            let changeRequest = result.user.createProfileChangeRequest()
            changeRequest.displayName = name
            try await changeRequest.commitChanges()

            try await db.collection("users").document(result.user.uid).setData([
                "name": name,
                "handle": userHandle,
                "avatar": "",
                "email": email,
                "createdAt": FieldValue.serverTimestamp()
            ])
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func signOut() {
        try? Auth.auth().signOut()
    }

    // Matches the web app's deleteAccount() - deletes profile doc + auth account.
    // Does NOT cascade-delete memes/comments/likes/chats (same known gap as web).
    func deleteAccount() async {
        guard let user = Auth.auth().currentUser else { return }
        do {
            try await db.collection("users").document(user.uid).delete()
            try await user.delete()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}