package com.example.utils

import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.Typeface
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import androidx.core.content.FileProvider
import java.io.File
import java.io.FileOutputStream
import java.io.OutputStream

object MemeWatermarkUtil {

  /**
   * Composites the official "Seka" watermark badge onto the bottom-right corner
   * of any image or meme frame.
   * Watermark details: ~70% opacity dark capsule background, Electric Coral / Neon Yellow
   * Seka wordmark text, positioned nicely with padded margins.
   */
  fun addSekaWatermark(sourceBitmap: Bitmap): Bitmap {
    val width = sourceBitmap.width
    val height = sourceBitmap.height
    val result = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(result)

    // 1. Draw original meme image
    canvas.drawBitmap(sourceBitmap, 0f, 0f, null)

    // 2. Prepare paints for Watermark Badge
    val scaleFactor = (width.coerceAtMost(height) / 600f).coerceIn(0.6f, 3.0f)
    val paddingHorizontal = 24f * scaleFactor
    val paddingVertical = 14f * scaleFactor
    val cornerRadius = 12f * scaleFactor
    val textSize = 22f * scaleFactor

    val textPaint = Paint().apply {
      color = Color.WHITE
      this.textSize = textSize
      typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
      isAntiAlias = true
    }

    val brandAccentPaint = Paint().apply {
      color = Color.parseColor("#FF3366") // Seka Electric Coral
      this.textSize = textSize * 0.9f
      typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
      isAntiAlias = true
    }

    val text = "Seka"
    val badgeSymbol = "⚡ "
    val textWidth = textPaint.measureText(text)
    val symbolWidth = brandAccentPaint.measureText(badgeSymbol)
    val totalContentWidth = symbolWidth + textWidth

    val badgeWidth = totalContentWidth + (paddingHorizontal * 2)
    val badgeHeight = textSize + (paddingVertical * 2)

    val margin = 20f * scaleFactor
    val right = width - margin
    val bottom = height - margin
    val left = right - badgeWidth
    val top = bottom - badgeHeight

    // 3. Draw subtle semi-transparent dark rounded background (70% opacity)
    val bgPaint = Paint().apply {
      color = Color.argb(180, 13, 14, 18) // #B30D0E12
      style = Paint.Style.FILL
      isAntiAlias = true
    }
    val bgRect = RectF(left, top, right, bottom)
    canvas.drawRoundRect(bgRect, cornerRadius, cornerRadius, bgPaint)

    // 4. Draw subtle outline border
    val borderPaint = Paint().apply {
      color = Color.argb(120, 255, 51, 102) // Semi-transparent Coral border
      style = Paint.Style.STROKE
      strokeWidth = 2f * scaleFactor
      isAntiAlias = true
    }
    canvas.drawRoundRect(bgRect, cornerRadius, cornerRadius, borderPaint)

    // 5. Draw brand symbol "⚡ " and wordmark "Seka" inside badge
    val textX = left + paddingHorizontal
    val textY = top + paddingVertical + textSize - (textSize * 0.15f)

    canvas.drawText(badgeSymbol, textX, textY, brandAccentPaint)
    canvas.drawText(text, textX + symbolWidth, textY, textPaint)

    return result
  }

  /**
   * Saves watermarked bitmap directly to device gallery MediaStore.
   */
  fun saveToGallery(context: Context, bitmap: Bitmap, title: String): Uri? {
    val filename = "Seka_Meme_${System.currentTimeMillis()}.png"
    var fos: OutputStream? = null
    var imageUri: Uri? = null

    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        val resolver = context.contentResolver
        val contentValues = ContentValues().apply {
          put(MediaStore.MediaColumns.DISPLAY_NAME, filename)
          put(MediaStore.MediaColumns.MIME_TYPE, "image/png")
          put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/SekaMemes")
        }
        imageUri = resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, contentValues)
        if (imageUri != null) {
          fos = resolver.openOutputStream(imageUri)
        }
      } else {
        val imagesDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES).toString() + "/SekaMemes"
        val file = File(imagesDir)
        if (!file.exists()) file.mkdirs()
        val imageFile = File(imagesDir, filename)
        fos = FileOutputStream(imageFile)
        imageUri = Uri.fromFile(imageFile)
      }

      fos?.use {
        bitmap.compress(Bitmap.CompressFormat.PNG, 100, it)
      }
    } catch (e: Exception) {
      e.printStackTrace()
    }

    return imageUri
  }

  /**
   * Shares watermarked meme via Android System Share Sheet.
   */
  fun shareWatermarkedMeme(context: Context, bitmap: Bitmap, caption: String) {
    try {
      val cachePath = File(context.cacheDir, "shared_memes")
      cachePath.mkdirs()
      val stream = FileOutputStream(File(cachePath, "seka_shared_meme.png"))
      bitmap.compress(Bitmap.CompressFormat.PNG, 100, stream)
      stream.close()

      val newFile = File(cachePath, "seka_shared_meme.png")
      val contentUri: Uri = FileProvider.getUriForFile(
        context,
        "${context.packageName}.fileprovider",
        newFile
      )

      val shareIntent = Intent(Intent.ACTION_SEND).apply {
        type = "image/png"
        putExtra(Intent.EXTRA_STREAM, contentUri)
        putExtra(Intent.EXTRA_TEXT, "$caption\n\nShared via Seka — The Home For Memes ⚡")
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
      }

      val chooser = Intent.createChooser(shareIntent, "Share Meme with Seka Watermark")
      chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.startActivity(chooser)
    } catch (e: Exception) {
      e.printStackTrace()
    }
  }
}
