package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.TabRowDefaults
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.MemePost
import com.example.data.StatusItem
import com.example.ui.components.MemeCard
import com.example.ui.components.SekaTopBar
import com.example.ui.components.StatusRingHeader
import com.example.ui.theme.SekaBackground
import com.example.ui.theme.SekaCoralPrimary
import com.example.ui.theme.SekaSurfaceVariant
import com.example.ui.theme.SekaTextMuted
import com.example.ui.theme.SekaYellowAccent

@Composable
fun HomeScreen(
  posts: List<MemePost>,
  statuses: List<StatusItem>,
  categories: List<String>,
  selectedCategory: String,
  selectedHomeSubTab: String,
  onSelectSubTab: (String) -> Unit,
  onSelectCategory: (String) -> Unit,
  onStatusClick: (StatusItem) -> Unit,
  onAddStatusClick: () -> Unit,
  onLikeClick: (String) -> Unit,
  onSaveClick: (MemePost) -> Unit,
  onCommentClick: (MemePost) -> Unit,
  onShareClick: (MemePost) -> Unit,
  onDownloadWatermarkClick: (MemePost) -> Unit,
  onLongPressReaction: (MemePost) -> Unit,
  onSearchClick: () -> Unit
) {
  Column(
    modifier = Modifier
      .fillMaxSize()
      .background(SekaBackground)
  ) {
    // 1. Top Header
    SekaTopBar(
      onSearchClick = onSearchClick
    )

    // 2. 24h Status / Stories Ring Carousel
    StatusRingHeader(
      statuses = statuses,
      onStatusClick = onStatusClick,
      onAddStatusClick = onAddStatusClick
    )

    // 3. Sub Tabs: "For You" | "Following" | "Trending"
    val subTabs = listOf("For You", "Following", "Trending")
    val selectedIndex = subTabs.indexOf(selectedHomeSubTab).coerceAtLeast(0)

    TabRow(
      selectedTabIndex = selectedIndex,
      containerColor = Color.Transparent,
      contentColor = SekaCoralPrimary,
      indicator = { tabPositions ->
        TabRowDefaults.SecondaryIndicator(
          Modifier.tabIndicatorOffset(tabPositions[selectedIndex]),
          color = SekaCoralPrimary
        )
      },
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 8.dp)
        .testTag("home_sub_tabs")
    ) {
      subTabs.forEachIndexed { index, tabName ->
        Tab(
          selected = selectedIndex == index,
          onClick = { onSelectSubTab(tabName) },
          text = {
            Text(
              text = tabName,
              fontSize = 14.sp,
              fontWeight = if (selectedIndex == index) FontWeight.Black else FontWeight.Medium
            )
          }
        )
      }
    }

    // 4. Horizontal Categories Scroll
    LazyRow(
      contentPadding = PaddingValues(horizontal = 14.dp, vertical = 8.dp),
      horizontalArrangement = Arrangement.spacedBy(8.dp),
      modifier = Modifier.testTag("categories_row")
    ) {
      items(categories) { cat ->
        val isSelected = (cat == selectedCategory)
        Surface(
          shape = RoundedCornerShape(16.dp),
          color = if (isSelected) SekaCoralPrimary else SekaSurfaceVariant,
          modifier = Modifier
            .clickable { onSelectCategory(cat) }
            .testTag("category_pill_$cat")
        ) {
          Text(
            text = cat,
            style = MaterialTheme.typography.labelMedium.copy(
              color = if (isSelected) Color.White else SekaTextMuted,
              fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
              fontSize = 12.sp
            ),
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
          )
        }
      }
    }

    // 5. Infinite Vertical Feed of Memes (Photo + Reels)
    if (posts.isEmpty()) {
      Column(
        modifier = Modifier
          .fillMaxSize()
          .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
      ) {
        Text("No memes found in this feed!", color = SekaTextMuted, fontSize = 16.sp)
        Spacer(modifier = Modifier.height(8.dp))
        Text("Try switching categories or upload your own meme 🚀", color = SekaCoralPrimary, fontSize = 13.sp)
      }
    } else {
      LazyColumn(
        contentPadding = PaddingValues(bottom = 100.dp),
        modifier = Modifier.fillMaxSize()
      ) {
        items(posts, key = { it.id }) { post ->
          MemeCard(
            post = post,
            onLikeClick = { onLikeClick(post.id) },
            onSaveClick = { onSaveClick(post) },
            onCommentClick = { onCommentClick(post) },
            onShareClick = { onShareClick(post) },
            onDownloadWatermarkClick = { onDownloadWatermarkClick(post) },
            onLongPressReaction = { onLongPressReaction(post) }
          )
        }
      }
    }
  }
}
