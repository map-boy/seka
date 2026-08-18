package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.example.data.StatusItem
import com.example.ui.theme.SekaCoralPrimary
import com.example.ui.theme.SekaSurfaceVariant
import com.example.ui.theme.SekaTextMuted
import com.example.ui.theme.SekaTextPrimary
import com.example.ui.theme.SekaYellowAccent
import com.example.ui.theme.SekaCyanAccent

import androidx.compose.ui.graphics.SolidColor

@Composable
fun StatusRingHeader(
  statuses: List<StatusItem>,
  onStatusClick: (StatusItem) -> Unit,
  onAddStatusClick: () -> Unit
) {
  LazyRow(
    contentPadding = PaddingValues(horizontal = 14.dp, vertical = 8.dp),
    horizontalArrangement = Arrangement.spacedBy(14.dp),
    modifier = Modifier.testTag("status_ring_row")
  ) {
    // 1. My Status Item with Add Button
    item {
      Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
          .width(68.dp)
          .clickable { onAddStatusClick() }
          .testTag("add_my_status_button")
      ) {
        Box(
          modifier = Modifier.size(62.dp),
          contentAlignment = Alignment.Center
        ) {
          Box(
            modifier = Modifier
              .size(58.dp)
              .clip(CircleShape)
              .background(SekaSurfaceVariant)
              .border(2.dp, SekaCoralPrimary, CircleShape),
            contentAlignment = Alignment.Center
          ) {
            Icon(
              imageVector = Icons.Default.Bolt,
              contentDescription = "My Status",
              tint = SekaYellowAccent,
              modifier = Modifier.size(26.dp)
            )
          }

          // + badge
          Box(
            modifier = Modifier
              .size(20.dp)
              .clip(CircleShape)
              .background(SekaCoralPrimary)
              .align(Alignment.BottomEnd),
            contentAlignment = Alignment.Center
          ) {
            Icon(
              imageVector = Icons.Default.Add,
              contentDescription = "Add",
              tint = Color.White,
              modifier = Modifier.size(14.dp)
            )
          }
        }

        Text(
          text = "My Status",
          style = MaterialTheme.typography.labelMedium.copy(
            fontSize = 11.sp,
            fontWeight = FontWeight.SemiBold,
            color = SekaTextPrimary
          ),
          maxLines = 1,
          overflow = TextOverflow.Ellipsis,
          modifier = Modifier.padding(top = 4.dp)
        )
      }
    }

    // 2. Peer Status Rings
    items(statuses, key = { it.id }) { item ->
      val ringBrush = if (!item.isViewed) {
        Brush.sweepGradient(listOf(SekaYellowAccent, SekaCyanAccent, SekaYellowAccent))
      } else {
        SolidColor(SekaSurfaceVariant)
      }

      Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
          .width(68.dp)
          .clickable { onStatusClick(item) }
          .testTag("status_ring_item_${item.id}")
      ) {
        Box(
          modifier = Modifier
            .size(62.dp)
            .border(2.dp, ringBrush, CircleShape)
            .padding(3.dp),
          contentAlignment = Alignment.Center
        ) {
          AsyncImage(
            model = ImageRequest.Builder(LocalContext.current)
              .data(item.userAvatar)
              .crossfade(true)
              .build(),
            contentDescription = item.userName,
            contentScale = ContentScale.Crop,
            modifier = Modifier
              .fillMaxSize()
              .clip(CircleShape)
          )
        }

        Text(
          text = item.userName,
          style = MaterialTheme.typography.labelMedium.copy(
            fontSize = 11.sp,
            color = if (item.isViewed) SekaTextMuted else SekaTextPrimary
          ),
          maxLines = 1,
          overflow = TextOverflow.Ellipsis,
          modifier = Modifier.padding(top = 4.dp)
        )
      }
    }
  }
}
