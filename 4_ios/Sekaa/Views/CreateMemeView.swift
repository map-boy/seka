import SwiftUI
import PhotosUI

struct CreateMemeView: View {
    @EnvironmentObject var authVM: AuthViewModel
    @StateObject private var memeService = MemeService()

    @State private var selectedItem: PhotosPickerItem?
    @State private var selectedImage: UIImage?
    @State private var topCaption = ""
    @State private var bottomCaption = ""
    @State private var category = "Tech"
    @State private var publishing = false
    @State private var errorMessage: String?

    let categories = ["Relatable", "Dark Humor", "Anime", "Gaming", "Tech", "Sports", "Wholesome", "Dank"]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text("Meme Studio")
                    .font(.title2.bold())
                    .foregroundColor(.white)

                ZStack {
                    if let image = selectedImage {
                        Image(uiImage: renderedMemeImage(base: image))
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .cornerRadius(16)
                    } else {
                        RoundedRectangle(cornerRadius: 16)
                            .fill(Color(white: 0.1))
                            .frame(height: 300)
                            .overlay(Text("No image selected").foregroundColor(.gray))
                    }
                }

                PhotosPicker(selection: $selectedItem, matching: .images) {
                    Label("Upload Photo From Your Phone", systemImage: "photo.on.rectangle")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(Color(red: 0.9, green: 1.0, blue: 0.0))
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color(red: 0.9, green: 1.0, blue: 0.0).opacity(0.1))
                        .cornerRadius(12)
                }
                .onChange(of: selectedItem) { _, newItem in
                    Task {
                        if let data = try? await newItem?.loadTransferable(type: Data.self),
                           let uiImage = UIImage(data: data) {
                            selectedImage = uiImage
                        }
                    }
                }

                TextField("TOP CAPTION", text: $topCaption)
                    .textFieldStyle(.roundedBorder)
                    .textInputAutocapitalization(.characters)

                TextField("BOTTOM CAPTION", text: $bottomCaption)
                    .textFieldStyle(.roundedBorder)
                    .textInputAutocapitalization(.characters)

                Picker("Category", selection: $category) {
                    ForEach(categories, id: \.self) { cat in
                        Text(cat).tag(cat)
                    }
                }
                .pickerStyle(.menu)

                if let errorMessage {
                    Text(errorMessage)
                        .foregroundColor(.red)
                        .font(.caption)
                }

                Button {
                    Task { await publish() }
                } label: {
                    if publishing {
                        ProgressView()
                    } else {
                        Text("Post Meme with Sekaa Watermark")
                            .font(.system(size: 13, weight: .black))
                            .foregroundColor(.black)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color(red: 0.9, green: 1.0, blue: 0.0))
                            .cornerRadius(24)
                    }
                }
                .disabled(publishing || selectedImage == nil || authVM.currentUser == nil)
            }
            .padding()
        }
        .background(Color.black.ignoresSafeArea())
    }

    // Draws the base image + top/bottom captions + Sekaa watermark onto a single flattened image,
    // same approach as the web app's Canvas-based compositing.
    func renderedMemeImage(base: UIImage) -> UIImage {
        let renderer = UIGraphicsImageRenderer(size: base.size)
        return renderer.image { ctx in
            base.draw(at: .zero)

            let fontSize = base.size.width * 0.07
            let font = UIFont(name: "Arial-BoldMT", size: fontSize) ?? UIFont.boldSystemFont(ofSize: fontSize)
            let attrs: [NSAttributedString.Key: Any] = [
                .font: font,
                .foregroundColor: UIColor.white,
                .strokeColor: UIColor.black,
                .strokeWidth: -4
            ]

            if !topCaption.isEmpty {
                let text = topCaption.uppercased() as NSString
                let size = text.size(withAttributes: attrs)
                text.draw(at: CGPoint(x: (base.size.width - size.width) / 2, y: 20), withAttributes: attrs)
            }
            if !bottomCaption.isEmpty {
                let text = bottomCaption.uppercased() as NSString
                let size = text.size(withAttributes: attrs)
                text.draw(at: CGPoint(x: (base.size.width - size.width) / 2, y: base.size.height - size.height - 20), withAttributes: attrs)
            }

            let watermarkAttrs: [NSAttributedString.Key: Any] = [
                .font: UIFont.boldSystemFont(ofSize: 16),
                .foregroundColor: UIColor.white
            ]
            ("Sekaa" as NSString).draw(at: CGPoint(x: base.size.width - 70, y: base.size.height - 30), withAttributes: watermarkAttrs)
        }
    }

    func publish() async {
        guard let uid = authVM.currentUser?.uid, let image = selectedImage else { return }
        publishing = true
        errorMessage = nil
        do {
            let finalImage = renderedMemeImage(base: image)
            let mediaUrl = try await memeService.uploadMemeImage(uid: uid, image: finalImage)
            try await memeService.createMeme(
                creatorId: uid,
                category: category,
                type: "image",
                mediaUrl: mediaUrl,
                caption: "\(topCaption) \(bottomCaption)".trimmingCharacters(in: .whitespaces),
                hashtags: ["#\(category)", "#SekaaOriginal"]
            )
            selectedImage = nil
            topCaption = ""
            bottomCaption = ""
        } catch {
            errorMessage = error.localizedDescription
        }
        publishing = false
    }
}