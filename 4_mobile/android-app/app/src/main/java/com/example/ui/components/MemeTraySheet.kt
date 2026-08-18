package com.example.ui.components

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
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.TabRowDefaults
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
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
import com.example.data.MemePost
import com.example.data.SavedMemeEntity
import com.example.ui.theme.SekaBorder
import com.example.ui.theme.SekaCoralPrimary
import com.example.ui.theme.SekaSurface
import com.example.ui.theme.SekaSurfaceVariant
import com.example.ui.theme.SekaTextMuted
import com.example.ui.theme.SekaTextPrimary
import com.example.ui.theme.SekaYellowAccent

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MemeTraySheet(
  trendingMemes: List<MemePost>,
  savedMemes: List<SavedMemeEntity>,
  onDismiss: () -> Unit,
  onMemeSelected: (String) -> Unit
) {
  val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
  var selectedTab by remember { mutableIntStateOf(0) }
  var searchFilter by remember { mutableStateOf("") }

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    sheetState = sheetState,
    containerColor = SekaSurface,
    modifier = Modifier.testTag("meme_tray_bottom_sheet")
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
        Row(verticalAlignment = Alignment.CenterVertically) {
          Icon(
            imageVector = Icons.Default.Bolt,
            contentDescription = "Meme Tray",
            tint = SekaYellowAccent,
            modifier = Modifier.size(22.dp)
          )
          Spacer(modifier = Modifier.width(6.dp))
          Text(
            text = "Meme Tray",
            style = MaterialTheme.typography.titleLarge.copy(
              fontWeight = FontWeight.Black,
              color = Color.White
            )
          )
        }

        IconButton(onClick = onDismiss) {
          Icon(
            imageVector = Icons.Default.Close,
            contentDescription = "Close",
            tint = SekaTextMuted
          )
        }
      }

      Spacer(modifier = Modifier.height(8.dp))

      // Tabs: Trending Memes vs Saved Collection
      TabRow(
        selectedTabIndex = selectedTab,
        containerColor = Color.Transparent,
        contentColor = SekaCoralPrimary,
        indicator = { tabPositions ->
          TabRowDefaults.SecondaryIndicator(
            Modifier.tabIndicatorOffset(tabPositions[selectedTab]),
            color = SekaCoralPrimary
          )
        }
      ) {
        Tab(
          selected = selectedTab == 0,
          onClick = { selectedTab = 0 },
          text = { Text("Trending Memes 🔥", fontSize = 13.sp, fontWeight = FontWeight.Bold) }
        )
        Tab(
          selected = selectedTab == 1,
          onClick = { selectedTab = 1 },
          text = { Text("Saved Collection 📌 (${savedMemes.size})", fontSize = 13.sp, fontWeight = FontWeight.Bold) }
        )
      }

      Spacer(modifier = Modifier.height(12.dp))

      // Search field
      OutlinedTextField(
        value = searchFilter,
        onValueChange = { searchFilter = it },
        placeholder = { Text("Search memes to drop in chat...", color = SekaTextMuted, fontSize = 13.sp) },
        leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = SekaTextMuted) },
        shape = RoundedCornerShape(12.dp),
        colors = OutlinedTextFieldDefaults.colors(
          focusedBorderColor = SekaCoralPrimary,
          unfocusedBorderColor = SekaBorder,
          focusedContainerColor = SekaSurfaceVariant,
          unfocusedContainerColor = SekaSurfaceVariant,
          focusedTextColor = Color.White,
          unfocusedTextColor = Color.White
        ),
        modifier = Modifier.fillMaxWidth()
      )

      Spacer(modifier = Modifier.height(12.dp))

      // Meme Grid (3 columns)
      if (selectedTab == 0) {
        val filteredTrending = trendingMemes.filter {
          searchFilter.isBlank() || it.caption.contains(searchFilter, ignoreCase = true) || it.category.contains(searchFilter, ignoreCase = true)
        }

        LazyVerticalGrid(
          columns = GridCells.Fixed(3),
          contentPadding = PaddingValues(2.dp),
          horizontalArrangement = Arrangement.spacedBy(8.dp),
          verticalArrangement = Arrangement.spacedBy(8.dp),
          modifier = Modifier
            .fillMaxWidth()
            .height(300.dp)
        ) {
          items(filteredTrending, key = { it.id }) { meme ->
            MemeGridItem(
              imageUrl = meme.mediaUrl,
              title = meme.caption,
              onClick = {
                onMemeSelected(meme.mediaUrl)
                onDismiss()
              }
            )
          }
        }
      } else {
        val filteredSaved = savedMemes.filter {
          searchFilter.isBlank() || it.title.contains(searchFilter, ignoreCase = true)
        }

        if (filteredSaved.isEmpty()) {
          Box(
            modifier = Modifier
              .fillMaxWidth()
              .height(200.dp),
            contentAlignment = Alignment.Center
          ) {
            Text("No saved memes yet! Bookmark memes from Home Feed to drop them here.", color = SekaTextMuted, fontSize = 13.sp)
          }
        } else {
          LazyVerticalGrid(
            columns = GridCells.Fixed(3),
            contentPadding = PaddingValues(2.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier
              .fillMaxWidth()
              .height(300.dp)
          ) {
            items(filteredSaved, key = { it.id }) { saved ->
              MemeGridItem(
                imageUrl = saved.mediaUrl,
                title = saved.title,
                onClick = {
                  onMemeSelected(saved.mediaUrl)
                  onDismiss()
                }
              )
            }
          }
        }
      }
    }
  }
}

@Composable
private fun MemeGridItem(
  imageUrl: String,
  title: String,
  onClick: () -> Unit
) {
  Box(
    modifier = Modifier
      .fillMaxWidth()
      .aspectRatio(1f)
      .clip(RoundedCornerShape(10.dp))
      .background(SekaSurfaceVariant)
      .border(1.dp, SekaBorder, RoundedCornerShape(10.dp))
      .clickable { onClick() }
  ) {
    AsyncImage(
      model = ImageRequest.Builder(LocalContext.current)
        .data(imageUrl)
        .crossfade(true)
        .build(),
      contentDescription = title,
      contentScale = ContentScale.Crop,
      modifier = Modifier.fillMaxSize()
    )

    // Watermark overlay pill
    Box(
      modifier = Modifier
        .align(Alignment.BottomEnd)
        .padding(4.dp)
        .clip(RoundedCornerShape(4.dp))
        .background(Color.Black.copy(alpha = 0.7f))
        .padding(horizontal = 4.dp, vertical = 2.dp)
    ) {
      Text("⚡ Seka", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Color.White)
    }
  }
}
