package com.example.data

import android.content.Context
import androidx.room.Dao
import androidx.room.Database
import androidx.room.Entity
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.PrimaryKey
import androidx.room.Query
import androidx.room.Room
import androidx.room.RoomDatabase
import kotlinx.coroutines.flow.Flow

@Entity(tableName = "saved_memes")
data class SavedMemeEntity(
  @PrimaryKey val id: String,
  val title: String,
  val mediaUrl: String,
  val category: String,
  val timestamp: Long = System.currentTimeMillis()
)

@Entity(tableName = "local_posts")
data class LocalPostEntity(
  @PrimaryKey val id: String,
  val creatorName: String,
  val creatorHandle: String,
  val creatorAvatar: String,
  val type: String, // "IMAGE" or "VIDEO_REEL"
  val mediaUrl: String,
  val caption: String,
  val category: String,
  val likesCount: Int,
  val commentsCount: Int,
  val sharesCount: Int,
  val downloadsCount: Int,
  val isLiked: Boolean = false,
  val isSaved: Boolean = false,
  val reactionEmoji: String? = null
)

@Entity(tableName = "chat_messages")
data class ChatMessageEntity(
  @PrimaryKey val id: String,
  val threadId: String,
  val senderName: String,
  val text: String,
  val memeUrl: String?,
  val timestamp: String,
  val isMine: Boolean
)

@Dao
interface MemeDao {
  // Saved Memes
  @Query("SELECT * FROM saved_memes ORDER BY timestamp DESC")
  fun getAllSavedMemes(): Flow<List<SavedMemeEntity>>

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertSavedMeme(meme: SavedMemeEntity)

  @Query("DELETE FROM saved_memes WHERE id = :id")
  suspend fun deleteSavedMeme(id: String)

  // Posts
  @Query("SELECT * FROM local_posts")
  fun getAllPosts(): Flow<List<LocalPostEntity>>

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertPost(post: LocalPostEntity)

  // Chat Messages
  @Query("SELECT * FROM chat_messages WHERE threadId = :threadId ORDER BY id ASC")
  fun getMessagesForThread(threadId: String): Flow<List<ChatMessageEntity>>

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertMessage(msg: ChatMessageEntity)
}

@Database(
  entities = [SavedMemeEntity::class, LocalPostEntity::class, ChatMessageEntity::class],
  version = 1,
  exportSchema = false
)
abstract class SekaDatabase : RoomDatabase() {
  abstract fun memeDao(): MemeDao

  companion object {
    @Volatile
    private var INSTANCE: SekaDatabase? = null

    fun getDatabase(context: Context): SekaDatabase {
      return INSTANCE ?: synchronized(this) {
        val instance = Room.databaseBuilder(
          context.applicationContext,
          SekaDatabase::class.java,
          "seka_meme_db"
        ).fallbackToDestructiveMigration().build()
        INSTANCE = instance
        instance
      }
    }
  }
}
