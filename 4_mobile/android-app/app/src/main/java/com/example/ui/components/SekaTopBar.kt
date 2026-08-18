package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.SekaBackground
import com.example.ui.theme.SekaCoralPrimary
import com.example.ui.theme.SekaSurfaceVariant
import com.example.ui.theme.SekaYellowAccent

@Composable
fun SekaTopBar(
  onSearchClick: () -> Unit = {},
  onNotificationClick: () -> Unit = {}
) {
  Surface(
    color = SekaBackground,
    modifier = Modifier.fillMaxWidth()
  ) {
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 16.dp, vertical = 10.dp),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      // Seka Logo Badge
      Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(6.dp),
        modifier = Modifier
          .clip(RoundedCornerShape(12.dp))
          .background(SekaSurfaceVariant)
          .padding(horizontal = 10.dp, vertical = 6.dp)
          .testTag("seka_logo_header")
      ) {
        Box(
          modifier = Modifier
            .size(24.dp)
            .clip(CircleShape)
            .background(SekaCoralPrimary),
          contentAlignment = Alignment.Center
        ) {
          Icon(
            imageVector = Icons.Default.Bolt,
            contentDescription = "Seka Icon",
            tint = SekaYellowAccent,
            modifier = Modifier.size(16.dp)
          )
        }
        Text(
          text = "SEKA",
          style = MaterialTheme.typography.titleLarge.copy(
            fontWeight = FontWeight.Black,
            letterSpacing = 1.sp,
            color = Color.White
          )
        )
      }

      // Action Icons (Search, Notifications)
      Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(4.dp)
      ) {
        IconButton(
          onClick = onSearchClick,
          modifier = Modifier.testTag("search_top_button")
        ) {
          Icon(
            imageVector = Icons.Default.Search,
            contentDescription = "Search Memes",
            tint = Color.White,
            modifier = Modifier.size(24.dp)
          )
        }

        IconButton(
          onClick = onNotificationClick,
          modifier = Modifier.testTag("notification_top_button")
        ) {
          BadgedBox(
            badge = {
              Badge(
                containerColor = SekaCoralPrimary,
                contentColor = Color.White
              ) {
                Text("3")
              }
            }
          ) {
            Icon(
              imageVector = Icons.Default.Notifications,
              contentDescription = "Notifications",
              tint = Color.White,
              modifier = Modifier.size(24.dp)
            )
          }
        }
      }
    }
  }
}
