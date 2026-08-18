package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.scaleIn
import androidx.compose.animation.scaleOut
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.MemePost
import com.example.ui.theme.SekaSurface
import com.example.ui.theme.SekaSurfaceVariant

@Composable
fun EmojiReactionPicker(
  post: MemePost,
  onDismiss: () -> Unit,
  onEmojiSelected: (String) -> Unit
) {
  val emojis = listOf("🔥", "💀", "😂", "🎯", "💩", "🤡", "👑", "❤️")

  Dialog(onDismissRequest = onDismiss) {
    Surface(
      shape = RoundedCornerShape(28.dp),
      color = SekaSurface,
      shadowElevation = 12.dp,
      modifier = Modifier.testTag("emoji_reaction_picker_dialog")
    ) {
      Row(
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.padding(horizontal = 16.dp, vertical = 10.dp)
      ) {
        emojis.forEach { emoji ->
          Box(
            modifier = Modifier
              .clip(RoundedCornerShape(14.dp))
              .background(SekaSurfaceVariant)
              .clickable {
                onEmojiSelected(emoji)
              }
              .padding(horizontal = 8.dp, vertical = 6.dp),
            contentAlignment = Alignment.Center
          ) {
            Text(text = emoji, fontSize = 24.sp)
          }
        }
      }
    }
  }
}
