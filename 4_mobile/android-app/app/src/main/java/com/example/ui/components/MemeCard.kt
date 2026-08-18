package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.scaleOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.ChatBubble
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.VolumeOff
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.example.data.MemePost
import com.example.data.MemeType
import com.example.ui.theme.SekaBorder
import com.example.ui.theme.SekaCoralPrimary
import com.example.ui.theme.SekaSurface
import com.example.ui.theme.SekaSurfaceVariant
import com.example.ui.theme.SekaTextMuted
import com.example.ui.theme.SekaTextPrimary
import com.example.ui.theme.SekaYellowAccent
import kotlinx.coroutines.delay

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun MemeCard(
  post: MemePost,
  onLikeClick: () -> Unit,
  onSaveClick: () -> Unit,
  onCommentClick: () -> Unit,
  onShareClick: () -> Unit,
  onDownloadWatermarkClick: () -> Unit,
  onLongPressReaction: () -> Unit,
  onCreatorClick: () -> Unit = {}
) {
  var showDoubleTapHeart by remember { mutableStateOf(false) }
  var isMuted by remember { mutableStateOf(post.isSoundMuted) }

  Card(
    shape = RoundedCornerShape(16.dp),
    colors = CardDefaults.cardColors(containerColor = SekaSurface),
    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
    modifier = Modifier
      .fillMaxWidth()
      .padding(horizontal = 12.dp, vertical = 8.dp)
      .testTag("meme_card_${post.id}")
  ) {
    Column(modifier = Modifier.fillMaxWidth()) {

      // 1. Creator Header
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .padding(horizontal = 14.dp, vertical = 10.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(
          verticalAlignment = Alignment.CenterVertically,
          modifier = Modifier.clickable { onCreatorClick() }
        ) {
          AsyncImage(
            model = ImageRequest.Builder(LocalContext.current)
              .data(post.creator.avatarUrl)
              .crossfade(true)
              .build(),
            contentDescription = post.creator.name,
            contentScale = ContentScale.Crop,
            modifier = Modifier
              .size(38.dp)
              .clip(CircleShape)
              .border(1.5.dp, SekaCoralPrimary, CircleShape)
          )

          Spacer(modifier = Modifier.width(10.dp))

          Column {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Text(
                text = post.creator.name,
                style = MaterialTheme.typography.titleMedium.copy(
                  fontWeight = FontWeight.Bold,
                  fontSize = 14.sp
                )
              )
              Spacer(modifier = Modifier.width(4.dp))
              Text(
                text = "• ${post.timestampAgo}",
                style = MaterialTheme.typography.bodyMedium.copy(fontSize = 12.sp, color = SekaTextMuted)
              )
            }
            Text(
              text = post.creator.handle,
              style = MaterialTheme.typography.bodyMedium.copy(fontSize = 12.sp, color = SekaCoralPrimary)
            )
          }
        }

        // Category Pill
        Surface(
          shape = RoundedCornerShape(12.dp),
          color = SekaSurfaceVariant,
          modifier = Modifier.padding(end = 4.dp)
        ) {
          Text(
            text = post.category,
            style = MaterialTheme.typography.labelMedium.copy(
              color = SekaYellowAccent,
              fontSize = 11.sp,
              fontWeight = FontWeight.Bold
            ),
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
          )
        }
      }

      // 2. Media Canvas (Image or Reel Video simulation)
      Box(
        modifier = Modifier
          .fillMaxWidth()
          .aspectRatio(if (post.type == MemeType.VIDEO_REEL) 4f / 5f else 4f / 3f)
          .clip(RoundedCornerShape(8.dp))
          .background(Color.Black)
          .pointerInput(post.id) {
            detectTapGestures(
              onDoubleTap = {
                onLikeClick()
                showDoubleTapHeart = true
              },
              onLongPress = {
                onLongPressReaction()
              }
            )
          }
      ) {
        AsyncImage(
          model = ImageRequest.Builder(LocalContext.current)
            .data(post.mediaUrl)
            .crossfade(true)
            .build(),
          contentDescription = "Meme Content",
          contentScale = ContentScale.Crop,
          modifier = Modifier.fillMaxSize()
        )

        // Video Reel indicator badge & sound toggle
        if (post.type == MemeType.VIDEO_REEL) {
          Box(
            modifier = Modifier
              .align(Alignment.TopStart)
              .padding(10.dp)
              .clip(RoundedCornerShape(12.dp))
              .background(Color.Black.copy(alpha = 0.6f))
              .padding(horizontal = 8.dp, vertical = 4.dp)
          ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Icon(
                imageVector = Icons.Default.PlayArrow,
                contentDescription = "Reel",
                tint = SekaCoralPrimary,
                modifier = Modifier.size(14.dp)
              )
              Spacer(modifier = Modifier.width(4.dp))
              Text(
                text = "REEL • ${post.videoDurationSeconds}s",
                style = MaterialTheme.typography.labelMedium.copy(
                  color = Color.White,
                  fontSize = 10.sp,
                  fontWeight = FontWeight.Bold
                )
              )
            }
          }

          IconButton(
            onClick = { isMuted = !isMuted },
            modifier = Modifier
              .align(Alignment.BottomEnd)
              .padding(10.dp)
              .size(36.dp)
              .clip(CircleShape)
              .background(Color.Black.copy(alpha = 0.6f))
          ) {
            Icon(
              imageVector = if (isMuted) Icons.Default.VolumeOff else Icons.Default.VolumeUp,
              contentDescription = "Toggle Mute",
              tint = Color.White,
              modifier = Modifier.size(20.dp)
            )
          }
        }

        // Live Seka Watermark Badge Preview on bottom right
        Box(
          modifier = Modifier
            .align(Alignment.BottomEnd)
            .padding(end = if (post.type == MemeType.VIDEO_REEL) 54.dp else 10.dp, bottom = 10.dp)
            .clip(RoundedCornerShape(6.dp))
            .background(Color.Black.copy(alpha = 0.7f))
            .border(1.dp, SekaCoralPrimary.copy(alpha = 0.5f), RoundedCornerShape(6.dp))
            .padding(horizontal = 6.dp, vertical = 3.dp)
        ) {
          Text(
            text = "⚡ Seka",
            style = MaterialTheme.typography.labelMedium.copy(
              color = Color.White,
              fontSize = 10.sp,
              fontWeight = FontWeight.Bold
            )
          )
        }

        // Double Tap Animated Heart Overlay
        LaunchedEffect(showDoubleTapHeart) {
          if (showDoubleTapHeart) {
            delay(800)
            showDoubleTapHeart = false
          }
        }

        if (showDoubleTapHeart) {
          Icon(
            imageVector = Icons.Default.Favorite,
            contentDescription = "Liked",
            tint = SekaCoralPrimary,
            modifier = Modifier
              .size(90.dp)
              .align(Alignment.Center)
          )
        }
      }

      // 3. Caption & Tags
      Column(modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp)) {
        Text(
          text = post.caption,
          style = MaterialTheme.typography.bodyLarge.copy(
            fontWeight = FontWeight.Medium,
            fontSize = 14.sp
          )
        )

        if (post.tags.isNotEmpty()) {
          Spacer(modifier = Modifier.height(4.dp))
          FlowRow(
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp)
          ) {
            post.tags.forEach { tag ->
              Text(
                text = tag,
                style = MaterialTheme.typography.labelMedium.copy(
                  color = SekaCoralPrimary,
                  fontSize = 12.sp,
                  fontWeight = FontWeight.SemiBold
                )
              )
            }
          }
        }
      }

      // 4. Action Rail (Likes, Comments, Shares, Watermark Download, Save)
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .background(SekaSurfaceVariant.copy(alpha = 0.4f))
          .padding(horizontal = 10.dp, vertical = 6.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(
          horizontalArrangement = Arrangement.spacedBy(16.dp),
          verticalAlignment = Alignment.CenterVertically
        ) {
          // Like Button with count
          Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
              .clip(RoundedCornerShape(16.dp))
              .clickable { onLikeClick() }
              .padding(horizontal = 8.dp, vertical = 4.dp)
              .testTag("like_button_${post.id}")
          ) {
            Icon(
              imageVector = if (post.userLiked) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
              contentDescription = "Like",
              tint = if (post.userLiked) SekaCoralPrimary else SekaTextMuted,
              modifier = Modifier.size(22.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(
              text = formatMetric(post.likesCount),
              style = MaterialTheme.typography.labelMedium.copy(
                fontWeight = FontWeight.Bold,
                color = if (post.userLiked) SekaCoralPrimary else SekaTextPrimary
              )
            )

            // Optional reaction emoji if selected
            if (post.selectedReactionEmoji != null) {
              Spacer(modifier = Modifier.width(4.dp))
              Text(text = post.selectedReactionEmoji, fontSize = 14.sp)
            }
          }

          // Comment Button with count
          Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
              .clip(RoundedCornerShape(16.dp))
              .clickable { onCommentClick() }
              .padding(horizontal = 8.dp, vertical = 4.dp)
              .testTag("comment_button_${post.id}")
          ) {
            Icon(
              imageVector = Icons.Default.ChatBubble,
              contentDescription = "Comments",
              tint = SekaTextMuted,
              modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(
              text = formatMetric(post.commentsCount),
              style = MaterialTheme.typography.labelMedium.copy(
                fontWeight = FontWeight.Bold,
                color = SekaTextPrimary
              )
            )
          }

          // Share Button with count
          Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
              .clip(RoundedCornerShape(16.dp))
              .clickable { onShareClick() }
              .padding(horizontal = 8.dp, vertical = 4.dp)
              .testTag("share_button_${post.id}")
          ) {
            Icon(
              imageVector = Icons.Default.Share,
              contentDescription = "Share",
              tint = SekaTextMuted,
              modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(
              text = formatMetric(post.sharesCount),
              style = MaterialTheme.typography.labelMedium.copy(
                fontWeight = FontWeight.Bold,
                color = SekaTextPrimary
              )
            )
          }
        }

        Row(verticalAlignment = Alignment.CenterVertically) {
          // Download With Seka Watermark Button!
          IconButton(
            onClick = onDownloadWatermarkClick,
            modifier = Modifier.testTag("download_watermark_button_${post.id}")
          ) {
            Icon(
              imageVector = Icons.Default.Download,
              contentDescription = "Save with Seka Watermark",
              tint = SekaYellowAccent,
              modifier = Modifier.size(22.dp)
            )
          }

          // Bookmark / Save to collection
          IconButton(
            onClick = onSaveClick,
            modifier = Modifier.testTag("save_collection_button_${post.id}")
          ) {
            Icon(
              imageVector = if (post.userSaved) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
              contentDescription = "Save Meme",
              tint = if (post.userSaved) SekaCoralPrimary else SekaTextMuted,
              modifier = Modifier.size(22.dp)
            )
          }
        }
      }
    }
  }
}

private fun formatMetric(count: Int): String {
  return when {
    count >= 1_000_000 -> String.format("%.1fM", count / 1_000_000f)
    count >= 1_000 -> String.format("%.1fK", count / 1_000f)
    else -> count.toString()
  }
}
