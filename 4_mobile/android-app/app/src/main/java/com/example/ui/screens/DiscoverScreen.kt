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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.itemsIndexed
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
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
fun DiscoverScreen(
  posts: List<MemePost>,
  creators: List<User>,
  searchQuery: String,
  onSearchQueryChange: (String) -> Unit,
  onMemeClick: (MemePost) -> Unit,
  onCreatorClick: (User) -> Unit
) {
  // Sort posts by combined 24h virality score: likes + shares*2 + downloads*3
  val trendingLeaderboard = posts.sortedByDescending {
    it.likesCount + (it.sharesCount * 2) + (it.downloadsCount * 3)
  }

  val trendingTags = listOf(
    "#TechHumor", "#CatMeme", "#Relatable", "#CodingLife", "#AnimeMemes", "#Dank", "#Gaming", "#BrokeLife"
  )

  LazyColumn(
    contentPadding = PaddingValues(bottom = 100.dp),
    modifier = Modifier
      .fillMaxSize()
      .background(SekaBackground)
      .testTag("discover_screen")
  ) {
    // 1. Title Header & Search Bar
    item {
      Column(modifier = Modifier.padding(16.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Icon(
            imageVector = Icons.Default.LocalFireDepartment,
            contentDescription = "Trending",
            tint = SekaCoralPrimary,
            modifier = Modifier.size(28.dp)
          )
          Spacer(modifier = Modifier.width(8.dp))
          Text(
            text = "Discover & 24h Rank",
            style = MaterialTheme.typography.displayLarge.copy(
              fontSize = 24.sp,
              fontWeight = FontWeight.Black
            )
          )
        }

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
          value = searchQuery,
          onValueChange = onSearchQueryChange,
          placeholder = { Text("Search memes, tags (#anime), creators...", color = SekaTextMuted, fontSize = 14.sp) },
          leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Search", tint = SekaCoralPrimary) },
          shape = RoundedCornerShape(16.dp),
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
            .testTag("discover_search_input")
        )
      }
    }

    // 2. Trending Tags Chips
    item {
      Column(modifier = Modifier.padding(vertical = 4.dp)) {
        Text(
          text = "TRENDING TAGS",
          style = MaterialTheme.typography.labelMedium.copy(
            color = SekaTextMuted,
            letterSpacing = 1.sp,
            fontWeight = FontWeight.Bold
          ),
          modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)
        )

        LazyRow(
          contentPadding = PaddingValues(horizontal = 16.dp),
          horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
          items(trendingTags) { tag ->
            Surface(
              shape = RoundedCornerShape(12.dp),
              color = SekaSurfaceVariant,
              modifier = Modifier
                .clickable { onSearchQueryChange(tag) }
                .border(1.dp, SekaBorder, RoundedCornerShape(12.dp))
            ) {
              Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
              ) {
                Text(
                  text = tag,
                  style = MaterialTheme.typography.labelMedium.copy(
                    color = SekaYellowAccent,
                    fontWeight = FontWeight.Bold
                  )
                )
              }
            }
          }
        }
      }
    }

    // 3. Featured Meme Creators Horizontal Bar
    item {
      Column(modifier = Modifier.padding(top = 16.dp)) {
        Text(
          text = "TOP MEME CREATORS 👑",
          style = MaterialTheme.typography.labelMedium.copy(
            color = SekaTextMuted,
            letterSpacing = 1.sp,
            fontWeight = FontWeight.Bold
          ),
          modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)
        )

        LazyRow(
          contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
          horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
          items(creators) { creator ->
            Card(
              shape = RoundedCornerShape(16.dp),
              colors = CardDefaults.cardColors(containerColor = SekaSurface),
              modifier = Modifier
                .width(130.dp)
                .clickable { onCreatorClick(creator) }
            ) {
              Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.padding(12.dp)
              ) {
                AsyncImage(
                  model = ImageRequest.Builder(LocalContext.current)
                    .data(creator.avatarUrl)
                    .crossfade(true)
                    .build(),
                  contentDescription = creator.name,
                  contentScale = ContentScale.Crop,
                  modifier = Modifier
                    .size(52.dp)
                    .clip(CircleShape)
                    .border(2.dp, SekaCoralPrimary, CircleShape)
                )

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                  text = creator.name,
                  style = MaterialTheme.typography.titleMedium.copy(
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold
                  ),
                  maxLines = 1
                )

                Text(
                  text = creator.handle,
                  style = MaterialTheme.typography.bodyMedium.copy(
                    fontSize = 11.sp,
                    color = SekaCoralPrimary
                  ),
                  maxLines = 1
                )

                Spacer(modifier = Modifier.height(6.dp))

                Button(
                  onClick = { onCreatorClick(creator) },
                  colors = ButtonDefaults.buttonColors(
                    containerColor = if (creator.isFollowing) SekaSurfaceVariant else SekaCoralPrimary
                  ),
                  shape = RoundedCornerShape(12.dp),
                  contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                  modifier = Modifier.height(26.dp)
                ) {
                  Text(
                    text = if (creator.isFollowing) "Following" else "Follow",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold
                  )
                }
              }
            }
          }
        }
      }
    }

    // 4. 24h Virality Leaderboard Header
    item {
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .padding(horizontal = 16.dp, vertical = 14.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Icon(
            imageVector = Icons.Default.TrendingUp,
            contentDescription = null,
            tint = SekaYellowAccent,
            modifier = Modifier.size(22.dp)
          )
          Spacer(modifier = Modifier.width(6.dp))
          Text(
            text = "24H VIRALITY RANK 🏆",
            style = MaterialTheme.typography.titleLarge.copy(
              fontWeight = FontWeight.Black,
              fontSize = 16.sp
            )
          )
        }

        Text(
          text = "Ranked by Likes+Shares+Downloads",
          style = MaterialTheme.typography.labelMedium.copy(color = SekaTextMuted, fontSize = 11.sp)
        )
      }
    }

    // 5. Leaderboard Grid (2 columns)
    item {
      Column(modifier = Modifier.padding(horizontal = 16.dp)) {
        trendingLeaderboard.chunked(2).forEachIndexed { rowIndex, pair ->
          Row(
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            modifier = Modifier
              .fillMaxWidth()
              .padding(bottom = 10.dp)
          ) {
            pair.forEachIndexed { colIndex, post ->
              val rankNum = (rowIndex * 2) + colIndex + 1
              LeaderboardCard(
                rank = rankNum,
                post = post,
                modifier = Modifier.weight(1f),
                onClick = { onMemeClick(post) }
              )
            }
            if (pair.size == 1) {
              Spacer(modifier = Modifier.weight(1f))
            }
          }
        }
      }
    }
  }
}

@Composable
private fun LeaderboardCard(
  rank: Int,
  post: MemePost,
  modifier: Modifier = Modifier,
  onClick: () -> Unit
) {
  Card(
    shape = RoundedCornerShape(14.dp),
    colors = CardDefaults.cardColors(containerColor = SekaSurface),
    modifier = modifier
      .clickable { onClick() }
      .testTag("leaderboard_card_rank_$rank")
  ) {
    Column {
      Box(
        modifier = Modifier
          .fillMaxWidth()
          .aspectRatio(1f)
          .clip(RoundedCornerShape(topStart = 14.dp, topEnd = 14.dp))
          .background(Color.Black)
      ) {
        AsyncImage(
          model = ImageRequest.Builder(LocalContext.current)
            .data(post.mediaUrl)
            .crossfade(true)
            .build(),
          contentDescription = post.caption,
          contentScale = ContentScale.Crop,
          modifier = Modifier.fillMaxSize()
        )

        // Rank Badge Overlay
        val badgeBg = when (rank) {
          1 -> SekaCoralPrimary
          2 -> SekaYellowAccent
          3 -> SekaSurfaceVariant
          else -> Color.Black.copy(alpha = 0.75f)
        }
        val badgeText = when (rank) {
          1 -> "🥇 #1"
          2 -> "🥈 #2"
          3 -> "🥉 #3"
          else -> "#$rank"
        }

        Box(
          modifier = Modifier
            .padding(6.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(badgeBg)
            .padding(horizontal = 6.dp, vertical = 2.dp)
            .align(Alignment.TopStart)
        ) {
          Text(
            text = badgeText,
            style = MaterialTheme.typography.labelMedium.copy(
              color = if (rank == 2) Color.Black else Color.White,
              fontWeight = FontWeight.Black,
              fontSize = 11.sp
            )
          )
        }

        // Watermark badge
        Box(
          modifier = Modifier
            .padding(6.dp)
            .clip(RoundedCornerShape(4.dp))
            .background(Color.Black.copy(alpha = 0.7f))
            .padding(horizontal = 4.dp, vertical = 2.dp)
            .align(Alignment.BottomEnd)
        ) {
          Text("⚡ Seka", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Color.White)
        }
      }

      Column(modifier = Modifier.padding(10.dp)) {
        Text(
          text = post.caption,
          style = MaterialTheme.typography.bodyMedium.copy(
            fontWeight = FontWeight.SemiBold,
            fontSize = 12.sp,
            color = Color.White
          ),
          maxLines = 2
        )

        Spacer(modifier = Modifier.height(6.dp))

        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Default.Favorite, contentDescription = null, tint = SekaCoralPrimary, modifier = Modifier.size(12.dp))
            Spacer(modifier = Modifier.width(3.dp))
            Text(text = "${post.likesCount}", fontSize = 10.sp, color = SekaTextMuted)
          }

          Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Default.Download, contentDescription = null, tint = SekaYellowAccent, modifier = Modifier.size(12.dp))
            Spacer(modifier = Modifier.width(3.dp))
            Text(text = "${post.downloadsCount}", fontSize = 10.sp, color = SekaTextMuted)
          }
        }
      }
    }
  }
}
