package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AddPhotoAlternate
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Brush
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.ColorLens
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.EmojiEmotions
import androidx.compose.material.icons.filled.FormatSize
import androidx.compose.material.icons.filled.Movie
import androidx.compose.material.icons.filled.PhotoLibrary
import androidx.compose.material.icons.filled.Publish
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.example.data.MemeTemplate
import com.example.data.MemeType
import com.example.data.SampleData
import com.example.ui.theme.SekaBackground
import com.example.ui.theme.SekaBorder
import com.example.ui.theme.SekaCoralPrimary
import com.example.ui.theme.SekaSurface
import com.example.ui.theme.SekaSurfaceVariant
import com.example.ui.theme.SekaTextMuted
import com.example.ui.theme.SekaYellowAccent

@Composable
fun CreateMemeScreen(
  templates: List<MemeTemplate>,
  categories: List<String>,
  onPublishMeme: (caption: String, category: String, mediaUrl: String, type: MemeType, pushToStatus: Boolean) -> Unit
) {
  var selectedTemplate by remember { mutableStateOf(templates.first()) }
  var topText by remember { mutableStateOf(templates.first().defaultTopText) }
  var bottomText by remember { mutableStateOf(templates.first().defaultBottomText) }
  var selectedCategory by remember { mutableStateOf(categories.first { it != "All" }) }
  var isReelVideo by remember { mutableStateOf(false) }
  var pushToStatus by remember { mutableStateOf(true) }
  var selectedSticker by remember { mutableStateOf<String?>(null) }
  var activeBrushColor by remember { mutableStateOf(SekaCoralPrimary) }

  val scrollState = rememberScrollState()

  Column(
    modifier = Modifier
      .fillMaxSize()
      .background(SekaBackground)
      .padding(horizontal = 16.dp)
      .verticalScroll(scrollState)
      .padding(bottom = 100.dp)
      .testTag("create_meme_screen")
  ) {
    Spacer(modifier = Modifier.height(16.dp))

    // Header Title
    Row(verticalAlignment = Alignment.CenterVertically) {
      Icon(
        imageVector = Icons.Default.Edit,
        contentDescription = "Meme Creator",
        tint = SekaCoralPrimary,
        modifier = Modifier.size(28.dp)
      )
      Spacer(modifier = Modifier.width(8.dp))
      Text(
        text = "Meme Studio",
        style = MaterialTheme.typography.displayLarge.copy(
          fontSize = 24.sp,
          fontWeight = FontWeight.Black
        )
      )
    }

    Text(
      text = "Craft viral photo & video memes with auto Seka watermarking",
      style = MaterialTheme.typography.bodyMedium.copy(color = SekaTextMuted, fontSize = 13.sp),
      modifier = Modifier.padding(top = 2.dp)
    )

    Spacer(modifier = Modifier.height(16.dp))

    // 1. Live Interactive Canvas Preview with Seka Watermark Badge
    Card(
      shape = RoundedCornerShape(16.dp),
      colors = CardDefaults.cardColors(containerColor = SekaSurface),
      modifier = Modifier
        .fillMaxWidth()
        .testTag("meme_canvas_preview")
    ) {
      Box(
        modifier = Modifier
          .fillMaxWidth()
          .aspectRatio(4f / 3f)
          .clip(RoundedCornerShape(16.dp))
          .background(Color.Black)
      ) {
        AsyncImage(
          model = ImageRequest.Builder(LocalContext.current)
            .data(selectedTemplate.previewUrl)
            .crossfade(true)
            .build(),
          contentDescription = "Meme Canvas",
          contentScale = ContentScale.Crop,
          modifier = Modifier.fillMaxSize()
        )

        // Top Impact Text
        if (topText.isNotBlank()) {
          Text(
            text = topText.uppercase(),
            style = MaterialTheme.typography.headlineMedium.copy(
              color = Color.White,
              fontWeight = FontWeight.Black,
              fontSize = 22.sp,
              textAlign = TextAlign.Center
            ),
            modifier = Modifier
              .align(Alignment.TopCenter)
              .padding(horizontal = 16.dp, vertical = 14.dp)
          )
        }

        // Bottom Impact Text
        if (bottomText.isNotBlank()) {
          Text(
            text = bottomText.uppercase(),
            style = MaterialTheme.typography.headlineMedium.copy(
              color = Color.White,
              fontWeight = FontWeight.Black,
              fontSize = 22.sp,
              textAlign = TextAlign.Center
            ),
            modifier = Modifier
              .align(Alignment.BottomCenter)
              .padding(horizontal = 16.dp, vertical = 24.dp)
          )
        }

        // Sticker Overlay if selected
        if (selectedSticker != null) {
          Box(
            modifier = Modifier
              .align(Alignment.Center)
              .size(72.dp),
            contentAlignment = Alignment.Center
          ) {
            Text(text = selectedSticker!!, fontSize = 56.sp)
          }
        }

        // Automatic Seka Watermark Badge Indicator on Canvas
        Box(
          modifier = Modifier
            .align(Alignment.BottomEnd)
            .padding(10.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(Color.Black.copy(alpha = 0.75f))
            .border(1.dp, SekaCoralPrimary.copy(alpha = 0.6f), RoundedCornerShape(8.dp))
            .padding(horizontal = 8.dp, vertical = 4.dp)
        ) {
          Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
              imageVector = Icons.Default.Bolt,
              contentDescription = null,
              tint = SekaCoralPrimary,
              modifier = Modifier.size(14.dp)
            )
            Spacer(modifier = Modifier.width(3.dp))
            Text(
              text = "Seka Watermarked",
              style = MaterialTheme.typography.labelMedium.copy(
                color = Color.White,
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold
              )
            )
          }
        }
      }
    }

    Spacer(modifier = Modifier.height(16.dp))

    // 2. Select Meme Template Carousel
    Text(
      text = "CHOOSE TEMPLATE OR UPLOAD",
      style = MaterialTheme.typography.labelMedium.copy(
        color = SekaTextMuted,
        letterSpacing = 1.sp,
        fontWeight = FontWeight.Bold
      )
    )

    Spacer(modifier = Modifier.height(8.dp))

    LazyRow(
      horizontalArrangement = Arrangement.spacedBy(10.dp),
      modifier = Modifier.fillMaxWidth()
    ) {
      item {
        // Upload Custom Button
        Surface(
          shape = RoundedCornerShape(12.dp),
          color = SekaSurfaceVariant,
          modifier = Modifier
            .size(72.dp)
            .border(1.5.dp, SekaCoralPrimary, RoundedCornerShape(12.dp))
            .clickable {
              // Switch format
              isReelVideo = !isReelVideo
            }
        ) {
          Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.fillMaxSize()
          ) {
            Icon(
              imageVector = if (isReelVideo) Icons.Default.Movie else Icons.Default.PhotoLibrary,
              contentDescription = "Custom Media",
              tint = SekaYellowAccent,
              modifier = Modifier.size(24.dp)
            )
            Text(
              text = if (isReelVideo) "Reel Video" else "Photo",
              fontSize = 10.sp,
              fontWeight = FontWeight.Bold,
              color = Color.White,
              modifier = Modifier.padding(top = 2.dp)
            )
          }
        }
      }

      items(templates) { item ->
        val isSelected = (item.id == selectedTemplate.id)
        Box(
          modifier = Modifier
            .size(72.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(SekaSurfaceVariant)
            .border(
              width = if (isSelected) 2.5.dp else 1.dp,
              color = if (isSelected) SekaCoralPrimary else SekaBorder,
              shape = RoundedCornerShape(12.dp)
            )
            .clickable {
              selectedTemplate = item
              topText = item.defaultTopText
              bottomText = item.defaultBottomText
            }
        ) {
          AsyncImage(
            model = ImageRequest.Builder(LocalContext.current)
              .data(item.previewUrl)
              .crossfade(true)
              .build(),
            contentDescription = item.title,
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize()
          )
        }
      }
    }

    Spacer(modifier = Modifier.height(16.dp))

    // 3. Caption Text Inputs
    OutlinedTextField(
      value = topText,
      onValueChange = { topText = it },
      label = { Text("Top Caption (Impact Style)", color = SekaTextMuted) },
      leadingIcon = { Icon(Icons.Default.FormatSize, contentDescription = null, tint = SekaCoralPrimary) },
      shape = RoundedCornerShape(14.dp),
      colors = OutlinedTextFieldDefaults.colors(
        focusedBorderColor = SekaCoralPrimary,
        unfocusedBorderColor = SekaBorder,
        focusedContainerColor = SekaSurface,
        unfocusedContainerColor = SekaSurface,
        focusedTextColor = Color.White,
        unfocusedTextColor = Color.White
      ),
      modifier = Modifier
        .fillMaxWidth()
        .testTag("top_text_input")
    )

    Spacer(modifier = Modifier.height(10.dp))

    OutlinedTextField(
      value = bottomText,
      onValueChange = { bottomText = it },
      label = { Text("Bottom Caption", color = SekaTextMuted) },
      leadingIcon = { Icon(Icons.Default.FormatSize, contentDescription = null, tint = SekaCoralPrimary) },
      shape = RoundedCornerShape(14.dp),
      colors = OutlinedTextFieldDefaults.colors(
        focusedBorderColor = SekaCoralPrimary,
        unfocusedBorderColor = SekaBorder,
        focusedContainerColor = SekaSurface,
        unfocusedContainerColor = SekaSurface,
        focusedTextColor = Color.White,
        unfocusedTextColor = Color.White
      ),
      modifier = Modifier
        .fillMaxWidth()
        .testTag("bottom_text_input")
    )

    Spacer(modifier = Modifier.height(16.dp))

    // 4. Sticker Picker
    Text(
      text = "ADD STICKERS & STAMP",
      style = MaterialTheme.typography.labelMedium.copy(
        color = SekaTextMuted,
        letterSpacing = 1.sp,
        fontWeight = FontWeight.Bold
      )
    )

    Spacer(modifier = Modifier.height(8.dp))

    Row(
      horizontalArrangement = Arrangement.spacedBy(10.dp),
      modifier = Modifier.fillMaxWidth()
    ) {
      SampleData.sampleStickers.forEach { sticker ->
        Box(
          modifier = Modifier
            .size(44.dp)
            .clip(CircleShape)
            .background(if (selectedSticker == sticker.emoji) SekaCoralPrimary.copy(alpha = 0.3f) else SekaSurfaceVariant)
            .border(1.dp, if (selectedSticker == sticker.emoji) SekaCoralPrimary else SekaBorder, CircleShape)
            .clickable {
              selectedSticker = if (selectedSticker == sticker.emoji) null else sticker.emoji
            },
          contentAlignment = Alignment.Center
        ) {
          Text(text = sticker.emoji, fontSize = 20.sp)
        }
      }
    }

    Spacer(modifier = Modifier.height(16.dp))

    // 5. Category Selection
    Text(
      text = "CATEGORY / TAG",
      style = MaterialTheme.typography.labelMedium.copy(
        color = SekaTextMuted,
        letterSpacing = 1.sp,
        fontWeight = FontWeight.Bold
      )
    )

    Spacer(modifier = Modifier.height(8.dp))

    LazyRow(
      horizontalArrangement = Arrangement.spacedBy(8.dp),
      modifier = Modifier.fillMaxWidth()
    ) {
      items(categories.filter { it != "All" }) { cat ->
        val isSelected = (cat == selectedCategory)
        Surface(
          shape = RoundedCornerShape(12.dp),
          color = if (isSelected) SekaCoralPrimary else SekaSurfaceVariant,
          modifier = Modifier.clickable { selectedCategory = cat }
        ) {
          Text(
            text = cat,
            style = MaterialTheme.typography.labelMedium.copy(
              color = if (isSelected) Color.White else SekaTextMuted,
              fontWeight = FontWeight.Bold
            ),
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
          )
        }
      }
    }

    Spacer(modifier = Modifier.height(16.dp))

    // 6. Push to My Status Toggle
    Card(
      shape = RoundedCornerShape(14.dp),
      colors = CardDefaults.cardColors(containerColor = SekaSurface),
      modifier = Modifier.fillMaxWidth()
    ) {
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .padding(horizontal = 16.dp, vertical = 10.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Icon(Icons.Default.Bolt, contentDescription = null, tint = SekaYellowAccent, modifier = Modifier.size(20.dp))
          Spacer(modifier = Modifier.width(8.dp))
          Column {
            Text("Also Post to My Status", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 14.sp)
            Text("Broadcast meme to 24-hour status ring", color = SekaTextMuted, fontSize = 12.sp)
          }
        }

        Switch(
          checked = pushToStatus,
          onCheckedChange = { pushToStatus = it },
          colors = SwitchDefaults.colors(
            checkedThumbColor = Color.White,
            checkedTrackColor = SekaCoralPrimary
          )
        )
      }
    }

    Spacer(modifier = Modifier.height(24.dp))

    // 7. Publish Button CTA
    Button(
      onClick = {
        val fullCaption = if (topText.isNotBlank() || bottomText.isNotBlank()) {
          "$topText $bottomText".trim()
        } else {
          "New ${selectedCategory} meme 🚀"
        }
        val type = if (isReelVideo) MemeType.VIDEO_REEL else MemeType.IMAGE
        onPublishMeme(fullCaption, selectedCategory, selectedTemplate.previewUrl, type, pushToStatus)
      },
      colors = ButtonDefaults.buttonColors(containerColor = SekaCoralPrimary),
      shape = RoundedCornerShape(16.dp),
      modifier = Modifier
        .fillMaxWidth()
        .height(52.dp)
        .testTag("publish_meme_button")
    ) {
      Icon(imageVector = Icons.Default.Publish, contentDescription = null)
      Spacer(modifier = Modifier.width(8.dp))
      Text("Post Meme with Seka Watermark ⚡", fontWeight = FontWeight.Black, fontSize = 15.sp)
    }
  }
}
