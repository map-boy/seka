package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ChatBubble
import androidx.compose.material.icons.filled.ChatBubbleOutline
import androidx.compose.material.icons.filled.Explore
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PersonOutline
import androidx.compose.material.icons.outlined.Explore
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.SekaBorder
import com.example.ui.theme.SekaCoralPrimary
import com.example.ui.theme.SekaSurface
import com.example.ui.theme.SekaTextMuted
import com.example.ui.theme.SekaTextPrimary
import com.example.ui.theme.SekaYellowAccent
import com.example.ui.viewmodel.SekaTab

@Composable
fun SekaBottomNav(
  currentTab: SekaTab,
  onTabSelected: (SekaTab) -> Unit,
  unreadChatCount: Int = 3
) {
  Surface(
    color = SekaSurface,
    tonalElevation = 8.dp,
    shadowElevation = 16.dp,
    modifier = Modifier.fillMaxWidth()
  ) {
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .windowInsetsPadding(WindowInsets.navigationBars)
        .padding(horizontal = 8.dp, vertical = 6.dp),
      horizontalArrangement = Arrangement.SpaceAround,
      verticalAlignment = Alignment.CenterVertically
    ) {
      // Home Tab
      NavItem(
        label = "Home",
        selectedIcon = Icons.Filled.Home,
        unselectedIcon = Icons.Outlined.Home,
        isSelected = currentTab == SekaTab.HOME,
        onClick = { onTabSelected(SekaTab.HOME) },
        testTag = "nav_tab_home"
      )

      // Discover Tab
      NavItem(
        label = "Discover",
        selectedIcon = Icons.Filled.Explore,
        unselectedIcon = Icons.Outlined.Explore,
        isSelected = currentTab == SekaTab.DISCOVER,
        onClick = { onTabSelected(SekaTab.DISCOVER) },
        testTag = "nav_tab_discover"
      )

      // Prominent Center CREATE FAB
      Box(
        modifier = Modifier
          .size(52.dp)
          .clip(CircleShape)
          .background(SekaCoralPrimary)
          .clickable { onTabSelected(SekaTab.CREATE) }
          .testTag("nav_tab_create_fab"),
        contentAlignment = Alignment.Center
      ) {
        Icon(
          imageVector = Icons.Default.Add,
          contentDescription = "Create Meme",
          tint = Color.White,
          modifier = Modifier.size(28.dp)
        )
      }

      // Chat Tab
      NavItem(
        label = "Chat",
        selectedIcon = Icons.Filled.ChatBubble,
        unselectedIcon = Icons.Filled.ChatBubbleOutline,
        isSelected = currentTab == SekaTab.CHAT,
        badgeCount = unreadChatCount,
        onClick = { onTabSelected(SekaTab.CHAT) },
        testTag = "nav_tab_chat"
      )

      // Profile Tab
      NavItem(
        label = "Profile",
        selectedIcon = Icons.Filled.Person,
        unselectedIcon = Icons.Filled.PersonOutline,
        isSelected = currentTab == SekaTab.PROFILE,
        onClick = { onTabSelected(SekaTab.PROFILE) },
        testTag = "nav_tab_profile"
      )
    }
  }
}

@Composable
private fun NavItem(
  label: String,
  selectedIcon: ImageVector,
  unselectedIcon: ImageVector,
  isSelected: Boolean,
  badgeCount: Int = 0,
  onClick: () -> Unit,
  testTag: String
) {
  Column(
    horizontalAlignment = Alignment.CenterHorizontally,
    verticalArrangement = Arrangement.Center,
    modifier = Modifier
      .clip(RoundedCornerShape(12.dp))
      .clickable { onClick() }
      .padding(horizontal = 12.dp, vertical = 6.dp)
      .testTag(testTag)
  ) {
    if (badgeCount > 0) {
      BadgedBox(
        badge = {
          Badge(
            containerColor = SekaCoralPrimary,
            contentColor = Color.White
          ) {
            Text(badgeCount.toString())
          }
        }
      ) {
        Icon(
          imageVector = if (isSelected) selectedIcon else unselectedIcon,
          contentDescription = label,
          tint = if (isSelected) SekaCoralPrimary else SekaTextMuted,
          modifier = Modifier.size(22.dp)
        )
      }
    } else {
      Icon(
        imageVector = if (isSelected) selectedIcon else unselectedIcon,
        contentDescription = label,
        tint = if (isSelected) SekaCoralPrimary else SekaTextMuted,
        modifier = Modifier.size(22.dp)
      )
    }

    Text(
      text = label,
      style = MaterialTheme.typography.labelMedium.copy(
        fontSize = 11.sp,
        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
        color = if (isSelected) SekaCoralPrimary else SekaTextMuted
      ),
      modifier = Modifier.padding(top = 2.dp)
    )
  }
}
