import SwiftUI

struct RootView: View {
    @EnvironmentObject var authVM: AuthViewModel

    var body: some View {
        if authVM.isLoading {
            ProgressView()
        } else if authVM.currentUser == nil {
            AuthView()
        } else {
            TabView {
                CreateMemeView()
                    .environmentObject(authVM)
                    .tabItem { Label("Create", systemImage: "plus.square") }
            }
        }
    }
}

struct AuthView: View {
    @EnvironmentObject var authVM: AuthViewModel
    @State private var email = ""
    @State private var password = ""
    @State private var name = ""
    @State private var handle = ""
    @State private var isSignUp = false

    var body: some View {
        VStack(spacing: 12) {
            Text("Sekaa").font(.largeTitle.bold()).foregroundColor(Color(red: 0.9, green: 1.0, blue: 0.0))

            if isSignUp {
                TextField("Display name", text: $name).textFieldStyle(.roundedBorder)
                TextField("Handle", text: $handle).textFieldStyle(.roundedBorder)
            }
            TextField("Email", text: $email).textFieldStyle(.roundedBorder).textInputAutocapitalization(.never)
            SecureField("Password", text: $password).textFieldStyle(.roundedBorder)

            Button(isSignUp ? "Sign Up" : "Sign In") {
                Task {
                    if isSignUp {
                        await authVM.signUp(email: email, password: password, name: name, handle: handle)
                    } else {
                        await authVM.signIn(email: email, password: password)
                    }
                }
            }
            .buttonStyle(.borderedProminent)

            Button(isSignUp ? "Already have an account? Sign In" : "New here? Sign Up") {
                isSignUp.toggle()
            }
            .font(.caption)
        }
        .padding()
        .background(Color.black.ignoresSafeArea())
    }
}