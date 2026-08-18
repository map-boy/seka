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
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.GridView
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.TabRowDefaults
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
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
import com.example.data.MemePost
import com.example.data.SavedMemeEntity
import com.example.data.User
import com.example.ui.theme.SekaBackground
import com.example.ui.theme.SekaBorder
import com.example.ui.theme.SekaCoralPrimary
import com.example.ui.theme.SekaSurface
import com.example.ui.theme.SekaSurfaceVariant
import com.example.ui.theme.SekaTextMuted
import com.example.ui.theme.SekaTextPrimary
import com.example.ui.theme.SekaYellowAccent

@Composable
fun ProfileScreen(
  user: User,
  myPosts: List<MemePost>,
  savedMemes: List<SavedMemeEntity>,
  likedPosts: List<MemePost>,
  onPostClick: (MemePost) -> Unit
) {
  var activeTab by remember { mutableIntStateOf(0) }

  Column(
    modifier = Modifier
      .fillMaxSize()
      .background(SekaBackground)
      .testTag("profile_screen")
  ) {
    // 1. Header Bar with Settings
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 16.dp, vertical = 12.dp),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      Text(
        text = user.handle,
        style = MaterialTheme.typography.titleLarge.copy(
          fontWeight = FontWeight.Black,
          fontSize = 20.sp,
          color = Color.White
        )
      )

      IconButton(onClick = {}) {
        Icon(
          imageVector = Icons.Default.Settings,
          contentDescription = "Settings",
          tint = Color.White
        )
      }
    }

    // 2. Profile Details Header
    Column(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 16.dp),
      horizontalAlignment = Alignment.CenterHorizontally
    ) {
      Box(contentAlignment = Alignment.BottomEnd) {
        AsyncImage(
          model = ImageRequest.Builder(LocalContext.current)
            .data(user.avatarUrl)
            .crossfade(true)
            .build(),
          contentDescription = user.name,
          contentScale = ContentScale.Crop,
          modifier = Modifier
            .size(86.dp)
            .clip(CircleShape)
            .border(3.dp, SekaCoralPrimary, CircleShape)
        )

        // Badge Pill
        Box(
          modifier = Modifier
            .clip(RoundedCornerShape(8.dp))
            .background(SekaCoralPrimary)
            .padding(horizontal = 6.dp, vertical = 2.dp)
        ) {
          Text("🏆", fontSize = 10.sp)
        }
      }

      Spacer(modifier = Modifier.height(10.dp))

      Text(
        text = user.name,
        style = MaterialTheme.typography.titleLarge.copy(
          fontWeight = FontWeight.Bold,
          fontSize = 18.sp,
          color = Color.White
        )
      )

      Surface(
        shape = RoundedCornerShape(12.dp),
        color = SekaSurfaceVariant,
        modifier = Modifier.padding(top = 4.dp)
      ) {
        Text(
          text = user.badge,
          style = MaterialTheme.typography.labelMedium.copy(
            color = SekaYellowAccent,
            fontWeight = FontWeight.Bold,
            fontSize = 11.sp
          ),
          modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
        )
      }

      Spacer(modifier = Modifier.height(6.dp))

      Text(
        text = user.bio,
        style = MaterialTheme.typography.bodyMedium.copy(
          color = SekaTextPrimary,
          fontSize = 13.sp,
          textAlign = TextAlign.Center
        ),
        modifier = Modifier.padding(horizontal = 24.dp)
      )

      Spacer(modifier = Modifier.height(16.dp))

      // Stats Row: Posts | Followers | Following | Likes
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .clip(RoundedCornerShape(16.dp))
          .background(SekaSurface)
          .padding(vertical = 12.dp),
        horizontalArrangement = Arrangement.SpaceAround
      ) {
        StatItem(label = "Memes", value = user.postCount.toString())
        StatItem(label = "Followers", value = formatStat(user.followerCount))
        StatItem(label = "Following", value = user.followingCount.toString())
        StatItem(label = "Total Likes", value = formatStat(user.totalLikes))
      }

      Spacer(modifier = Modifier.height(16.dp))

      // Edit Profile / Share Actions
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(10.dp)
      ) {
        Button(
          onClick = {},
          colors = ButtonDefaults.buttonColors(containerColor = SekaSurfaceVariant),
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier.weight(1f)
        ) {
          Icon(Icons.Default.Edit, contentDescription = null, modifier = Modifier.size(16.dp))
          Spacer(modifier = Modifier.width(6.dp))
          Text("Edit Profile", fontWeight = FontWeight.Bold, fontSize = 13.sp)
        }

        Button(
          onClick = {},
          colors = ButtonDefaults.buttonColors(containerColor = SekaCoralPrimary),
          shape = RoundedCornerShape(12.dp),
          modifier = Modifier.weight(1f)
        ) {
          Icon(Icons.Default.Share, contentDescription = null, modifier = Modifier.size(16.dp))
          Spacer(modifier = Modifier.width(6.dp))
          Text("Share Profile", fontWeight = FontWeight.Bold, fontSize = 13.sp)
        }
      }
    }

    Spacer(modifier = Modifier.height(16.dp))

    // 3. Profile Tabs: My Memes | Saved Collection | Liked Memes
    TabRow(
      selectedTabIndex = activeTab,
      containerColor = Color.Transparent,
      contentColor = SekaCoralPrimary,
      indicator = { tabPositions ->
        TabRowDefaults.SecondaryIndicator(
          Modifier.tabIndicatorOffset(tabPositions[activeTab]),
          color = SekaCoralPrimary
        )
      }
    ) {
      Tab(
        selected = activeTab == 0,
        onClick = { activeTab = 0 },
        text = { Text("My Memes", fontSize = 12.sp, fontWeight = FontWeight.Bold) },
        icon = { Icon(Icons.Default.GridView, contentDescription = null, modifier = Modifier.size(18.dp)) }
      )
      Tab(
        selected = activeTab == 1,
        onClick = { activeTab = 1 },
        text = { Text("Saved (${savedMemes.size})", fontSize = 12.sp, fontWeight = FontWeight.Bold) },
        icon = { Icon(Icons.Default.Bookmark, contentDescription = null, modifier = Modifier.size(18.dp)) }
      )
      Tab(
        selected = activeTab == 2,
        onClick = { activeTab = 2 },
        text = { Text("Liked", fontSize = 12.sp, fontWeight = FontWeight.Bold) },
        icon = { Icon(Icons.Default.Favorite, contentDescription = null, modifier = Modifier.size(18.dp)) }
      )
    }

    Spacer(modifier = Modifier.height(10.dp))

    // 4. Grid Content
    when (activeTab) {
      0 -> {
        LazyVerticalGrid(
          columns = GridCells.Fixed(3),
          contentPadding = PaddingValues(horizontal = 16.dp, vertical = 4.dp),
          horizontalArrangement = Arrangement.spacedBy(8.dp),
          verticalArrangement = Arrangement.spacedBy(8.dp),
          modifier = Modifier
            .fillMaxSize()
            .padding(bottom = 80.dp)
        ) {
          items(myPosts, key = { it.id }) { post ->
            ProfileMemeGridItem(imageUrl = post.mediaUrl, caption = post.caption, onClick = { onPostClick(post) })
          }
        }
      }

      1 -> {
        if (savedMemes.isEmpty()) {
          Box(
            modifier = Modifier
              .fillMaxSize()
              .padding(32.dp),
            contentAlignment = Alignment.Center
          ) {
            Text("No saved memes in collection yet!", color = SekaTextMuted, fontSize = 14.sp)
          }
        } else {
          LazyVerticalGrid(
            columns = GridCells.Fixed(3),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 4.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier
              .fillMaxSize()
              .padding(bottom = 80.dp)
          ) {
            items(savedMemes, key = { it.id }) { item ->
              ProfileMemeGridItem(imageUrl = item.mediaUrl, caption = item.title, onClick = {})
            }
          }
        }
      }

      2 -> {
        LazyVerticalGrid(
          columns = GridCells.Fixed(3),
          contentPadding = PaddingValues(horizontal = 16.dp, vertical = 4.dp),
          horizontalArrangement = Arrangement.spacedBy(8.dp),
          verticalArrangement = Arrangement.spacedBy(8.dp),
          modifier = Modifier
            .fillMaxSize()
            .padding(bottom = 80.dp)
        ) {
          items(likedPosts, key = { it.id }) { post ->
            ProfileMemeGridItem(imageUrl = post.mediaUrl, caption = post.caption, onClick = { onPostClick(post) })
          }
        }
      }
    }
  }
}

@Composable
private fun StatItem(label: String, value: String) {
  Column(horizontalAlignment = Alignment.CenterHorizontally) {
    Text(
      text = value,
      style = MaterialTheme.typography.titleMedium.copy(
        fontWeight = FontWeight.Black,
        fontSize = 15.sp,
        color = Color.White
      )
    )
    Text(
      text = label,
      style = MaterialTheme.typography.labelMedium.copy(
        fontSize = 11.sp,
        color = SekaTextMuted
      )
    )
  }
}

@Composable
private fun ProfileMemeGridItem(imageUrl: String, caption: String, onClick: () -> Unit) {
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
      contentDescription = caption,
      contentScale = ContentScale.Crop,
      modifier = Modifier.fillMaxSize()
    )

    Box(
      modifier = Modifier
        .align(Alignment.BottomEnd)
        .padding(4.dp)
        .clip(RoundedCornerShape(4.dp))
        .background(Color.Black.copy(alpha = 0.75f))
        .padding(horizontal = 4.dp, vertical = 2.dp)
    ) {
      Text("⚡ Seka", fontSize = 8.sp, fontWeight = FontWeight.Bold, color = Color.White)
    }
  }
}

private fun formatStat(count: Int): String {
  return when {
    count >= 1_000_000 -> String.format("%.1fM", count / 1_000_000f)
    count >= 1_000 -> String.format("%.1fK", count / 1_000f)
    else -> count.toString()
  }
}
