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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.ChatBubble
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.PhotoLibrary
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
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
import com.example.data.ChatMessage
import com.example.data.ChatThread
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
fun ChatScreen(
  threads: List<ChatThread>,
  activeThread: ChatThread?,
  messages: List<ChatMessage>,
  currentUser: User,
  onOpenThread: (ChatThread) -> Unit,
  onCloseThread: () -> Unit,
  onSendMessage: (text: String, memeUrl: String?) -> Unit,
  onOpenMemeTray: () -> Unit,
  onShareMemeToStatus: (String) -> Unit
) {
  if (activeThread != null) {
    // Individual Conversation Screen
    ConversationView(
      thread = activeThread,
      messages = messages,
      onBack = onCloseThread,
      onSendMessage = onSendMessage,
      onOpenMemeTray = onOpenMemeTray,
      onShareMemeToStatus = onShareMemeToStatus
    )
  } else {
    // Chat Thread List View
    ThreadListView(
      threads = threads,
      onOpenThread = onOpenThread
    )
  }
}

@Composable
private fun ThreadListView(
  threads: List<ChatThread>,
  onOpenThread: (ChatThread) -> Unit
) {
  Column(
    modifier = Modifier
      .fillMaxSize()
      .background(SekaBackground)
      .padding(horizontal = 16.dp)
      .testTag("chat_threads_screen")
  ) {
    Spacer(modifier = Modifier.height(16.dp))

    // Title
    Row(
      modifier = Modifier.fillMaxWidth(),
      horizontalArrangement = Arrangement.SpaceBetween,
      verticalAlignment = Alignment.CenterVertically
    ) {
      Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(
          imageVector = Icons.Default.ChatBubble,
          contentDescription = "Chats",
          tint = SekaCoralPrimary,
          modifier = Modifier.size(28.dp)
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(
          text = "Meme Chats",
          style = MaterialTheme.typography.displayLarge.copy(
            fontSize = 24.sp,
            fontWeight = FontWeight.Black
          )
        )
      }

      Surface(
        shape = RoundedCornerShape(12.dp),
        color = SekaSurfaceVariant
      ) {
        Text(
          text = "Meme-Native ⚡",
          style = MaterialTheme.typography.labelMedium.copy(
            color = SekaYellowAccent,
            fontWeight = FontWeight.Bold,
            fontSize = 11.sp
          ),
          modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
        )
      }
    }

    Spacer(modifier = Modifier.height(16.dp))

    LazyColumn(
      verticalArrangement = Arrangement.spacedBy(10.dp),
      contentPadding = PaddingValues(bottom = 100.dp)
    ) {
      items(threads, key = { it.id }) { thread ->
        Card(
          shape = RoundedCornerShape(16.dp),
          colors = CardDefaults.cardColors(containerColor = SekaSurface),
          modifier = Modifier
            .fillMaxWidth()
            .clickable { onOpenThread(thread) }
            .testTag("chat_thread_item_${thread.id}")
        ) {
          Row(
            modifier = Modifier
              .fillMaxWidth()
              .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
          ) {
            Box {
              AsyncImage(
                model = ImageRequest.Builder(LocalContext.current)
                  .data(thread.avatarUrl)
                  .crossfade(true)
                  .build(),
                contentDescription = thread.name,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                  .size(50.dp)
                  .clip(CircleShape)
                  .border(1.5.dp, SekaCoralPrimary, CircleShape)
              )

              if (thread.isGroup) {
                Box(
                  modifier = Modifier
                    .size(16.dp)
                    .clip(CircleShape)
                    .background(SekaYellowAccent)
                    .align(Alignment.BottomEnd),
                  contentAlignment = Alignment.Center
                ) {
                  Text("👥", fontSize = 9.sp)
                }
              }
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
              Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
              ) {
                Text(
                  text = thread.name,
                  style = MaterialTheme.typography.titleMedium.copy(
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = Color.White
                  )
                )

                Text(
                  text = thread.lastMessageTime,
                  style = MaterialTheme.typography.bodyMedium.copy(
                    fontSize = 11.sp,
                    color = SekaTextMuted
                  )
                )
              }

              Spacer(modifier = Modifier.height(4.dp))

              Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
              ) {
                Text(
                  text = thread.lastMessage,
                  style = MaterialTheme.typography.bodyMedium.copy(
                    fontSize = 13.sp,
                    color = if (thread.unreadCount > 0) Color.White else SekaTextMuted,
                    fontWeight = if (thread.unreadCount > 0) FontWeight.Bold else FontWeight.Normal
                  ),
                  maxLines = 1,
                  modifier = Modifier.weight(1f)
                )

                if (thread.unreadCount > 0) {
                  Badge(
                    containerColor = SekaCoralPrimary,
                    contentColor = Color.White
                  ) {
                    Text(thread.unreadCount.toString(), fontSize = 11.sp)
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

@Composable
private fun ConversationView(
  thread: ChatThread,
  messages: List<ChatMessage>,
  onBack: () -> Unit,
  onSendMessage: (text: String, memeUrl: String?) -> Unit,
  onOpenMemeTray: () -> Unit,
  onShareMemeToStatus: (String) -> Unit
) {
  var messageInput by remember { mutableStateOf("") }

  Column(
    modifier = Modifier
      .fillMaxSize()
      .background(SekaBackground)
      .testTag("chat_conversation_screen")
  ) {
    // Conversation Top Header
    Surface(
      color = SekaSurface,
      modifier = Modifier.fillMaxWidth()
    ) {
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .padding(horizontal = 8.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          IconButton(onClick = onBack) {
            Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
          }

          AsyncImage(
            model = ImageRequest.Builder(LocalContext.current)
              .data(thread.avatarUrl)
              .crossfade(true)
              .build(),
            contentDescription = thread.name,
            contentScale = ContentScale.Crop,
            modifier = Modifier
              .size(38.dp)
              .clip(CircleShape)
          )

          Spacer(modifier = Modifier.width(10.dp))

          Column {
            Text(
              text = thread.name,
              style = MaterialTheme.typography.titleMedium.copy(
                fontWeight = FontWeight.Bold,
                fontSize = 15.sp,
                color = Color.White
              )
            )
            Text(
              text = "Online • Meme Drop Ready ⚡",
              style = MaterialTheme.typography.labelMedium.copy(
                fontSize = 11.sp,
                color = SekaYellowAccent
              )
            )
          }
        }

        IconButton(onClick = {}) {
          Icon(Icons.Default.MoreVert, contentDescription = "Menu", tint = SekaTextMuted)
        }
      }
    }

    // Message Bubbles List
    LazyColumn(
      modifier = Modifier
        .weight(1f)
        .padding(horizontal = 14.dp, vertical = 8.dp),
      verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
      items(messages, key = { it.id }) { msg ->
        val isMine = msg.isMine

        Column(
          horizontalAlignment = if (isMine) Alignment.End else Alignment.Start,
          modifier = Modifier.fillMaxWidth()
        ) {
          if (!isMine) {
            Text(
              text = msg.senderName,
              style = MaterialTheme.typography.labelMedium.copy(
                color = SekaTextMuted,
                fontSize = 11.sp
              ),
              modifier = Modifier.padding(start = 4.dp, bottom = 2.dp)
            )
          }

          Surface(
            shape = RoundedCornerShape(
              topStart = 16.dp,
              topEnd = 16.dp,
              bottomStart = if (isMine) 16.dp else 4.dp,
              bottomEnd = if (isMine) 4.dp else 16.dp
            ),
            color = if (isMine) SekaCoralPrimary else SekaSurfaceVariant,
            modifier = Modifier.width(if (msg.memeUrl != null) 240.dp else androidx.compose.ui.unit.Dp.Unspecified)
          ) {
            Column(modifier = Modifier.padding(if (msg.memeUrl != null) 6.dp else 12.dp)) {
              if (msg.memeUrl != null) {
                Box(
                  modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(4f / 3f)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color.Black)
                ) {
                  AsyncImage(
                    model = ImageRequest.Builder(LocalContext.current)
                      .data(msg.memeUrl)
                      .crossfade(true)
                      .build(),
                    contentDescription = "Embedded Meme",
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                  )

                  // Watermark badge
                  Box(
                    modifier = Modifier
                      .align(Alignment.BottomEnd)
                      .padding(6.dp)
                      .clip(RoundedCornerShape(4.dp))
                      .background(Color.Black.copy(alpha = 0.75f))
                      .padding(horizontal = 4.dp, vertical = 2.dp)
                  ) {
                    Text("⚡ Seka", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Color.White)
                  }
                }

                Row(
                  modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 4.dp, start = 4.dp, end = 4.dp),
                  horizontalArrangement = Arrangement.End
                ) {
                  Text(
                    text = "Tap & hold to re-status",
                    fontSize = 10.sp,
                    color = Color.White.copy(alpha = 0.8f),
                    modifier = Modifier.clickable { onShareMemeToStatus(msg.memeUrl) }
                  )
                }
              }

              if (msg.text.isNotBlank()) {
                Text(
                  text = msg.text,
                  style = MaterialTheme.typography.bodyLarge.copy(
                    fontSize = 14.sp,
                    color = Color.White
                  ),
                  modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                )
              }
            }
          }

          Text(
            text = msg.timestamp,
            style = MaterialTheme.typography.labelMedium.copy(
              fontSize = 10.sp,
              color = SekaTextMuted
            ),
            modifier = Modifier.padding(top = 2.dp, start = 4.dp, end = 4.dp)
          )
        }
      }
    }

    // Composer Bar with Dedicated Meme Tray Button!
    Surface(
      color = SekaSurface,
      modifier = Modifier
        .fillMaxWidth()
        .padding(bottom = 60.dp)
    ) {
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .padding(horizontal = 12.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
      ) {
        // Dedicated Meme Tray Trigger Button
        Surface(
          shape = CircleShape,
          color = SekaCoralPrimary.copy(alpha = 0.2f),
          modifier = Modifier
            .clickable { onOpenMemeTray() }
            .testTag("open_meme_tray_button")
        ) {
          Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 8.dp)
          ) {
            Icon(
              imageVector = Icons.Default.Bolt,
              contentDescription = "Meme Tray",
              tint = SekaYellowAccent,
              modifier = Modifier.size(18.dp)
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(
              text = "Memes",
              style = MaterialTheme.typography.labelMedium.copy(
                color = SekaYellowAccent,
                fontWeight = FontWeight.Bold,
                fontSize = 12.sp
              )
            )
          }
        }

        Spacer(modifier = Modifier.width(8.dp))

        OutlinedTextField(
          value = messageInput,
          onValueChange = { messageInput = it },
          placeholder = { Text("Message...", color = SekaTextMuted, fontSize = 13.sp) },
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
            .testTag("chat_input_text_field")
        )

        Spacer(modifier = Modifier.width(8.dp))

        IconButton(
          onClick = {
            if (messageInput.isNotBlank()) {
              onSendMessage(messageInput, null)
              messageInput = ""
            }
          },
          modifier = Modifier
            .size(44.dp)
            .clip(CircleShape)
            .background(SekaCoralPrimary)
            .testTag("send_chat_message_button")
        ) {
          Icon(
            imageVector = Icons.Default.Send,
            contentDescription = "Send",
            tint = Color.White,
            modifier = Modifier.size(18.dp)
          )
        }
      }
    }
  }
}
