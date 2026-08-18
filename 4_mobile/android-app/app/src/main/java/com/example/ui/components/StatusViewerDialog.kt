package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.example.data.StatusItem
import com.example.ui.theme.SekaCoralPrimary
import com.example.ui.theme.SekaSurfaceVariant
import com.example.ui.theme.SekaYellowAccent
import kotlinx.coroutines.delay

@Composable
fun StatusViewerDialog(
  statusItem: StatusItem,
  onDismiss: () -> Unit,
  onShareToMyStatus: () -> Unit,
  onDropToChat: () -> Unit
) {
  var progress by remember { mutableFloatStateOf(0f) }

  LaunchedEffect(statusItem) {
    progress = 0f
    val totalMs = 5000L
    val stepMs = 50L
    val steps = totalMs / stepMs
    for (i in 1..steps) {
      delay(stepMs)
      progress = i.toFloat() / steps
    }
    onDismiss()
  }

  Dialog(
    onDismissRequest = onDismiss,
    properties = DialogProperties(usePlatformDefaultWidth = false)
  ) {
    Box(
      modifier = Modifier
        .fillMaxSize()
        .background(Color.Black)
        .testTag("status_viewer_dialog")
    ) {
      // Meme Image Background
      AsyncImage(
        model = ImageRequest.Builder(LocalContext.current)
          .data(statusItem.mediaUrl)
          .crossfade(true)
          .build(),
        contentDescription = "Status Meme",
        contentScale = ContentScale.Fit,
        modifier = Modifier.fillMaxSize()
      )

      // Top Progress & User Header Overlay
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .background(Color.Black.copy(alpha = 0.5f))
          .padding(16.dp)
          .align(Alignment.TopCenter)
      ) {
        // Progress Bar
        LinearProgressIndicator(
          progress = { progress },
          modifier = Modifier
            .fillMaxWidth()
            .height(4.dp)
            .clip(RoundedCornerShape(2.dp)),
          color = SekaCoralPrimary,
          trackColor = Color.White.copy(alpha = 0.3f)
        )

        Spacer(modifier = Modifier.height(12.dp))

        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Row(verticalAlignment = Alignment.CenterVertically) {
            AsyncImage(
              model = ImageRequest.Builder(LocalContext.current)
                .data(statusItem.userAvatar)
                .crossfade(true)
                .build(),
              contentDescription = statusItem.userName,
              contentScale = ContentScale.Crop,
              modifier = Modifier
                .size(40.dp)
                .clip(CircleShape)
            )

            Spacer(modifier = Modifier.width(10.dp))

            Column {
              Text(
                text = statusItem.userName,
                style = MaterialTheme.typography.titleMedium.copy(
                  fontWeight = FontWeight.Bold,
                  color = Color.White
                )
              )
              Text(
                text = statusItem.timestampAgo,
                style = MaterialTheme.typography.bodyMedium.copy(
                  fontSize = 12.sp,
                  color = Color.White.copy(alpha = 0.7f)
                )
              )
            }
          }

          IconButton(onClick = onDismiss) {
            Icon(
              imageVector = Icons.Default.Close,
              contentDescription = "Close",
              tint = Color.White
            )
          }
        }
      }

      // Seka Watermark Badge on bottom right of status
      Box(
        modifier = Modifier
          .align(Alignment.BottomEnd)
          .padding(end = 16.dp, bottom = 90.dp)
          .clip(RoundedCornerShape(8.dp))
          .background(Color.Black.copy(alpha = 0.75f))
          .padding(horizontal = 8.dp, vertical = 4.dp)
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Icon(
            imageVector = Icons.Default.Bolt,
            contentDescription = null,
            tint = SekaCoralPrimary,
            modifier = Modifier.size(12.dp)
          )
          Spacer(modifier = Modifier.width(2.dp))
          Text(
            text = "Seka",
            style = MaterialTheme.typography.labelMedium.copy(
              fontSize = 11.sp,
              fontWeight = FontWeight.Bold,
              color = Color.White
            )
          )
        }
      }

      // Bottom Bar Actions (Views count + Re-status + Chat drop)
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .background(Color.Black.copy(alpha = 0.65f))
          .padding(16.dp)
          .align(Alignment.BottomCenter)
      ) {
        if (statusItem.caption.isNotBlank()) {
          Text(
            text = statusItem.caption,
            style = MaterialTheme.typography.bodyLarge.copy(
              color = Color.White,
              fontWeight = FontWeight.SemiBold
            ),
            modifier = Modifier.padding(bottom = 12.dp)
          )
        }

        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
              .clip(RoundedCornerShape(16.dp))
              .background(SekaSurfaceVariant)
              .padding(horizontal = 10.dp, vertical = 6.dp)
          ) {
            Icon(
              imageVector = Icons.Default.Visibility,
              contentDescription = "Views",
              tint = SekaYellowAccent,
              modifier = Modifier.size(16.dp)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
              text = "${statusItem.viewsCount} views",
              style = MaterialTheme.typography.labelMedium.copy(color = Color.White)
            )
          }

          Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(
              onClick = {
                onShareToMyStatus()
                onDismiss()
              },
              colors = ButtonDefaults.buttonColors(containerColor = SekaCoralPrimary),
              shape = RoundedCornerShape(20.dp)
            ) {
              Icon(
                imageVector = Icons.Default.Bolt,
                contentDescription = null,
                modifier = Modifier.size(16.dp)
              )
              Spacer(modifier = Modifier.width(4.dp))
              Text("Post to Status", fontSize = 12.sp)
            }

            Button(
              onClick = {
                onDropToChat()
                onDismiss()
              },
              colors = ButtonDefaults.buttonColors(containerColor = SekaYellowAccent, contentColor = Color.Black),
              shape = RoundedCornerShape(20.dp)
            ) {
              Icon(
                imageVector = Icons.Default.Send,
                contentDescription = null,
                modifier = Modifier.size(16.dp)
              )
              Spacer(modifier = Modifier.width(4.dp))
              Text("Chat", fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
          }
        }
      }
    }
  }
}
