package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.example.data.Comment
import com.example.data.MemePost
import com.example.ui.theme.SekaBorder
import com.example.ui.theme.SekaCoralPrimary
import com.example.ui.theme.SekaSurface
import com.example.ui.theme.SekaSurfaceVariant
import com.example.ui.theme.SekaTextMuted
import com.example.ui.theme.SekaTextPrimary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CommentBottomSheet(
  post: MemePost,
  comments: List<Comment>,
  onDismiss: () -> Unit,
  onAddComment: (String) -> Unit
) {
  val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
  var commentInput by remember { mutableStateOf("") }

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    sheetState = sheetState,
    containerColor = SekaSurface,
    modifier = Modifier.testTag("comment_bottom_sheet")
  ) {
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 16.dp)
        .padding(bottom = 16.dp)
    ) {
      // Header
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Text(
          text = "Comments (${post.commentsCount})",
          style = MaterialTheme.typography.titleLarge.copy(
            fontWeight = FontWeight.Bold,
            color = Color.White
          )
        )
        IconButton(onClick = onDismiss) {
          Icon(
            imageVector = Icons.Default.Close,
            contentDescription = "Close",
            tint = SekaTextMuted
          )
        }
      }

      Spacer(modifier = Modifier.height(12.dp))

      // Comments list
      LazyColumn(
        modifier = Modifier
          .fillMaxWidth()
          .height(340.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
      ) {
        items(comments, key = { it.id }) { item ->
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.Top
          ) {
            Row(modifier = Modifier.weight(1f)) {
              AsyncImage(
                model = ImageRequest.Builder(LocalContext.current)
                  .data(item.authorAvatar)
                  .crossfade(true)
                  .build(),
                contentDescription = item.authorName,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                  .size(36.dp)
                  .clip(CircleShape)
              )

              Spacer(modifier = Modifier.width(10.dp))

              Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                  Text(
                    text = item.authorName,
                    style = MaterialTheme.typography.titleMedium.copy(
                      fontSize = 13.sp,
                      fontWeight = FontWeight.Bold
                    )
                  )
                  Spacer(modifier = Modifier.width(6.dp))
                  Text(
                    text = item.timestampAgo,
                    style = MaterialTheme.typography.bodyMedium.copy(
                      fontSize = 11.sp,
                      color = SekaTextMuted
                    )
                  )
                }

                Spacer(modifier = Modifier.height(2.dp))

                Text(
                  text = item.text,
                  style = MaterialTheme.typography.bodyMedium.copy(
                    fontSize = 13.sp,
                    color = SekaTextPrimary
                  )
                )
              }
            }

            Row(verticalAlignment = Alignment.CenterVertically) {
              Icon(
                imageVector = if (item.userLiked) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                contentDescription = "Like",
                tint = if (item.userLiked) SekaCoralPrimary else SekaTextMuted,
                modifier = Modifier.size(16.dp)
              )
              Spacer(modifier = Modifier.width(3.dp))
              Text(
                text = item.likesCount.toString(),
                style = MaterialTheme.typography.labelMedium.copy(fontSize = 11.sp)
              )
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(12.dp))

      // Quick Emoji Row
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceAround
      ) {
        listOf("🔥", "💀", "😂", "🎯", "🤡", "🗿").forEach { emoji ->
          Box(
            modifier = Modifier
              .clip(CircleShape)
              .background(SekaSurfaceVariant)
              .clickable { commentInput += emoji }
              .padding(horizontal = 12.dp, vertical = 6.dp)
          ) {
            Text(emoji, fontSize = 18.sp)
          }
        }
      }

      Spacer(modifier = Modifier.height(12.dp))

      // Input field
      Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
      ) {
        OutlinedTextField(
          value = commentInput,
          onValueChange = { commentInput = it },
          placeholder = { Text("Add a meme comment...", color = SekaTextMuted) },
          shape = RoundedCornerShape(24.dp),
          colors = OutlinedTextFieldDefaults.colors(
            focusedBorderColor = SekaCoralPrimary,
            unfocusedBorderColor = SekaBorder,
            focusedContainerColor = SekaSurfaceVariant,
            unfocusedContainerColor = SekaSurfaceVariant,
            focusedTextColor = Color.White,
            unfocusedTextColor = Color.White
          ),
          modifier = Modifier
            .weight(1f)
            .testTag("comment_input_field")
        )

        Spacer(modifier = Modifier.width(8.dp))

        IconButton(
          onClick = {
            if (commentInput.isNotBlank()) {
              onAddComment(commentInput)
              commentInput = ""
            }
          },
          modifier = Modifier
            .size(48.dp)
            .clip(CircleShape)
            .background(SekaCoralPrimary)
            .testTag("send_comment_button")
        ) {
          Icon(
            imageVector = Icons.Default.Send,
            contentDescription = "Post Comment",
            tint = Color.White,
            modifier = Modifier.size(20.dp)
          )
        }
      }
    }
  }
}
